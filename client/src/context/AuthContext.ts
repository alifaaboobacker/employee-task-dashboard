import { createContext } from 'react';
import type { Admin } from '@/types';

export interface AuthContextValue {
  admin: Admin | null;
  isLoading: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
