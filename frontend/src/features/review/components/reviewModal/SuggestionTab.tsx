interface SuggestionTabProps {
  suggest: string;
  onSuggestChange: (value: string) => void;
}

const SuggestionTab = ({ suggest, onSuggestChange }: SuggestionTabProps) => {
  return (
    <div className='flex w-full flex-col items-start gap-2 rounded-2xl bg-gray-100 px-5 py-4'>
      <textarea
        value={suggest}
        onChange={(e) => onSuggestChange(e.target.value)}
        placeholder='첨삭하실 내용을 적어주세요'
        className='min-h-20 w-full resize-none bg-transparent text-sm leading-6 text-gray-900 placeholder-gray-400 outline-none'
      />
    </div>
  );
};

export default SuggestionTab;
