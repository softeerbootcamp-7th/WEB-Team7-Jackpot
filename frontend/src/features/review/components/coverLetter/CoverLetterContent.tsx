import { useEffect, useState } from 'react';

import type { SelectionInfo } from '@/shared//types/selectionInfo';
import { useTextSelection } from '@/shared/hooks/useTextSelection';
import type { TextChunk } from '@/shared/hooks/useTextSelection/helpers';
import type { Review } from '@/shared/types/review';

interface CoverLetterContentProps {
  text: string;
  reviews: Review[];
  editingReview: Review | null;
  selection: SelectionInfo | null;
  onSelectionChange: (selection: SelectionInfo | null) => void;
}

const CoverLetterContent = ({
  text,
  reviews,
  editingReview,
  selection,
  onSelectionChange,
}: CoverLetterContentProps) => {
  const { containerRef, handleMouseUp, before, after } = useTextSelection({
    text,
    reviews,
    editingReview,
    selection,
    onSelectionChange,
  });
  const [bottomPadding, setBottomPadding] = useState<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const updatePadding = () => {
      const containerHeight = container.clientHeight;
      const computedStyle = window.getComputedStyle(container);
      const lineHeight = parseFloat(computedStyle.lineHeight) || 28;
      setBottomPadding(containerHeight - lineHeight);
    };

    updatePadding();

    const resizeObserver = new ResizeObserver(updatePadding);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [text, containerRef]);

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      className='relative min-h-0 w-full flex-1 overflow-y-auto pr-[2rem] pl-[3rem]'
      style={{
        whiteSpace: 'pre-wrap',
        overflowY: selection ? 'hidden' : 'auto',
        paddingBottom: bottomPadding,
      }}
    >
      <div className='w-full py-[0.5rem] text-base leading-7 font-normal text-gray-800'>
        {before.map((chunk: TextChunk, i: number) => {
          const classNames = [
            chunk.isHighlighted && 'bg-red-100',
            chunk.isActive && 'font-bold',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <span key={`before-${i}`} className={classNames}>
              {chunk.text}
            </span>
          );
        })}

        {selection && after.length > 0 && (
          <>
            <div className='h-2.5' />
            <span className='opacity-30'>
              {after.map((chunk: TextChunk, i: number) => (
                <span
                  key={`after-${i}`}
                  className={chunk.isHighlighted ? 'bg-red-100 font-bold' : ''}
                >
                  {chunk.text}
                </span>
              ))}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default CoverLetterContent;
