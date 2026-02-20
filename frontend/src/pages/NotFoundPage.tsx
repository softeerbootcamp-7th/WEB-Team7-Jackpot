import { useNavigate } from 'react-router';

import NotFoundIllustration from '@/shared/icons/NotFoundIllustration';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main className='flex h-screen w-full max-w-full flex-col items-center justify-center bg-white'>
      <div className='relative aspect-[810/424] w-full max-w-[1000px]'>
        <NotFoundIllustration className='h-full w-full' aria-hidden='true' />
        <div className='absolute top-1/4 left-1/2 inline-flex w-96 max-w-full -translate-x-1/2 flex-col items-center justify-start gap-3'>
          <h1 className='self-stretch text-center text-2xl font-bold text-gray-950'>
            페이지를 찾을 수 없습니다.
          </h1>
          <p className='self-stretch text-center text-lg font-normal text-gray-600'>
            주소가 잘못 입력되었거나, 변경 혹은 삭제되어
            <br />
            요청하신 페이지를 찾을 수 없습니다.
          </p>
        </div>
      </div>
      <button
        type='button'
        onClick={() => navigate('/home', { replace: true })}
        className='text-body-m mt-2 rounded-lg bg-gray-950 px-6 py-3 font-bold text-white transition-colors hover:bg-gray-800'
      >
        홈으로 돌아가기
      </button>
    </main>
  );
};

export default NotFoundPage;
