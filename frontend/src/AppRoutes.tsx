import { lazy } from 'react';

import { Navigate, Route, Routes } from 'react-router';

import { coverLetterEmptyCaseText } from '@/shared/constants/coverLetterEmptyCaseText';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignUpPage = lazy(() => import('@/pages/SignUpPage'));
const SignUpCompletePage = lazy(() => import('@/pages/SignUpCompletePage'));

const HomePage = lazy(() => import('@/pages/HomePage'));
const UploadPage = lazy(() => import('@/pages/UploadPage'));
const ReviewPage = lazy(() => import('@/pages/ReviewPage'));
const RecruitPage = lazy(() => import('@/pages/RecruitPage'));
const CoverLetterLandingPage = lazy(
  () => import('@/pages/CoverLetterLandingPage'),
);
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const RootLayout = lazy(() => import('@/shared/components/RootLayout'));
const PrivateGuard = lazy(() => import('@/shared/components/PrivateGuard'));
const PublicGuard = lazy(() => import('@/shared/components/PublicGuard'));

const CoverLetterLayout = lazy(
  () => import('@/features/coverLetter/layouts/CoverLetterLayout'),
);
const WriteSidebarLayout = lazy(
  () => import('@/features/coverLetter/layouts/WriteSidebarLayout'),
);

const LibraryLayout = lazy(
  () => import('@/features/library/layouts/LibraryLayout'),
);
const LibrarySidebarLayout = lazy(
  () => import('@/features/library/layouts/LibrarySidebarLayout'),
);

const CoverLetterReviewContent = lazy(
  () =>
    import('@/features/coverLetter/components/editor/CoverLetterReviewContent'),
);
const NewCoverLetterContainer = lazy(
  () =>
    import('@/features/coverLetter/components/newCoverLetter/NewCoverLetterContainer'),
);

const CompanyDetailView = lazy(
  () => import('@/features/library/components/company/CompanyDetailView'),
);
const QnADetailView = lazy(
  () => import('@/features/library/components/qna/QnADetailView'),
);

const UploadInputSection = lazy(
  () => import('@/features/upload/components/UploadInputSection'),
);
const LabelingResultSection = lazy(
  () => import('@/features/upload/components/LabelingResultSection'),
);
const UploadCompleteSection = lazy(
  () => import('@/features/upload/components/UploadCompleteSection'),
);

const RecruitRedirect = lazy(
  () => import('@/features/recruit/components/RecruitRedirect'),
);

const EmptyCase = lazy(() => import('@/shared/components/EmptyCase'));

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicGuard />}>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/signup/complete' element={<SignUpCompletePage />} />
      </Route>

      {/* Private */}
      <Route element={<PrivateGuard />}>
        <Route element={<RootLayout />}>
          <Route path='/home' element={<HomePage />} />

          {/* Upload */}
          <Route path='/upload' element={<UploadPage />}>
            <Route index element={<Navigate to='input' replace />} />
            <Route path='input' element={<UploadInputSection />} />
            <Route
              path='labeling/:jobId/:coverLetterIndex?/:qnAIndex?'
              element={<LabelingResultSection />}
            />
            <Route path='complete' element={<UploadCompleteSection />} />
          </Route>

          {/* Library */}
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

          {/* Review */}
          <Route path='/review/:sharedId' element={<ReviewPage />} />

          {/* Cover Letter */}
          <Route path='/cover-letter' element={<CoverLetterLayout />}>
            <Route
              index
              element={<Navigate to='/cover-letter/list' replace />}
            />
            <Route path='list' element={<CoverLetterLandingPage />} />

            <Route element={<WriteSidebarLayout />}>
              <Route path='new' element={<NewCoverLetterContainer />} />
              <Route
                path='edit'
                element={<Navigate to='/cover-letter/list' replace />}
              />
              <Route
                path='edit/:coverLetterId'
                element={<CoverLetterReviewContent />}
              />
            </Route>
          </Route>

          {/* Recruit */}
          <Route path='/recruit' element={<RecruitRedirect />} />
          <Route
            path='/recruit/:year/:month/:day?'
            element={<RecruitPage />}
          />
        </Route>
      </Route>

      {/* 404 */}
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
