import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router';

import CoverLetterQnAFriendsPage from '@/pages//CoverLetterQnAFriendsPage';
import CoverLetterLandingPage from '@/pages/CoverLetterLandingPage';
import HomePage from '@/pages/HomePage';
import LibraryPage from '@/pages/LibraryPage';
import LoginPage from '@/pages/LoginPage';
import ReviewPage from '@/pages/ReviewPage';
import SignUpPage from '@/pages/SignUpPage';
import UploadPage from '@/pages/UploadPage';

import SignUpComplete from '@/features/auth/components/SignUpComplete';
import CoverLetterEditContent from '@/features/coverLetter/components/CoverLetterEditContent';
import NewCoverLetterContent from '@/features/coverLetter/components/NewCoverLetterContent';
import CoverLetterLayout from '@/features/coverLetter/layouts/CoverLetterLayout';
import WriteSidebarLayout from '@/features/coverLetter/layouts/WriteSidebarLayout';
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
            <Route path='/library' element={<LibraryPage />} />
            <Route path='/cover-letter' element={<CoverLetterLayout />}>
              <Route
                path='/cover-letter/list'
                element={<CoverLetterLandingPage />}
              />
              <Route element={<WriteSidebarLayout />}>
                <Route
                  path='/cover-letter/new'
                  element={<NewCoverLetterContent />}
                />
                <Route
                  path='/cover-letter/edit/:coverLetterId?'
                  element={<CoverLetterEditContent />}
                />
              </Route>
              <Route
                path='/cover-letter/qna-friends/:coverLetterId?'
                element={<CoverLetterQnAFriendsPage />}
              />
            </Route>
          </Route>
          <Route path='/review/:id' element={<ReviewPage />} />
          {/* <Route path='/library?id:' element={<LibraryPage />} /> */}
          {/* <Route path="/recruit" element={<RecruitPage />}/> */}
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
