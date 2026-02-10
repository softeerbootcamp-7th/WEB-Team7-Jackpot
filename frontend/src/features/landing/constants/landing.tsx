import { LandingPageIcon as I } from '@/features/landing/icons';

export const LANDING_CARD_DATA = [
  {
    title: '첫 번째,',
    subtitle: '기록할수록 단단해지는\n나의 커리어 자산들',
    description:
      '사소한 경험들도 놓치지 않고 기록하는 습관,\n차곡차곡 쌓인 자료들은 강력한 무기가 될 거예요',
    icon: <I.FirstCardIcon />,
  },
  {
    title: '두 번째,',
    subtitle: '친구의 시선으로 완성하는\n가장 완벽한 문장들',
    description:
      '고치고 고쳐도 어색한 답변이 있다면,\n링크 하나로 믿을 수 있는 친구의 조언을 구해보세요',
    icon: <I.SecondCardIcon />,
  },
  {
    title: '세 번째,',
    subtitle: '놓치기 쉬운 서류 마감일은\n스마트한 일정 관리',
    description:
      '관심 있는 채용 공고를 캘린더에 등록하고,\n자기소개서까지 한번에 작성할 수 있어요',
    icon: <I.ThirdCardIcon />,
  },
] as const;
