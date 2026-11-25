import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ADMIN_SESSION_KEY = 'ak_admin_session_key';
const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [adminKey, setAdminKey] = useState(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) || '';
    } catch {
      return '';
    }
  });
  const [isAdmin, setIsAdmin] = useState(false);

  // Re-verify any stored session key against the backend on mount
  useEffect(() => {
    if (!adminKey) return;
    let cancelled = false;

    fetch('/api/categories/verify-admin', {
      method: 'POST',
      headers: { 'X-Admin-Key': adminKey },
      credentials: 'same-origin',
    })
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          setAdminKey('');
          try {
            sessionStorage.removeItem(ADMIN_SESSION_KEY);
          } catch {
            // ignore storage errors
          }
        }
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });

    return () => {
      cancelled = true;
    };
  }, [adminKey]);

  const unlockAdmin = useCallback(async (rawKey) => {
    const trimmed = rawKey.trim();
    if (!trimmed) {
      return { ok: false, error: 'Enter the admin key.' };
    }

    try {
      const res = await fetch('/api/categories/verify-admin', {
        method: 'POST',
        headers: { 'X-Admin-Key': trimmed },
        credentials: 'same-origin',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { ok: false, error: data.error || 'Invalid admin key.' };
      }
      setAdminKey(trimmed);
      setIsAdmin(true);
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, trimmed);
      } catch {
        // ignore storage errors
      }
      return { ok: true };
    } catch {
      return { ok: false, error: 'Unable to reach server.' };
    }
  }, []);

  const lockAdmin = useCallback(() => {
    setIsAdmin(false);
    setAdminKey('');
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // ignore storage errors
    }
  }, []);

  const value = useMemo(
    () => ({ isAdmin, adminKey, unlockAdmin, lockAdmin }),
    [isAdmin, adminKey, unlockAdmin, lockAdmin]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return ctx;
}
