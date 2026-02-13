import { useLocation, useNavigate } from 'react-router';

import CoverLetterCard from '@/features/coverLetter/components/reviewWithFriend/CoverLetterCard';
import type { RecentCoverLetter } from '@/shared/types/coverLetter';

const mock = [
  {
    coverLetterId: 1,
    companyName: '삼성전자',
    jobPosition: '백엔드 개발자',
    applyYear: 2026,
    applyHalf: 'FIRST_HALF',
    deadline: '2025-01-25',
    questionCount: 3,
  },
  {
    coverLetterId: 2,
    companyName: '현대자동차',
    jobPosition: '백엔드 개발자',
    applyYear: 2026,
    applyHalf: 'FIRST_HALF',
    deadline: '2025-01-25',
    questionCount: 3,
  },
] as RecentCoverLetter[];

interface ReviewSidebarProps {
  selectedDocumentId: number | null;
}

const ReviewSidebar = ({ selectedDocumentId }: ReviewSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelect = (id: number) => {
    const base = location.pathname.replace(/\/\d+$/, '');
    navigate(`${base}/${id}`);
  };

  return (
    <div className='flex h-full w-full flex-col gap-2 overflow-y-auto'>
      {mock.map((item, idx) => (
        <CoverLetterCard
          key={idx}
          isSelectStatus={selectedDocumentId !== null}
          isSelected={item.coverLetterId === selectedDocumentId}
          onClick={() => handleSelect(item.coverLetterId)}
          coverLetter={item}
        />
      ))}
    </div>
  );
};

export default ReviewSidebar;