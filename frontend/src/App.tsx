import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router';

import CoverLetterLandingPage from '@/pages/CoverLetterLandingPage';
import CoverLetterPage from '@/pages/CoverLetterPage';
import HomePage from '@/pages/HomePage';
import LibraryPage from '@/pages/LibraryPage';
import LoginPage from '@/pages/LoginPage';
import ReviewPage from '@/pages/ReviewPage';
import SignUpPage from '@/pages/SignUpPage';
import UploadPage from '@/pages/UploadPage';

import SignUpComplete from '@/features/auth/components/SignUpComplete';
import RootLayout from '@/shared/components/RootLayout';
import { queryClient } from '@/shared/queries/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path='/home' element={<HomePage />} />
            <Route path='/upload' element={<UploadPage />} />
            <Route path='/cover-letter' element={<CoverLetterLandingPage />} />
            <Route path='/cover-letter/new' element={<CoverLetterPage />} />
            <Route path='/library' element={<LibraryPage />} />
            {/* <Route path='/library?id:' element={<LibraryPage />} /> */}
            <Route path='/coverLetter' element={<CoverLetterPage />} />
            <Route path='/review/:id' element={<ReviewPage />} />
            {/* <Route path="/recruit" element={<RecruitPage />}/> */}
          </Route>
          {/* <Route path="/" element={<LandingPage />}/> */}
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignUpPage />} />
          <Route path='/signup/complete' element={<SignUpComplete />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
