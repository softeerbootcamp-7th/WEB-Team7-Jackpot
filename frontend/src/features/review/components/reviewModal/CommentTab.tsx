import { REVIEW_CONSTRAINTS } from '@/features/review/constants/review';

interface CommentTabProps {
  displayText: string;
  comment: string;
  onCommentChange: (value: string) => void;
}

const CommentTab = ({
  displayText,
  comment,
  onCommentChange,
}: CommentTabProps) => {
  return (
    <>
      <div className='flex w-full items-center rounded-2xl border border-gray-200 px-5 py-4'>
        <div className='w-full text-sm leading-6 font-normal text-gray-600'>
          {displayText}
        </div>
      </div>
      <div className='flex w-full flex-col items-start gap-2 rounded-2xl bg-gray-100 px-5 py-4'>
        <textarea
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder='첨삭하신 내용에 덧붙일 코멘트가 있다면 알려주세요'
          className='min-h-11 w-full resize-none bg-transparent text-sm leading-6 text-gray-900 placeholder-gray-400 outline-none'
        />
        <div className='flex w-full items-center justify-end gap-0.5'>
          <span
            className={`text-xs leading-5 ${
              comment.length > REVIEW_CONSTRAINTS.MAX_COMMENT_LENGTH
                ? 'text-red-500'
                : 'text-gray-400'
            }`}
          >
            {comment.length}
          </span>
          <span className='text-xs leading-5 text-gray-400'>/</span>
          <span className='text-xs leading-5 text-gray-400'>
            {REVIEW_CONSTRAINTS.MAX_COMMENT_LENGTH}
          </span>
        </div>
      </div>
    </>
  );
};

export default CommentTab;
