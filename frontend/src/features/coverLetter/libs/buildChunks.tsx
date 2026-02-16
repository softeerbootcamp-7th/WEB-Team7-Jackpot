import type { TextChunk } from '@/shared/hooks/useTextSelection/helpers';
import type { Review } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';

export const buildChunks = (
  before: TextChunk[],
  after: TextChunk[],
  chunkPositions: number[],
  reviews: Review[],
  selectedReviewId: number | null,
  isReviewOpen: boolean,
  selection: SelectionInfo | null,
) => {
  const renderText = (text: string) => (text === '' ? '\u200B' : text);

  // beforeChunks 처리
  const beforeChunks = before.length
    ? before.map((chunk, i) => {
        if (!chunk.isHighlighted) return renderText(chunk.text);
        const matchingReview = reviews.find(
          (review) =>
            review.isValid &&
            review.range.start <= chunkPositions[i] &&
            review.range.end >= chunkPositions[i] + chunk.text.length,
        );
        if (!matchingReview) return renderText(chunk.text);
        const isSelected = selectedReviewId === matchingReview.id;
        const className = `${isReviewOpen ? 'cursor-pointer font-bold' : ''} ${
          isSelected ? 'bg-red-100' : ''
        }`;
        return (
          <span
            key={i}
            className={className}
            data-review-id={matchingReview.id}
          >
            {renderText(chunk.text)}
          </span>
        );
      })
    : [<br key='empty-before' />]; // 비어있으면 <br>로 최소 구조

  // afterChunks 처리
  const afterChunks = after.length
    ? after.map((chunk, i) =>
        chunk.isHighlighted ? (
          <span key={`after-${i}`} className='font-bold'>
            {renderText(chunk.text)}
          </span>
        ) : (
          renderText(chunk.text)
        ),
      )
    : [];

  if (!selection || afterChunks.length === 0) return beforeChunks;

  return [
    ...beforeChunks,
    <div key='spacer' className='h-2.5' />,
    ...afterChunks, // span 대신 그냥 텍스트 노드로
  ];
};
