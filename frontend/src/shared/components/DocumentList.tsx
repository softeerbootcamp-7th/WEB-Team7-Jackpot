import { type ReactNode } from 'react';

import Document, { type DocumentProps } from '@/shared/components/Document';

interface Props {
  className?: string;
  documents: DocumentProps[];
  emptyMessage?: string;
  onItemClick?: (id: number) => void;
  renderAction?: (doc: DocumentProps) => ReactNode;
}

const DocumentList = ({
  className = '',
  documents,
  emptyMessage = '해당 날짜에 등록된 공고가 없습니다.',
  onItemClick,
  renderAction,
}: Props) => {
  return (
    <div className={`flex w-full flex-col ${className}`}>
      {documents.length === 0 && (
        <div className='p-4 text-center font-["Pretendard"] text-sm text-gray-400'>
          {emptyMessage}
        </div>
      )}

      {documents.map((doc) => (
        <Document key={doc.id} {...doc} onClick={() => onItemClick?.(doc.id)}>
          {renderAction && renderAction(doc)}
        </Document>
      ))}
    </div>
  );
};

export default DocumentList;
