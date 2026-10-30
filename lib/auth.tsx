"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError } from "./api";
import { useSWRConfig } from "swr";
import type { Me } from "./types";

interface AuthState {
  user: Me | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/** The signed-in user; null when signed out (401); undefined when the request
 * failed for another reason (offline, 5xx), so the known user is kept. */
async function fetchMe(): Promise<Me | null | undefined> {
  try {
    return await api.get<Me>("/users/me");
  } catch (err) {
    return err instanceof ApiError && err.status === 401 ? null : undefined;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { mutate } = useSWRConfig();
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const applyMe = useCallback((me: Me | null | undefined) => {
    if (me !== undefined) setUser(me);
    setLoading(false);
  }, []);

  const refresh = useCallback(
    async () => applyMe(await fetchMe()),
    [applyMe],
  );

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => undefined);
    setUser(null);
    await mutate(() => true, undefined, { revalidate: false });
    try {
      for (const key of Object.keys(sessionStorage)) {
        if (key.startsWith("lingo:quiz:")) sessionStorage.removeItem(key);
      }
    } catch {
      /* Trình duyệt có thể chặn bộ nhớ phiên. */
    }
  }, [mutate]);

  useEffect(() => {
    void fetchMe().then(applyMe);
  }, [applyMe]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải nằm trong <AuthProvider>");
  return ctx;
}

/** Dùng ở đầu mỗi trang cần đăng nhập. Chuyển hướng về /login nếu chưa. */
export function useRequireAuth(): AuthState {
  const auth = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!auth.loading && !auth.user)
      router.replace(
        `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
      );
  }, [auth.loading, auth.user, router]);
  return auth;
}
