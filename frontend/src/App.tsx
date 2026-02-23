import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import CoverLetterLandingPage from '@/pages/CoverLetterLandingPage';
import HomePage from '@/pages/HomePage';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import RecruitPage from '@/pages/RecruitPage';
import ReviewPage from '@/pages/ReviewPage';
import SignUpCompletePage from '@/pages/SignUpCompletePage';
import SignUpPage from '@/pages/SignUpPage';
import UploadPage from '@/pages/UploadPage';

import CoverLetterReviewContent from '@/features/coverLetter/components/editor/CoverLetterReviewContent';
import NewCoverLetterContainer from '@/features/coverLetter/components/newCoverLetter/NewCoverLetterContainer';
import CoverLetterLayout from '@/features/coverLetter/layouts/CoverLetterLayout';
import WriteSidebarLayout from '@/features/coverLetter/layouts/WriteSidebarLayout';
import CompanyDetailView from '@/features/library/components/company/CompanyDetailView';
import QnADetailView from '@/features/library/components/qna/QnADetailView';
import LibraryLayout from '@/features/library/layouts/LibraryLayout';
import LibrarySidebarLayout from '@/features/library/layouts/LibrarySidebarLayout';
import RecruitRedirect from '@/features/recruit/components/RecruitRedirect';
import LabelingResultSection from '@/features/upload/components/LabelingResultSection';
import UploadCompleteSection from '@/features/upload/components/UploadCompleteSection';
import UploadInputSection from '@/features/upload/components/UploadInputSection';
import EmptyCase from '@/shared/components/EmptyCase';
import PrivateGuard from '@/shared/components/PrivateGuard';
import PublicGuard from '@/shared/components/PublicGuard';
import RootLayout from '@/shared/components/RootLayout';
import { coverLetterEmptyCaseText } from '@/shared/constants/coverLetterEmptyCaseText';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicGuard />}>
          <Route path='/' element={<LandingPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignUpPage />} />
          <Route path='/signup/complete' element={<SignUpCompletePage />} />
        </Route>
        <Route element={<PrivateGuard />}>
          <Route element={<RootLayout />}>
            <Route path='/home' element={<HomePage />} />
            <Route path='/upload' element={<UploadPage />}>
              <Route index element={<Navigate to='input' replace />} />
              <Route path='input' element={<UploadInputSection />} />
              <Route
                path='labeling/:jobId/:coverLetterIndex?/:qnAIndex?'
                element={<LabelingResultSection />}
              />
              <Route path='complete' element={<UploadCompleteSection />} />
            </Route>

            <Route path='/library' element={<LibraryLayout />}>
              <Route
                index
                element={<Navigate to='/library/company' replace />}
              />
              <Route element={<LibrarySidebarLayout />}>
                <Route path='company'>
                  <Route
                    index
                    element={<EmptyCase {...coverLetterEmptyCaseText} />}
                  />
                  <Route
                    path=':companyName'
                    element={<EmptyCase {...coverLetterEmptyCaseText} />}
                  />
                  <Route
                    path=':companyName/:coverLetterId'
                    element={<CompanyDetailView />}
                  />
                </Route>
                <Route path='qna'>
                  <Route
                    index
                    element={<EmptyCase {...coverLetterEmptyCaseText} />}
                  />
                  <Route
                    path=':qnAName'
                    element={<EmptyCase {...coverLetterEmptyCaseText} />}
                  />
                  <Route path=':qnAName/:qnAId' element={<QnADetailView />} />
                </Route>
              </Route>
            </Route>

            <Route path='/review/:sharedId' element={<ReviewPage />} />

            <Route path='/cover-letter' element={<CoverLetterLayout />}>
              <Route
                index
                element={<Navigate to='/cover-letter/list' replace />}
              />
              <Route
                path='/cover-letter/list'
                element={<CoverLetterLandingPage />}
              />
              <Route element={<WriteSidebarLayout />}>
                <Route
                  path='/cover-letter/new'
                  element={<NewCoverLetterContainer />}
                />
                <Route
                  path='/cover-letter/edit'
                  element={<Navigate to='/cover-letter/list' replace />}
                />
                <Route
                  path='/cover-letter/edit/:coverLetterId'
                  element={<CoverLetterReviewContent />}
                />
              </Route>
            </Route>
            <Route path='/recruit' element={<RecruitRedirect />} />

            {/* 2. 실제 페이지 (day는 선택 사항) */}
            <Route
              path='/recruit/:year/:month/:day?'
              element={<RecruitPage />}
            />
          </Route>
        </Route>
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
