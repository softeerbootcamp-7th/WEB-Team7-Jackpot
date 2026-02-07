import loginBackground from '/images/loginBackgroundImage.png';

import LogoAndSubTitle from '@/features/auth/components/LogoAndSubTitle';
import TitleLogo from '@/shared/icons/TitleLogo';

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
    <div className='flex items-center gap-[8.75rem] px-[1.875rem] py-[1.875rem] select-none'>
      <img
        className='h-auto w-[65.5rem] rounded-[2.5rem]'
        src={loginBackground}
        alt='백그라운드 이미지'
      />
      <div className='flex h-[24.5rem] w-[24.5rem] flex-col items-center justify-center gap-6'>
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
