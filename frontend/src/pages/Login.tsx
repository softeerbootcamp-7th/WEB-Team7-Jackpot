import loginBackground from '/images/loginBackgroundImage.png';
import titleLogo from '/images/titleLogo.svg';

import '@/index.css';

const LoginPage = () => {
  return (
    <div className='flex items-center ps-[30px] py-[30px] gap-[140px]'>
      <img
        className='w-[1048px] h-auto rounded-[40px]'
        src={loginBackground}
        aria-label='백그라운드 이미지'
      />
      <div className='w-[392px] h-[392px] flex flex-col items-center gap-6'>
        <div className='flex flex-col items-center gap-3'>
          <img src={titleLogo} aria-label='타이틀 로고' />
          <div
            className='text-center justify-start text-gray-600 text-lg font-bold line-clamp-1 select-none'
          >
            경험을 기록하는 가장 가벼운 시작
          </div>
        </div>
        <div>
          <form className='flex flex-col justify-center items-center gap-6'>
            <div className='w-[392px] flex flex-col justify-center items-center gap-3'>
              <input
                className='w-full bg-gray-50 px-5 py-[14px] rounded-lg'
                type='text'
                placeholder='아이디를 입력해주세요'
              />
              <input
                className='w-full bg-gray-50 px-5 py-[14px] rounded-lg'
                type='password'
                placeholder='비밀번호를 입력해주세요'
              />
            </div>
            <input
              className='w-full bg-gray-900 text-white px-5 py-[12px] rounded-lg cursor-pointer'
              type='submit'
              value='로그인'
            />
          </form>
        </div>
        <button className='text-gray-600 font-medium text-base cursor-pointer'>
          회원가입
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
