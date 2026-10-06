import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ApiError } from '@/api/http';
import { AuthProvider } from '@/context/AuthProvider';
import { AppRoutes } from '@/routes/router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        error instanceof ApiError && error.status >= 500 ? failureCount < 2 : false,
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
  },
});

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '0.75rem',
              border: '1px solid #dde7f0',
              color: '#0f2338',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
