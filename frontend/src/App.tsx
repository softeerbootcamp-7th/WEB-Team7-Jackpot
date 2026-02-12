import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import CoverLetterQnAFriendsPage from '@/pages//CoverLetterQnAFriendsPage';
import CoverLetterLandingPage from '@/pages/CoverLetterLandingPage';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import ReviewPage from '@/pages/ReviewPage';
import SignUpCompletePage from '@/pages/SignUpCompletePage';
import SignUpPage from '@/pages/SignUpPage';
import UploadPage from '@/pages/UploadPage';

import CoverLetterEditContent from '@/features/coverLetter/components/CoverLetterEditContent';
import NewCoverLetterContent from '@/features/coverLetter/components/NewCoverLetterContent';
import CoverLetterLayout from '@/features/coverLetter/layouts/CoverLetterLayout';
import WriteSidebarLayout from '@/features/coverLetter/layouts/WriteSidebarLayout';
import DetailView from '@/features/library/components/DetailView';
import LibraryLayout from '@/features/library/components/LibraryLayout';
import LibrarySidebarLayout from '@/features/library/components/LibrarySidebarLayout';
import { emptyCaseText } from '@/features/library/constants';
import EmptyCase from '@/shared/components/EmptyCase';
import RootLayout from '@/shared/components/RootLayout';
import { queryClient } from '@/shared/queries/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignUpPage />} />
          <Route element={<RootLayout />}>
            {/* <Route path="/" element={<LandingPage />}/> */}
            <Route path='/home' element={<HomePage />} />
            <Route path='/upload' element={<UploadPage />} />
            <Route path='/library' element={<LibraryLayout />}>
              {/* [박소민] /library로 접속시 자동으로 /library/company로 이동 */}
              {/* TODO: 렌더링을 최소화할 수 있는 방법이 없는지 확인 (라우팅 변경해도 됨) */}
              <Route
                index
                element={<Navigate to='/library/company' replace />}
              />
              <Route element={<LibrarySidebarLayout />}>
                <Route path='company'>
                  <Route
                    index
                    element={<EmptyCase {...emptyCaseText.folder} />}
                  />
                  <Route
                    path=':companyName'
                    element={<EmptyCase {...emptyCaseText.folder} />}
                  />
                  <Route
                    path=':companyName/:coverLetterId'
                    element={<DetailView />}
                  />
                </Route>
                <Route path='qna'>
                  <Route
                    index
                    element={<EmptyCase {...emptyCaseText.folder} />}
                  />
                  <Route
                    path=':qnAName'
                    element={<EmptyCase {...emptyCaseText.folder} />}
                  />
                  <Route path=':qnAName/:qnAId' element={<DetailView />} />
                </Route>
              </Route>
            </Route>
            <Route path='/review/:coverLetterId' element={<ReviewPage />} />

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
          {/* <Route path="/recruit" element={<RecruitPage />}/> */}
          <Route path='/' element={<LandingPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignUpPage />} />
          <Route path='/signup/complete' element={<SignUpCompletePage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
