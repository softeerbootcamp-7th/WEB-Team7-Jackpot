import { useState } from 'react';

import CommentTab from '@/features/review/components/reviewModal/CommentTab';
import RevisionTab from '@/features/review/components/reviewModal/RevisionTab';
import TabSelector from '@/features/review/components/reviewModal/TabSelector';
import { REVIEW_CONSTRAINTS } from '@/features/review/constants/review';
import type { TabType } from '@/features/review/types/review';

interface ReviewModalProps {
  selectedText: string;
  onSubmit: (revision: string, comment: string) => void;
  onCancel: () => void;
  initialRevision?: string;
  initialComment?: string;
}

const ReviewModal = ({
  selectedText,
  onSubmit,
  onCancel,
  initialRevision = '',
  initialComment = '',
}: ReviewModalProps) => {
  const [revision, setRevision] = useState(initialRevision);
  const [comment, setComment] = useState(initialComment);
  const [tab, setTab] = useState<TabType>('revision');

  const isSubmitEnabled =
    (revision.trim().length > 0 || comment.trim().length > 0) &&
    comment.length <= REVIEW_CONSTRAINTS.MAX_COMMENT_LENGTH;

  const handleSubmit = () => {
    if (!isSubmitEnabled) return;
    onSubmit(revision, comment);
  };

  const displayText = revision.trim().length > 0 ? revision : selectedText;

  return (
    <div className='flex w-96 flex-col items-end gap-4 rounded-[32px] bg-white p-5 shadow-[0px_0px_30px_0px_rgba(41,41,41,0.06)]'>
      <div className='flex w-full flex-col items-start gap-2'>
        <TabSelector tab={tab} onTabChange={setTab} />

        {tab === 'revision' && (
          <RevisionTab revision={revision} onRevisionChange={setRevision} />
        )}

        {tab === 'comment' && (
          <CommentTab
            displayText={displayText}
            comment={comment}
            onCommentChange={setComment}
          />
        )}
      </div>

      <div className='flex items-start gap-2.5'>
        <button
          type='button'
          onClick={onCancel}
          className='rounded-xl px-4 py-2 text-sm leading-6 font-normal text-gray-600 hover:bg-gray-50'
        >
          취소
        </button>
        <button
          type='button'
          onClick={handleSubmit}
          disabled={!isSubmitEnabled}
          className={`rounded-xl px-4 py-2 text-base leading-6 font-bold ${
            isSubmitEnabled
              ? 'bg-gray-950 text-white'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          등록하기
        </button>
      </div>
    </div>
  );
};

export default ReviewModal;
