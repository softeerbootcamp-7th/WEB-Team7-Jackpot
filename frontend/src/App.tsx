import { BrowserRouter, Route, Routes } from 'react-router';

import HomePage from '@/pages/HomePage';
import LibraryPage from '@/pages/LibraryPage';
import LoginPage from '@/pages/Login';
import ReviewPage from '@/pages/ReviewPage';
import SignUpPage from '@/pages/SignUp';
import UploadPage from '@/pages/Upload';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<LandingPage />}/> */}
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/home' element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />}/>
        <Route path='/library' element={<LibraryPage />} />
        {/* <Route path="/coverLetter/:id" element={<CoverLetterPage />}/> */}
        <Route path='/review/:id' element={<ReviewPage />} />
        {/* <Route path="/recruit" element={<RecruitPage />}/> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
