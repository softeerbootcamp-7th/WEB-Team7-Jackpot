import { Link } from 'react-router';

import { useScrap } from '@/features/library/hooks/useScrap';
import { EditIcon } from '@/features/library/icons/Edit';
import { ScrapIcon } from '@/features/library/icons/Scrap';

interface Props {
  coverLetterId: number;
  qnAId: number;
  initialScrapState: boolean;
}

const DetailButtons = ({ coverLetterId, qnAId, initialScrapState }: Props) => {
  const { isScraped, handleToggleScrap } = useScrap({
    qnAId,
    initialScrapState: initialScrapState,
  });

  return (
    <div className='flex items-center gap-2'>
      <button
        type='button'
        onClick={handleToggleScrap}
        // [박소민] TODO: 스크랩 상태에 따라 버튼 스타일 변경
        className={`flex cursor-pointer items-center gap-1.5 rounded-xl border border-purple-50 bg-purple-50 px-3 py-1.5 text-sm font-bold text-purple-600 transition-colors hover:bg-purple-100`}
      >
        <ScrapIcon className='h-5 w-5' />
        <span>{isScraped ? '스크랩 삭제하기' : '스크랩하기'}</span>
      </button>

      <Link
        to={`/cover-letter/edit/${coverLetterId}?qnAId=${qnAId}`}
        className='flex cursor-pointer items-center gap-1.5 rounded-xl bg-gray-50 px-4 py-1.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-100'
      >
        <EditIcon className='h-5 w-5' />
        <span>수정하기</span>
      </Link>
    </div>
  );
};

export default DetailButtons;
