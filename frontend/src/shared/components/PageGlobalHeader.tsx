import { useState } from 'react';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useAuthClient';
import NotificationDropdown from '@/features/notification/components/NotificationDropdown';
import NavItem from '@/shared/components/NavItem';
import { NAV_ITEMS } from '@/shared/constants/globalHeader';
import { useSmartNavigate } from '@/shared/hooks/useSmartNavigate';
import * as SI from '@/shared/icons';

const PageGlobalHeader = () => {
  const smartNavigate = useSmartNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const { userInfo, isLoading } = useAuth();
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
  };

  return (
    <header className='mb-[1.875rem] flex h-[3.75rem] w-full min-w-[1700px] items-center justify-between bg-white px-75'>
      <div className='flex items-center gap-20'>
        <div className='flex items-center text-2xl font-bold text-blue-300'>
          <button
            className='cursor-pointer'
            type='button'
            onClick={() => smartNavigate('/home')}
            aria-label='홈으로 이동'
          >
            <SI.TitleLogo width='99' height='27' />
          </button>
        </div>

        <div>
          <ul className='flex items-center gap-10 select-none'>
            {NAV_ITEMS.map((item) => {
              return (
                <li key={item.label}>
                  <NavItem to={item.path} end={item.end}>
                    {item.label}
                  </NavItem>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className='flex items-center gap-5'>
        <NotificationDropdown
          isOpen={isDropdownOpen}
          handleDropdown={setIsDropdownOpen}
        />
        <div className='relative'>
          <button
            type='button'
            className='flex cursor-pointer items-center gap-2 rounded-lg p-1.5 transition-colors duration-200 hover:bg-gray-100'
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <SI.UserAvatarIcon />
            {isLoading || !userInfo ? (
              <div className='h-5 w-16 animate-pulse rounded bg-gray-200' />
            ) : userInfo?.nickname ? (
              <span className='text-base font-medium text-gray-600'>
                {userInfo.nickname}
              </span>
            ) : (
              <span className='text-base font-medium text-gray-600'>
                사용자
              </span>
            )}
          </button>
          {isProfileOpen && (
            <>
              <div
                className='fixed inset-0 z-10 cursor-default'
                onClick={() => setIsProfileOpen(false)}
              />
              <div className='absolute right-0 z-20 mt-2 flex w-24 flex-col rounded-md bg-white shadow-[0_0_20px_rgba(0,0,0,0.1)] select-none'>
                <button
                  type='button'
                  className='w-full cursor-pointer px-4 py-2 text-center text-sm font-bold text-red-600 transition-colors duration-200 hover:bg-red-50'
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default PageGlobalHeader;
