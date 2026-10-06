import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '@/api/auth';
import { onUnauthorized } from '@/api/http';
import { AuthContext } from './AuthContext';
import type { Admin } from '@/types';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    authApi
      .fetchProfile()
      .then((profile) => {
        if (active) setAdmin(profile);
      })
      .catch(() => {
        if (active) setAdmin(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () =>
      onUnauthorized(() => {
        setAdmin(null);
        queryClient.clear();
      }),
    [queryClient],
  );

  const signIn = useCallback(
    async (credentials: { email: string; password: string }) => {
      const profile = await authApi.login(credentials);
      setAdmin(profile);
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAdmin(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const value = useMemo(
    () => ({ admin, isLoading, signIn, signOut }),
    [admin, isLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
