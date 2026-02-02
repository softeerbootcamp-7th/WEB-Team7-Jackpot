import loginBackground from '/images/loginBackgroundImage.png';

import LogoAndSubTitle from '@/components/auth/LogoAndSubTitle';
import TitleLogo from '@/components/common/icons/TitleLogo';

interface AuthLayoutProps {
  children: React.ReactNode;
  subTitle: string;
  subTitleColor?: string;
}

const AuthLayout = ({
  children,
  subTitle,
  subTitleColor = 'text-gray-950',
}: AuthLayoutProps) => {
  return (
    <div className='flex items-center ps-[1.875rem] py-[1.875rem] gap-[8.75rem]'>
      <img
        className='w-[65.5rem] h-auto rounded-[2.5rem]'
        src={loginBackground}
        alt='백그라운드 이미지'
      />
      <div className='w-[24.5rem] h-[24.5rem] flex flex-col justify-center items-center gap-6'>
        <LogoAndSubTitle
          TitleLogoComponent={TitleLogo}
          subTitle={subTitle}
          subTitleColor={subTitleColor}
        />
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
