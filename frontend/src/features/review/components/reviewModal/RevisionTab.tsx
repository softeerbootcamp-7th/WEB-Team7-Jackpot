interface RevisionTabProps {
  revision: string;
  onRevisionChange: (value: string) => void;
}

const RevisionTab = ({ revision, onRevisionChange }: RevisionTabProps) => {
  return (
    <div className='flex w-full flex-col items-start gap-2 rounded-2xl bg-gray-100 px-5 py-4'>
      <textarea
        value={revision}
        onChange={(e) => onRevisionChange(e.target.value)}
        placeholder='첨삭하실 내용을 적어주세요'
        className='min-h-20 w-full resize-none text-sm leading-6 text-gray-900 placeholder-gray-400 outline-none'
      />
    </div>
  );
};

export default RevisionTab;
