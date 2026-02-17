import { Navigate } from 'react-router';

const RecruitRedirect = () => {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  return <Navigate to={`/recruit/${y}/${m}/${d}`} replace />;
};

export default RecruitRedirect;
