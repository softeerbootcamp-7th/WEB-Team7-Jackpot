import NavItem from '@/shared/components/NavItem';
import { NAV_ITEMS } from '@/shared/constants/globalHeader';
import { CommonIcon as I } from '@/shared/icons';

const PageGlobalHeader = () => {
  return (
    <header className='mb-[1.875rem] flex h-[3.75rem] w-full items-center justify-between bg-white px-75'>
      <div className='flex items-center gap-20'>
        <div className='flex items-center text-2xl font-bold text-blue-300'>
          {/* TODO: 로고 변환 */}
          Narratix
        </div>

        <div>
          <ul className='flex items-center gap-10 select-none'>
            {NAV_ITEMS.map((item) => {
              return (
                <li key={item.label}>
                  <NavItem to={item.path}>{item.label}</NavItem>
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
