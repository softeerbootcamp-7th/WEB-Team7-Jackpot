const ScrapNum = ({ value }: { value: number }) => {
  return (
    <div className='flex flex-row items-center justify-center gap-2.5 pt-7.5'>
      <p className='text-body-l flex-shrink-0 flex-grow-0 font-bold text-gray-400'>
        지금까지 스크랩된 문항 수
      </p>
      <div className='inline-flex items-center justify-center gap-1 rounded-[100px] bg-purple-500 px-1.5 pt-px outline outline-2 outline-white'>
        <div className='text-caption-s justify-start text-center font-bold text-white'>
          {value}
        </div>
      </div>
    </div>
  );
};
export default ScrapNum;
