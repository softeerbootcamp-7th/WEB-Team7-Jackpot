import { getDate } from '@/shared/utils/dates';

interface DocumentProps {
  selectedDocumentId: number | null;
  content: object;
  handleDocumentId: (id: number | null) => void;
}

const Document = ({
  selectedDocumentId,
  content,
  handleDocumentId,
}: DocumentProps) => {
  const {
    id,
    companyName,
    jobPosition,
    applySeason,
    questionCount,
    modifiedAt,
  } = content as {
    id: number;
    companyName: string;
    jobPosition: string;
    applySeason: string;
    questionCount: number;
    modifiedAt: string;
  };

  const date = getDate(modifiedAt);

  return (
    <button
      type='button'
      className={`w-full ${selectedDocumentId !== null && selectedDocumentId !== id && 'opacity-30'}`} // 수정
      onClick={() => handleDocumentId(id)}
    >
      <div className='inline-flex w-full flex-col items-start justify-start gap-1 border-b border-gray-100 px-3 py-5'>
        <div className='inline-flex items-center justify-start gap-1 self-stretch pr-1'>
          <div className='flex flex-1 items-center justify-start gap-1'>
            <div className='flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5'>
              <div className='justify-start text-xs leading-4 font-medium text-blue-600'>
                {companyName}
              </div>
            </div>
            <div className='flex items-center justify-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5'>
              <div className='justify-start text-xs leading-4 font-medium text-gray-600'>
                {jobPosition}
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col items-start justify-start gap-0.5 self-stretch'>
          <div className='text-title-s line-clamp-1 justify-start font-bold text-gray-950'>
            {applySeason}
          </div>
          <div className='inline-flex items-start justify-start gap-1'>
            <div className='text-caption-l justify-start font-normal text-gray-400'>
              총 {questionCount}문항 · {date}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default Document;
