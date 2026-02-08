// hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';

interface User {
  _id: string;
  name: string;
  email?: string;
  picture?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const verifyToken = useCallback(async (token: string) => {
    try {
      const res = await fetch('http://localhost:5000/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.user) return data.user;
      return null;
    } catch {
      return null;
    }
  }, []);

  const refreshToken = useCallback(async (token: string) => {
    try {
      const res = await fetch('http://localhost:5000/auth/refresh', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('nnitToken', data.token);
        return data.user;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const initAuth = async () => {
      let token = localStorage.getItem('nnitToken');
      if (!token) {
        setLoading(false);
        return;
      }

      let currentUser = await verifyToken(token);
      if (!currentUser) {
        currentUser = await refreshToken(token);
        token = localStorage.getItem('nnitToken'); // update token
      }

      if (!currentUser) {
        localStorage.removeItem('nnitToken');
      } else {
        setUser(currentUser);

        // Set up auto-refresh: every 5 minutes (adjust as needed)
        interval = setInterval(async () => {
          const newUser = await refreshToken(token!);
          if (newUser) setUser(newUser);
        }, 5 * 60 * 1000);
      }

      setLoading(false);
    };

    initAuth();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [verifyToken, refreshToken]);

  return { user, loading };
}
