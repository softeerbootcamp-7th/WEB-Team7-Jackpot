import { useLocation, useNavigate } from 'react-router';

import { NAV_ITEMS } from '@/shared/constants/globalHeader';
import { CommonIcon as I } from '@/shared/icons';

const PageGlobalHeader = () => {
  const nav = useNavigate();
  const location = useLocation();

  return (
    <header className='mb-[1.875rem] flex h-[3.75rem] w-full items-center justify-between bg-white px-75'>
      <div className='flex items-center gap-20'>
        <div className='flex items-center text-2xl font-bold text-blue-300'>
          Narratix
        </div>

        <div>
          <ul className='flex items-center gap-10 select-none'>
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname.startsWith(item.path);

              return (
                <li key={item.label}>
                  <button
                    type='button'
                    onClick={() => nav(item.path)}
                    className={`cursor-pointer text-base ${
                      isActive
                        ? 'font-bold text-gray-950'
                        : 'font-medium text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className='flex items-center gap-5'>
        <button type='button' className='cursor-pointer p-1'>
          <I.NotificationIcon />
        </button>
        <div className='flex cursor-pointer items-center gap-2'>
          <I.UserAvatarIcon />
          <span className='text-base font-medium text-gray-600'>졸린 경민</span>
        </div>
      </div>
    </header>
  );
};

export default PageGlobalHeader;
