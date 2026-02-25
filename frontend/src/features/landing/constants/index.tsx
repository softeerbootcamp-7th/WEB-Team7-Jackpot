import * as LAI from '@/features/landing/icons';

export const LANDING_CONTENT = {
  // 메인 헤더 및 버튼 텍스트
  HEADER: {
    LINE_ONE: {
      HIGHLIGHT_1: '사소한 기록',
      HIGHLIGHT_2: '가능성',
      TEXT_AFTER_1: '들이 모여 당신의',
      TEXT_AFTER_2: '을 증명하듯,',
    },
    LINE_TWO: '모든 발자취를 소중히 보관해드릴게요',
    LOGIN_BUTTON: '로그인 및 회원 가입하기',
  },

  // 카드 섹션 데이터
  CARDS: [
    {
      TITLE: '첫 번째,',
      SUBTITLE: '기록할수록 단단해지는\n나의 커리어 자산들',
      DESCRIPTION:
        '사소한 경험들도 놓치지 않고 기록하는 습관,\n차곡차곡 쌓인 자료들은 강력한 무기가 될 거예요',
      ICON: <LAI.FirstCardIcon />,
    },
    {
      TITLE: '두 번째,',
      SUBTITLE: '친구의 시선으로 완성하는\n가장 완벽한 문장들',
      DESCRIPTION:
        '고치고 고쳐도 어색한 답변이 있다면,\n링크 하나로 믿을 수 있는 친구의 조언을 구해보세요',
      ICON: <LAI.SecondCardIcon />,
    },
    {
      TITLE: '세 번째,',
      SUBTITLE: '놓치기 쉬운 서류 마감일은\n스마트한 일정 관리',
      DESCRIPTION:
        '관심 있는 채용 공고를 캘린더에 등록하고,\n자기소개서까지 한번에 작성할 수 있어요',
      ICON: <LAI.ThirdCardIcon />,
    },
  ],
  // 인트로 섹션
  INTRO: {
    ENTER_BUTTON: 'Step into Narratix',
  },

  // 타이포그래피 애니메이션
  TYPOGRAPHY: {
    LINES: {
      ONE: 'Type',
      TWO: 'New Narratix',
    },
    // 애니메이션 관련 수치 (ms)
    DELAY: {
      LOAD: 100,
      CURSOR: 300,
      LINE_TWO: 400,
    },
    // 마스크 스타일 (공통 사용)
    MASK_STYLE: {
      WebkitMaskImage:
        'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.1) 100%)',
      maskImage:
        'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.1) 100%)',
    } as React.CSSProperties,
  },
} as const;

// 경로 상수
export const LANDING_PATH = {
  LOGIN: '/login',
} as const;
