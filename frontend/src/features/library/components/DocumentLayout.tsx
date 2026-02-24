import { type ReactNode } from 'react';

import { NavLink } from 'react-router';

import * as LII from '@/features/library/icons';
import * as SI from '@/shared/icons';

interface Props {
  title: string;
  backUrl: string;
  children: ReactNode;
  className?: string;
}

const DocumentLayout = ({
  title,
  backUrl,
  children,
  className = '',
}: Props) => {
  return (
    <div className={`flex w-full flex-col ${className}`}>
      {/* 헤더 영역 공통화 */}
      <NavLink to={backUrl} aria-label='뒤로 가기' className='block w-full'>
        <div className='mb-4 inline-flex w-full cursor-pointer items-center justify-start gap-1 self-stretch rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-gray-100'>
          <LII.ChevronLeftIcon />
          <div className='flex flex-1 items-center justify-start gap-2'>
            <div className='h-7 w-7'>
              <SI.FolderIcon />
            </div>
            <h1 className='text-title-m line-clamp-1 flex-1 justify-start font-bold text-gray-950'>
              {title}
            </h1>
          </div>
        </div>
      </NavLink>

      {/* 컨텐츠 영역 */}
      {children}
    </div>
  );
};

export default DocumentLayout;
