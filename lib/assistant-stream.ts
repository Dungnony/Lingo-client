import type { AssistantAction } from "./types";

export interface AssistantStreamHandlers {
  onDelta: (delta: string) => void;
  onDone: (sessionId: string, action?: AssistantAction) => void;
  onError: () => void;
}

/** The subset of `EventSource` the stream relies on. */
export interface StreamSource {
  onmessage: ((event: MessageEvent<string>) => void) | null;
  onerror: ((event: Event) => void) | null;
  close(): void;
}

interface OpenStreamOptions {
  sessionId: string | undefined;
  /** Resolves once the access cookie is valid; rejects when the session is gone. */
  ensureSession: () => Promise<unknown>;
  createSource: () => StreamSource;
  handlers: AssistantStreamHandlers;
}

/**
 * `EventSource` hides the HTTP status and cannot refresh on a 401, so a learner
 * idle past the access token's lifetime would see a false network error. Hitting
 * a normal API route first lets `apiFetch` refresh the cookie before streaming.
 *
 * Returns a function that closes the stream, even if it has not opened yet.
 */
export function openAssistantStream({
  sessionId,
  ensureSession,
  createSource,
  handlers,
}: OpenStreamOptions): () => void {
  let closed = false;
  let source: StreamSource | null = null;

  ensureSession().then(
    () => {
      if (closed) return;
      const es = createSource();
      source = es;
      es.onmessage = (event) => {
        let payload: {
          delta?: string;
          done?: boolean;
          sessionId?: string;
          action?: AssistantAction;
        };
        try {
          payload = JSON.parse(event.data);
        } catch {
          return;
        }
        if (payload.delta) handlers.onDelta(payload.delta);
        if (payload.done) {
          handlers.onDone(payload.sessionId ?? sessionId ?? "", payload.action);
          es.close();
        }
      };
      es.onerror = () => {
        handlers.onError();
        es.close();
      };
    },
    () => {
      if (!closed) handlers.onError();
    },
  );

  return () => {
    closed = true;
    source?.close();
  };
}
