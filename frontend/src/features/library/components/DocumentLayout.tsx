import { type ReactNode } from 'react';

import { NavLink } from 'react-router';

import { LibraryIcons as LII } from '@/features/library/icons';

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
      <div className='mb-4 inline-flex items-center justify-start gap-1 self-stretch px-3'>
        <NavLink to={backUrl} aria-label='뒤로 가기'>
          <LII.ChevronLeftIcon />
        </NavLink>
        <div className='flex flex-1 items-center justify-start gap-2'>
          <div className='h-7 w-7'>
            <LII.FolderIcon />
          </div>
          <h1 className='text-title-m line-clamp-1 flex-1 justify-start font-bold text-gray-950'>
            {title}
          </h1>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      {children}
    </div>
  );
};

export default DocumentLayout;
