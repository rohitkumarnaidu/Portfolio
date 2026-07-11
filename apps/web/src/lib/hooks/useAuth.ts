'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login as apiLogin, refreshToken as apiRefresh } from '@/lib/api';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiLogin(email, password),
    onSuccess: (data) => {
      localStorage.setItem('admin_access_token', data.access_token);
      localStorage.setItem('admin_refresh_token', data.refresh_token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      queryClient.invalidateQueries();
    },
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: (refreshToken: string) => apiRefresh(refreshToken),
  });
}
