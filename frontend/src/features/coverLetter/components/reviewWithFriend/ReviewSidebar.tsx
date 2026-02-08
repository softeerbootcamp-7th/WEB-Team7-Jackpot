import CoverLetterCard from '@/features/coverLetter/components/reviewWithFriend/CoverLetterCard';

const mock = [
  {
    id: 1,
    applySeason: '2025년 상반기',
    companyName: '삼성전자',
    jobPosition: '개발자',
    questionCount: 3,
    modifiedAt: '2025-01-25T09:41:00Z',
  },
  {
    id: 2,
    applySeason: '2024년 하반기',
    companyName: '네이버',
    jobPosition: '프론트엔드 개발자',
    questionCount: 4,
    modifiedAt: '2024-07-15T14:22:00Z',
  },
  {
    id: 3,
    applySeason: '2025년 상반기',
    companyName: '카카오',
    jobPosition: '백엔드 개발자',
    questionCount: 5,
    modifiedAt: '2025-02-10T11:30:00Z',
  },
];

interface ReviewSidebarProps {
  selectedDocumentId: number | null;
  onSelectDocument: (id: number) => void;
}

const ReviewSidebar = ({
  selectedDocumentId,
  onSelectDocument,
}: ReviewSidebarProps) => {
  return (
    <div className='flex h-full w-full flex-col gap-2 overflow-y-auto'>
      {mock.map((item, idx) => (
        <CoverLetterCard
          key={idx}
          isSelectStatus={selectedDocumentId !== null}
          isSelected={item.id === selectedDocumentId}
          onClick={() => onSelectDocument(item.id)}
          coverLetter={item}
        />
      ))}
    </div>
  );
};

export default ReviewSidebar;
