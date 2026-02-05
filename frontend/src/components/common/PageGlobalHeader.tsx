import { useNavigate } from 'react-router';

import { CommonIcon as I } from '@/components/common/icons';

import { NAV_ITEMS } from '@/constants/constantsInGlobalHeader';

const PageGlobalHeader = () => {
  const nav = useNavigate();

  return (
    <header className='w-full h-[60px] flex items-center justify-between px-[210px] bg-white mb-[30px]'>
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
