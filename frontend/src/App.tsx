import { Suspense } from 'react';

import { BrowserRouter } from 'react-router';

import AppRoutes from '@/AppRoutes';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import LoadingModal from '@/shared/components/modal/LoadingModal';
import SectionError from '@/shared/components/SectionError';

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary
        fallback={(reset) => (
          <div className='flex h-screen w-full items-center justify-center'>
            <SectionError onRetry={reset} text='페이지를 표시할 수 없습니다.' />
          </div>
        )}
      >
        <Suspense fallback={<LoadingModal isLoading={true} message='Narratix' />}>
          <AppRoutes />
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
