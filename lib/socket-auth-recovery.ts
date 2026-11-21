/** Socket.IO does not auto-reconnect after the server closes the connection. */
const SERVER_DISCONNECT = "io server disconnect";
/** A connection dropped sooner than this was most likely rejected at handshake. */
const STABLE_CONNECTION_MS = 5_000;
/** Bounds the retries when a fresh token still gets rejected. */
const MAX_RECOVERY_ATTEMPTS = 3;

export interface RecoverableSocket {
  connect(): unknown;
  on(event: "connect", listener: () => void): unknown;
  on(event: "disconnect", listener: (reason: string) => void): unknown;
}

interface RecoveryOptions {
  refresh: () => Promise<boolean>;
  now?: () => number;
}

/**
 * The gateway authenticates from the short-lived access cookie and disconnects
 * the socket when it has expired, which happens on any reconnect after a network
 * drop. Without this, realtime stays dead until the page is reloaded.
 *
 * Returns a function that stops recovering, so logging out cannot revive the socket.
 */
export function watchSocketAuth(
  socket: RecoverableSocket,
  { refresh, now = Date.now }: RecoveryOptions,
): () => void {
  let stopped = false;
  let lastActiveAt = 0;
  let attempts = 0;

  socket.on("connect", () => {
    lastActiveAt = now();
  });

  socket.on("disconnect", (reason) => {
    if (stopped || reason !== SERVER_DISCONNECT) return;
    const timestamp = now();
    attempts =
      lastActiveAt > 0 && timestamp - lastActiveAt < STABLE_CONNECTION_MS
        ? attempts + 1
        : 1;
    lastActiveAt = timestamp;
    if (attempts > MAX_RECOVERY_ATTEMPTS) {
      console.warn("Realtime: server keeps rejecting the socket, giving up");
      return;
    }
    refresh()
      .then((ok) => {
        if (ok && !stopped) socket.connect();
      })
      .catch((err: unknown) => {
        console.warn("Realtime: session refresh failed", err);
      });
  });

  return () => {
    stopped = true;
  };
}
