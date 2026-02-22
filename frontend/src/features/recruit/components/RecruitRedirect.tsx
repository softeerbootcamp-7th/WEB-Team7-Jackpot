import { Navigate } from 'react-router';

const RecruitRedirect = () => {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();

  // padStart로 월과 일을 2자리로 맞춰줌 (예: 2024-06-05)
  return (
    <Navigate
      to={`/recruit/${y}/${m.toString().padStart(2, '0')}/${d.toString().padStart(2, '0')}`}
      replace
    />
  );
};

export default RecruitRedirect;
