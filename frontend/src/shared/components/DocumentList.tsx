import type { DocumentProps } from '@/shared/components/Document';
import Document from '@/shared/components/Document';

interface Props {
  className?: string;
  documents: DocumentProps[]; // 이미 포맷팅된 데이터 배열을 받습니다.
  emptyMessage?: string;
  onItemClick?: (id: number) => void;
}

const DocumentList = ({
  className = '',
  documents,
  emptyMessage = '해당 날짜에 등록된 공고가 없습니다.',
  onItemClick,
}: Props) => {
  return (
    <div className={`flex w-full flex-col ${className}`}>
      {/* 데이터가 없을 경우 */}
      {documents.length === 0 && (
        <div className='p-4 text-center font-["Pretendard"] text-sm text-gray-400'>
          {emptyMessage}
        </div>
      )}

      {/* 리스트 렌더링 */}
      {documents.map((doc) => (
        <Document key={doc.id} {...doc} onClick={() => onItemClick?.(doc.id)} />
      ))}
    </div>
  );
};

export default DocumentList;
