import { createRoot } from 'react-dom/client';

import { QueryClientProvider } from '@tanstack/react-query';

import '@/index.css';

import App from '@/App.tsx';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ToastMessageProvider } from '@/shared/context/ToastMessageContext';
import { queryClient } from '@/shared/hooks/queries/queryClient';
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ToastMessageProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastMessageProvider>
  </QueryClientProvider>,
);
