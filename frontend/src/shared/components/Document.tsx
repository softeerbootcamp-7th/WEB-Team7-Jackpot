// UI에 필요한 데이터만 정의 (비즈니스 로직 분리)
export interface DocumentProps {
  id: number;
  companyName: string;
  jobPosition: string;
  title: string; // 예: "2025년 상반기"
  questionCount: number;
  date: string; // 예: "2026.01.23" (부모에서 포맷팅해서 전달)
  isSelected?: boolean;
  onClick?: () => void;
}

const Document = ({
  companyName,
  jobPosition,
  title,
  questionCount,
  date,
  isSelected = false,
  onClick,
}: DocumentProps) => {
  return (
    <div
      className={`inline-flex cursor-pointer flex-col items-start justify-start self-stretch px-3 transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-100' // 선택 여부에 따른 스타일 필요 시 수정 (기존 코드는 opacity 조절이 있었음)
      }`}
      onClick={onClick}
    >
      <div
        data-마감일자='true'
        data-속성-1='기본'
        data-수정-버튼='true'
        className='border-Semantic-text-field-line-primary flex flex-col items-start justify-start gap-1 self-stretch border-b px-3 py-5'
      >
        {/* 상단: 기업명, 직무명 칩 + 아이콘 */}
        <div className='inline-flex items-center justify-between self-stretch pr-1'>
          <div className='flex flex-1 items-center justify-start gap-1'>
            <div
              data-속성-1='comp chip'
              className='bg-Semantic-chip-blue-chip-bg---primary flex items-center justify-center gap-1 rounded-xl px-3 py-1.5'
            >
              <div className="text-Semantic-chip-blue-chip-text----primary justify-start font-['Pretendard'] text-xs leading-4 font-medium">
                {companyName}
              </div>
            </div>
            <div
              data-속성-1='job chip'
              className='bg-Semantic-chip-gray-chip-bg flex items-center justify-center gap-1 rounded-xl px-3 py-1.5'
            >
              <div className="text-Semantic-chip-gray-chip-text justify-start font-['Pretendard'] text-xs leading-4 font-medium">
                {jobPosition}
              </div>
            </div>
          </div>

          {/* 우측 아이콘 (수정/메뉴 등) */}
          <div className='relative h-5 w-5'>
            <div className='outline-Primitive-Color-gray-gray-300 absolute top-[2px] left-[2px] h-4 w-4 outline outline-[1.50px] outline-offset-[-0.75px]' />
          </div>
        </div>

        {/* 하단: 제목 + 문항수 + 날짜 */}
        <div className='flex flex-col items-start justify-start gap-0.5 self-stretch'>
          <div className="line-clamp-1 justify-start self-stretch font-['Pretendard'] text-lg leading-7 font-bold text-zinc-800">
            {title}
          </div>
          <div className='inline-flex items-start justify-start gap-1'>
            <div className="text-Semantic-text-label-400 justify-start font-['Pretendard'] text-xs leading-5 font-normal">
              총 {questionCount}문항
            </div>
            <div className="text-Semantic-text-label-400 justify-start font-['Pretendard'] text-sm leading-5 font-normal">
              ·
            </div>
            <div className='flex items-center justify-start'>
              <div className="text-Semantic-text-label-400 justify-start font-['Pretendard'] text-xs leading-5 font-normal">
                {date}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Document;
