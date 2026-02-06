import fileIcon from '/images/file.svg';

interface CoverLetterPreviewProps {
  isCoverLetter?: boolean;
}

const CoverLetterPreview = ({
  isCoverLetter = false,
}: CoverLetterPreviewProps) => {
  return (
    <div
      className={`${isCoverLetter ? 'h-[11.25rem]' : ''} flex flex-1 items-center justify-start gap-9 rounded-2xl py-6 pr-6 pl-9 outline outline-1 outline-offset-[-1px] outline-gray-100`}
    >
      <img src={fileIcon} className='h-16 w-14' alt='' aria-hidden='true' />
      <div className='inline-flex flex-1 flex-col items-start justify-start gap-2'>
        <div className='flex max-h-[60px] flex-wrap gap-1 overflow-hidden'>
          <div className='flex items-center justify-center rounded-xl bg-blue-50 px-3 py-1.5'>
            <div className='text-xs leading-4 font-medium text-blue-600'>
              토스
            </div>
          </div>
          <div className='flex items-center justify-center rounded-xl bg-gray-50 px-3 py-1.5'>
            <div className='text-xs leading-4 font-medium text-gray-600'>
              2025년 상반기
              {/* 모집 시즌 */}
            </div>
          </div>
        </div>
        <div className='inline-flex items-start justify-end gap-1'>
          <div className='line-clamp-1 justify-start self-stretch text-lg leading-7 font-bold text-gray-950'>
            토스 - 프로덕트 디자이너
          </div>
        </div>

        {isCoverLetter && (
          <>
            <div className='text-caption-l line-clamp-2 h-10 max-h-14 justify-start self-stretch font-normal text-gray-400'>
              현대자동차의 혁신적인 미래 모빌리티 비전에 깊이 매료되어, 사용자
              중심의 차세대 인포테인먼트 시스템을 설계하고자 지원했습니다. 특히
              단순한 이동 수단을 넘어 생활 공간의 확장으로 진화하는 현대의
              브랜드 철학을 디지털 인터페이스에 녹여내어 일관된 사용자 경험을
              제공하고 싶습니다. 저만의 디자인 역량을 발휘하여 전 세계
              사용자들이 현대만의 차별화된 가치를 직관적으로 체감할 수 있도록
              앞장서겠습니다.
            </div>
          </>
        )}
        <div className='flex flex-row items-center justify-between self-stretch'>
          <div className='text-caption-l font-normal text-gray-400'>
            총 4문항
          </div>
          <div className='text-caption-l font-normal text-gray-400'>
            2026.01.23
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterPreview;
