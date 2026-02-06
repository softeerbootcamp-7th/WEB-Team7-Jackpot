import { useNavigate } from 'react-router';

import { NAV_ITEMS } from '@/shared/constants/globalHeader';
import { CommonIcon as I } from '@/shared/icons';

const PageGlobalHeader = () => {
  const nav = useNavigate();

  return (
    <header className='w-full h-[3.75rem] flex items-center justify-between px-[13.125rem] bg-white mb-[1.875rem]'>
      <div className='flex items-center gap-20'>
        <div className='flex items-center text-2xl font-bold text-blue-300'>
          Narratix
        </div>

        <div>
          <ul className='flex items-center gap-10 select-none'>
            {NAV_ITEMS.map((item) => (
              <li
                key={item.label}
                onClick={() => nav(item.path)}
                className={`text-base cursor-pointer ${
                  item.isActive
                    ? 'font-bold text-gray-950'
                    : 'font-medium text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className='flex items-center gap-5'>
        <button type='button' className='p-1 cursor-pointer'>
          <I.NotificationIcon />
        </button>
        <div className='flex items-center gap-2 cursor-pointer'>
          <I.UserAvatarIcon />
          <span className='text-base font-medium text-gray-600'>졸린 경민</span>
        </div>
      </div>
    </header>
  );
};

export default PageGlobalHeader;
