import { http } from './http';
import type { Admin } from '@/types';

interface Wrapped<T> {
  success: true;
  data: T;
}

export const login = async (payload: { email: string; password: string }) => {
  const { data } = await http.post<Wrapped<Admin>>('/auth/login', payload);
  return data.data;
};

export const logout = async () => {
  await http.post('/auth/logout');
};

export const fetchProfile = async () => {
  const { data } = await http.get<Wrapped<Admin>>('/auth/me');
  return data.data;
};
