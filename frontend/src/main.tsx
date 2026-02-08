import { createRoot } from 'react-dom/client';

import '@/index.css';

import App from '@/App.tsx';
import { AuthProvider } from '@/context/AuthContext';
import { ToastMessageProvider } from '@/shared/context/ToastMessageContext';
createRoot(document.getElementById('root')!).render(
  <ToastMessageProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ToastMessageProvider>,
);
