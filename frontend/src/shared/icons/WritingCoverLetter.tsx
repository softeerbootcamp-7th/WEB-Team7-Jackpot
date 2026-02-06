import { type SVGProps, useId } from 'react';

export const WritingCoverLetterIcon = (props: SVGProps<SVGSVGElement>) => {
  // 1. 고유 ID 생성: 컴포넌트가 호출될 때마다 유니크한 ID를 보장합니다.
  const baseId = useId();

  // 2. 가독성을 위한 ID 파생: 템플릿 리터럴로 명확한 변수명을 만듭니다.
  // 나중에 디버깅할 때도 어떤 요소의 ID인지 구분하기 쉽습니다.
  const clipPathId = `${baseId}-clip`;
  const gradientAId = `${baseId}-grad-a`;
  const gradientBId = `${baseId}-grad-b`;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='28'
      height='28'
      fill='none'
      viewBox='0 0 28 28'
      {...props} // 3. 확장성: 외부에서 className이나 style을 주입받을 수 있게 합니다.
    >
      {/* 4. 적용: 생성한 변수를 사용하여 참조 관계를 명확히 합니다. */}
      <g clipPath={`url(#${clipPathId})`}>
        <path
          fill={`url(#${gradientAId})`}
          d='M27.222 15.556c0 1.718-1.393...'
        />
        {/* 중간 path 생략 (단색 채우기는 ID가 필요 없으므로 그대로 둡니다) */}
        <path fill='#DCDCDC' d='...' />
        <path fill='#EFEFEF' d='...' />
        <path fill='#fff' d='...' />

        <path fill={`url(#${gradientBId})`} d='M27.222 24.111a3.11 3.11...' />
      </g>

      {/* Definitions: 그래픽 리소스 정의 구간 */}
      <defs>
        <clipPath id={clipPathId}>
          <rect width='28' height='28' fill='#fff' />
        </clipPath>

        <linearGradient
          id={gradientAId}
          x1='14'
          x2='14'
          y1='3.111'
          y2='17.115'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#AEB7F3' />
          <stop offset='1' stopColor='#7371E3' />
        </linearGradient>

        <linearGradient
          id={gradientBId}
          x1='14'
          x2='14'
          y1='12.444'
          y2='27.222'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#AEB7F3' />
          <stop offset='1' stopColor='#E3E8FC' />
        </linearGradient>
      </defs>
    </svg>
  );
};
