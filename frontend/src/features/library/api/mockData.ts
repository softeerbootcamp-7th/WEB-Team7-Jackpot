import type { CoverLetter, QuestionItem } from '@/features/library/types';

// 시나리오 A: 자기소개서 관리 (회사별 분류)
export const MOCK_COVER_LETTER_FOLDERS = ['현대자동차', '현대건설', '기아'];

// 시나리오 B: 문항 라이브러리 (유형별 분류)
export const MOCK_QUESTION_FOLDERS = ['지원동기', '성공경험', '갈등경험'];

export const MOCK_COVER_LETTERS: CoverLetter[] = [
  // ----------------------------------------------------------------
  // [현대자동차] 폴더 - 4개
  // ----------------------------------------------------------------
  {
    id: 101,
    applySeason: '2025년 상반기',
    companyName: '현대자동차',
    jobPosition: '인포테인먼트 기획',
    questionCount: 3,
    modifiedAt: new Date().toISOString(),
    question: [
      {
        qnAId: 1,
        question:
          '현대자동차 해당 직무 분야에 지원하게 된 이유와 선택 직무에 본인이 적합하다고 판단할 수 있는 근거를 기술해 주십시오.',
        answer:
          '모빌리티 경험의 확장을 꿈꾸며 인포테인먼트 기획 직무에 지원했습니다. 자동차가 단순한 이동 수단을 넘어 생활 공간으로 진화함에 따라, 사용자에게 끊김 없는 디지털 경험을 제공하는 것이 핵심 경쟁력이 될 것이라 확신합니다. 저는 컴퓨터공학을 전공하며 UX/UI 프로젝트를 다수 수행했고, 특히 운전자 시선 추적 데이터를 기반으로 인터페이스를 최적화하는 프로젝트에서 사용성을 20% 개선한 경험이 있습니다. 이러한 기술적 이해도와 사용자 중심의 사고방식은 차세대 인포테인먼트 시스템을 기획하는 데 기여할 것입니다.',
        answerSize: 320,
        modifiedAt: new Date().toISOString(),
      },
      {
        qnAId: 2,
        question:
          '본인이 도전적인 목표를 세우고 이를 달성하기 위해 노력했던 경험에 대해 구체적으로 기술해 주십시오.',
        answer:
          '학부 시절, 교내 해커톤에서 "음성 인식 기반의 차량 제어 시스템"을 개발하는 목표를 세웠습니다. 당시 팀원 모두 음성 API 사용 경험이 전무하여 초기에는 인식률이 40%에 불과했습니다. 하지만 포기하지 않고 매일 2시간씩 노이즈 캔슬링 알고리즘을 스터디하고, 실제 차량 주행 소음을 수집하여 모델을 학습시켰습니다. 3주간의 밤샘 작업 끝에 인식률을 90%까지 끌어올렸고, 결과적으로 대상을 수상할 수 있었습니다. 이 경험을 통해 기술적 난관을 돌파하는 끈기를 배웠습니다.',
        answerSize: 310,
        modifiedAt: new Date().toISOString(),
      },
      {
        qnAId: 3,
        question:
          '타인과 협업하는 과정에서 갈등이 발생했을 때 이를 어떻게 해결했는지 구체적인 사례를 들어 기술해 주십시오.',
        answer:
          '졸업 프로젝트 당시, 개발 프레임워크 선정을 두고 팀원 간 의견 차이가 있었습니다. 저는 안정성을 위해 React를, 다른 팀원은 최신 기술인 Svelte를 주장했습니다. 감정적인 대립 대신, 저는 각 프레임워크의 장단점을 분석한 비교 문서를 작성하여 객관적인 데이터를 제시했습니다. 또한, 작은 데모를 각각 만들어 생산성을 테스트해보자고 제안했습니다. 그 결과 React의 생태계가 우리 프로젝트 일정에 더 적합하다는 결론에 모두 동의하게 되었고, 갈등 없이 프로젝트를 완수할 수 있었습니다.',
        answerSize: 305,
        modifiedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 102,
    applySeason: '2025년 상반기',
    companyName: '현대자동차',
    jobPosition: 'R&D 차체설계',
    questionCount: 4,
    modifiedAt: new Date(Date.now() - 86400000).toISOString(),
    question: [
      {
        qnAId: 1,
        question:
          '본인이 회사를 선택할 때의 기준은 무엇이며, 왜 현대자동차 생가 그 기준에 적합한지를 기술해 주십시오.',
        answer:
          '끊임없는 혁신을 통해 시장을 선도하는 기업인가를 가장 중요하게 생각합니다. 현대자동차는 수소차와 전기차 전용 플랫폼 E-GMP를 통해 글로벌 시장의 패러다임을 바꾸고 있습니다. 기계공학도로서 단순히 부품을 설계하는 것을 넘어, 미래 모빌리티의 골격을 만든다는 자부심을 가질 수 있는 곳은 현대자동차뿐이라고 생각하여 지원했습니다.',
        answerSize: 250,
        modifiedAt: new Date().toISOString(),
      },
      {
        qnAId: 2,
        question:
          '지원 직무와 관련하여 본인의 강점은 무엇이며, 이를 통해 어떻게 기여할 수 있는지 기술해 주십시오.',
        answer:
          '저의 강점은 CATIA와 ANSYS를 활용한 구조 해석 능력입니다. 학부 연구생 시절, 경량화를 위한 허니콤 구조의 충격 흡수 실험을 진행하며 시뮬레이션 오차를 5% 이내로 줄인 경험이 있습니다. 이러한 해석 역량을 바탕으로, 안전성은 유지하면서도 연비 효율을 극대화할 수 있는 차체 설계에 기여하겠습니다.',
        answerSize: 220,
        modifiedAt: new Date().toISOString(),
      },
      {
        qnAId: 3,
        question:
          '가장 열정적으로 임했던 프로젝트 경험과 그 과정에서 배운 점을 기술해 주십시오.',
        answer:
          '자작 자동차 동아리에서 프레임 설계를 맡아 전국 대회에 출전했던 경험이 가장 기억에 남습니다. 코너링 시 비틀림 강성을 확보하기 위해 기존 파이프 구조를 전면 재설계했습니다. 100번이 넘는 시뮬레이션 끝에 최적의 트러스 구조를 찾아냈고, 실제 주행 테스트에서 랩타임을 3초 단축했습니다. 이론을 실제 제품으로 구현하는 과정에서의 디테일이 얼마나 중요한지 깨달았습니다.',
        answerSize: 280,
        modifiedAt: new Date().toISOString(),
      },
      {
        qnAId: 4,
        question: '향후 현대자동차에서 이루고 싶은 커리어 목표는 무엇입니까?',
        answer:
          '입사 후 5년 내에 차체 설계 프로세스의 전문가가 되어, 전기차 특화 경량 차체 플랫폼 개발에 핵심적인 역할을 하고 싶습니다. 장기적으로는 친환경 소재를 활용한 차체 설계 기술을 선도하여, 현대자동차가 글로벌 친환경 기업으로 자리매김하는 데 이바지하고 싶습니다.',
        answerSize: 180,
        modifiedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 103,
    applySeason: '2024년 하반기',
    companyName: '현대자동차',
    jobPosition: '생산관리',
    questionCount: 2,
    modifiedAt: new Date(Date.now() - 172800000).toISOString(),
    question: [
      {
        qnAId: 1,
        question:
          '생산관리 직무 수행 시 예상되는 어려움과 이를 극복하기 위한 본인만의 방안을 기술해 주십시오.',
        answer:
          '생산관리는 돌발 변수와의 싸움이라고 생각합니다. 자재 수급 지연이나 설비 고장 등 예측 불가능한 상황에서, 저는 "데이터 기반의 시나리오 플래닝"으로 대응하겠습니다. 산업공학을 전공하며 배운 공정 시뮬레이션을 활용해 병목 현상을 사전에 파악하고, 예비 시나리오를 매뉴얼화하여 기민하게 대처하겠습니다.',
        answerSize: 210,
        modifiedAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        qnAId: 2,
        question: '협업 시 본인이 주로 맡는 역할과 그 이유를 기술해 주십시오.',
        answer:
          '저는 주로 "중재자" 역할을 맡습니다. 팀 내에서 다양한 의견이 충돌할 때, 각 입장의 공통분모를 찾아 합의점을 도출하는 데 능숙하기 때문입니다. 생산 현장에서도 다양한 유관 부서와의 소통이 필수적인 만큼, 저의 소통 역량으로 원활한 생산 프로세스를 이끌겠습니다.',
        answerSize: 190,
        modifiedAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ],
  },
  {
    id: 104,
    applySeason: '2024년 상반기',
    companyName: '현대자동차',
    jobPosition: '국내영업',
    questionCount: 3,
    modifiedAt: new Date(Date.now() - 259200000).toISOString(),
    question: [
      {
        qnAId: 1,
        question:
          '본인의 성격의 장단점과 이를 통해 영업 직무에서 어떻게 성과를 낼 수 있는지 기술해 주십시오.',
        answer:
          '제 장점은 "처음 만난 사람과도 5분 안에 친해지는 친화력"입니다. 대학 시절 봉사 동아리 회장을 맡으며 다양한 연령층의 사람들과 소통했고, 후원금을 200% 증대시킨 경험이 있습니다. 반면 거절에 대해 스트레스를 받는 편이었으나, "거절은 설득의 시작"이라는 마인드셋 훈련을 통해 이를 극복했습니다. 고객의 니즈를 빠르게 파악하여 현대자동차의 가치를 전달하겠습니다.',
        answerSize: 290,
        modifiedAt: new Date(Date.now() - 259200000).toISOString(),
      },
      {
        qnAId: 2,
        question:
          '최근 자동차 시장의 트렌드 중 하나를 선택하여, 이에 대한 본인의 견해를 서술하시오.',
        answer:
          '온라인 판매 채널의 확대가 가장 큰 트렌드라고 생각합니다. 캐스퍼의 성공 사례에서 보듯, MZ세대는 비대면 경험을 선호합니다. 하지만 자동차는 고관여 제품이기에 오프라인 시승 경험 또한 필수적입니다. 따라서 저는 온-오프라인을 연계한 옴니채널 전략을 통해 고객 접점을 넓히는 영업 전략이 필요하다고 생각합니다.',
        answerSize: 250,
        modifiedAt: new Date(Date.now() - 259200000).toISOString(),
      },
      {
        qnAId: 3,
        question: '입사 후 포부에 대해 기술해 주십시오.',
        answer:
          '지역 거점 판매왕이 되는 것이 1차 목표입니다. 해당 지역의 인구 통계학적 특성을 분석하여 타겟 마케팅을 진행하고, 출고 후 철저한 사후 관리를 통해 재구매율을 높이겠습니다. 나아가 영업 데이터를 분석하여 본사에 상품 개선 아이디어를 제안하는 영업 전문가로 성장하겠습니다.',
        answerSize: 210,
        modifiedAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ],
  },

  // ----------------------------------------------------------------
  // [현대건설] 폴더 - 2개
  // ----------------------------------------------------------------
  {
    id: 201,
    applySeason: '2025년 상반기',
    companyName: '현대건설',
    jobPosition: '건축시공',
    questionCount: 4,
    modifiedAt: new Date().toISOString(),
    question: [
      {
        qnAId: 1,
        question:
          '지원 직무를 수행하기 위해 가장 중요하다고 생각하는 역량과 이를 갖추기 위해 노력한 경험을 기술하세요.',
        answer:
          '현장 관리 능력과 안전 의식입니다. 인턴십 당시 아파트 건설 현장에서 근무하며, 작업자분들과의 소통 부재가 안전 사고로 이어질 뻔한 아찔한 상황을 목격했습니다. 그 후 저는 매일 아침 TBM(Tool Box Meeting)에 주도적으로 참여하여 당일 작업 위험 요소를 공유했습니다. 또한 건축기사와 건설안전기사를 취득하며 이론적 지식을 쌓았습니다.',
        answerSize: 280,
        modifiedAt: new Date().toISOString(),
      },
      {
        qnAId: 2,
        question:
          '도전적인 목표를 설정하고 열정을 가지고 달성한 사례를 기술해 주십시오.',
        answer:
          '건축공모전에서 "제로 에너지 하우스"를 설계하며 에너지 효율 1등급 기준을 맞추는 목표를 세웠습니다. 초기 설계안은 단열 성능이 부족했지만, 패시브 하우스 기술 서적을 10권 이상 탐독하고 교수님께 자문을 구하며 단열재 두께와 창호 위치를 수십 번 수정했습니다. 그 결과 시뮬레이션 상 목표 수치를 달성했고, 공모전에서 은상을 수상하는 쾌거를 이뤘습니다.',
        answerSize: 290,
        modifiedAt: new Date().toISOString(),
      },
      {
        qnAId: 3,
        question:
          '조직 내에서 갈등이나 어려운 상황을 극복한 경험을 기술해 주십시오.',
        answer:
          '학생회 활동 중 축제 예산 배분을 두고 기획부와 총무부 간의 갈등이 있었습니다. 저는 양측의 입장을 모두 듣고, "기존 물품 재사용을 통한 비용 절감"과 "스폰서십 유치"라는 절충안을 제시했습니다. 직접 발로 뛰며 지역 상점의 후원을 이끌어내 부족한 예산을 충당했고, 양 부서 모두 만족하는 성공적인 축제를 만들 수 있었습니다.',
        answerSize: 270,
        modifiedAt: new Date().toISOString(),
      },
      {
        qnAId: 4,
        question: '현대건설에 지원한 동기와 입사 후 포부를 기술해 주십시오.',
        answer:
          '대한민국의 랜드마크를 건설해온 현대건설의 역사와 함께하고 싶어 지원했습니다. 특히 중동 지역의 대규모 플랜트 사업 성공 신화는 저에게 큰 영감을 주었습니다. 입사 후 현장 경험을 착실히 쌓아 10년 뒤에는 해외 현장 소장으로서 글로벌 건설 시장을 누비는 리더가 되고 싶습니다.',
        answerSize: 240,
        modifiedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 202,
    applySeason: '2024년 하반기',
    companyName: '현대건설',
    jobPosition: '플랜트설계',
    questionCount: 3,
    modifiedAt: new Date(Date.now() - 604800000).toISOString(),
    question: [
      {
        qnAId: 1,
        question: '플랜트 산업에 관심을 갖게 된 계기와 관련 역량을 기술하시오.',
        answer:
          '화학공학을 전공하며 공정 설계 수업에서 HYSYS 프로그램을 다루며 흥미를 느꼈습니다. 복잡한 배관과 장치들이 유기적으로 연결되어 거대한 결과물을 만들어내는 과정에 매료되었습니다. 이후 화공기사를 취득하고 P&ID 해석 능력을 길렀으며, 3D CAD 툴 활용 능력을 갖추었습니다.',
        answerSize: 220,
        modifiedAt: new Date(Date.now() - 604800000).toISOString(),
      },
      {
        qnAId: 2,
        question: '본인의 책임감을 발휘하여 과업을 완수한 경험을 기술하시오.',
        answer:
          '팀 프로젝트 중 팀장이 개인 사정으로 중도 하차하는 위기가 있었습니다. 저는 남은 팀원들을 독려하며 제가 임시 팀장을 맡겠다고 자처했습니다. 매일 진행 상황을 체크하고 부족한 부분을 밤새워 보완했습니다. 포기하지 않는 책임감 덕분에 프로젝트를 기한 내에 제출하고 A+ 학점을 받을 수 있었습니다.',
        answerSize: 230,
        modifiedAt: new Date(Date.now() - 604800000).toISOString(),
      },
      {
        qnAId: 3,
        question: '글로벌 역량을 키우기 위해 노력한 경험이 있다면 기술하시오.',
        answer:
          '해외 플랜트 현장에서는 영어 소통 능력이 필수라고 생각합니다. 저는 교환학생 시절 다국적 친구들과 엔지니어링 동아리 활동을 하며 전공 영어를 익혔습니다. 또한, OPIc AL 등급을 취득하여 비즈니스 회화 능력을 검증받았습니다.',
        answerSize: 190,
        modifiedAt: new Date(Date.now() - 604800000).toISOString(),
      },
    ],
  },

  // ----------------------------------------------------------------
  // [기아] 폴더 - 5개
  // ----------------------------------------------------------------
  {
    id: 301,
    applySeason: '2025년 상반기',
    companyName: '기아',
    jobPosition: 'PBV 비즈니스 기획',
    questionCount: 3,
    modifiedAt: new Date().toISOString(),
    question: [
      {
        qnAId: 1,
        question:
          '기아의 PBV(Purpose Built Vehicle) 사업 비전에 대해 본인의 생각을 기술하고, 기여할 수 있는 바를 작성하시오.',
        answer:
          'PBV는 단순한 이동 수단을 넘어 비즈니스 솔루션을 제공하는 혁신입니다. 물류, 배송, 라이드 헤일링 등 용도에 최적화된 모빌리티는 미래 도시의 혈관과 같다고 생각합니다. 경영학적 지식과 스타트업 인턴십을 통해 쌓은 B2B 비즈니스 모델 분석 능력을 바탕으로, 고객사의 니즈를 정확히 타격하는 PBV 상품 기획에 기여하겠습니다.',
        answerSize: 250,
        modifiedAt: new Date().toISOString(),
      },
      {
        qnAId: 2,
        question:
          '새로운 관점으로 문제를 해결한 창의적인 경험을 기술해 주십시오.',
        answer:
          '편의점 아르바이트 당시, 유통기한 임박 상품의 폐기율이 높은 것이 문제였습니다. 저는 이를 해결하기 위해 "마감 할인 랜덤 박스" 아이디어를 점장님께 제안했습니다. 젊은 층의 호기심을 자극하는 마케팅으로 포장하여 판매한 결과, 폐기율을 70% 줄이고 매출은 15% 상승시켰습니다. 관점을 조금만 바꾸면 위기를 기회로 만들 수 있음을 배웠습니다.',
        answerSize: 260,
        modifiedAt: new Date().toISOString(),
      },
      {
        qnAId: 3,
        question: '협업 시 가장 중요하게 생각하는 가치는 무엇입니까?',
        answer:
          '"신뢰"입니다. 각자가 맡은 바를 책임지고 수행할 것이라는 믿음이 있어야 시너지가 납니다. 팀 프로젝트에서 저는 약속된 마감 시간을 철저히 지키며 신뢰를 쌓았고, 이를 바탕으로 팀원들의 자발적인 참여를 이끌어냈습니다.',
        answerSize: 180,
        modifiedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 302,
    applySeason: '2025년 상반기',
    companyName: '기아',
    jobPosition: '글로벌 마케팅',
    questionCount: 2,
    modifiedAt: new Date().toISOString(),
    question: [
      {
        qnAId: 1,
        question:
          '기아 브랜드가 글로벌 시장에서 나아가야 할 방향성을 제시하시오.',
        answer:
          '기아는 "Movement that inspires"라는 슬로건 아래 역동적인 이미지를 구축했습니다. 이제는 전동화 시대의 리더로서 "지속 가능한 영감"을 주는 브랜드로 자리잡아야 합니다. 특히 유럽 시장의 친환경 니즈와 북미 시장의 실용성을 동시에 공략하는 듀얼 트랙 전략이 필요합니다. 디지털 네이티브 세대를 위한 메타버스 마케팅 강화도 제안하고 싶습니다.',
        answerSize: 260,
        modifiedAt: new Date().toISOString(),
      },
      {
        qnAId: 2,
        question:
          '타문화에 대한 이해와 소통 능력을 발휘한 경험을 기술해 주십시오.',
        answer:
          '미국 인턴십 당시, 현지 직원들과 한국 본사 간의 커뮤니케이션을 지원했습니다. 단순 통역이 아니라, 양국의 업무 스타일과 문화적 맥락(High Context vs Low Context) 차이를 설명하며 오해를 풀었습니다. 덕분에 프로젝트 지연을 막고 원활한 협업을 이끌어내어 "최고의 가교"라는 평가를 받았습니다.',
        answerSize: 240,
        modifiedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 303,
    applySeason: '2024년 하반기',
    companyName: '기아',
    jobPosition: '구매',
    questionCount: 4,
    modifiedAt: new Date().toISOString(),
    question: [
      {
        qnAId: 1,
        question:
          '구매 직무에 필요한 핵심 역량은 무엇이며, 본인이 적임자인 이유를 서술하시오.',
        answer:
          '데이터 분석 능력과 협상력입니다. 저는 통계학 부전공으로 원자재 가격 추이를 분석하여 최적의 구매 시점을 예측하는 능력을 키웠습니다. 또한, 대학 축제 준비 위원회에서 물품 구매 계약을 진행하며 끈질긴 협상 끝에 예산을 15% 절감한 경험이 있어, 기아의 원가 경쟁력 확보에 기여할 자신이 있습니다.',
        answerSize: 230,
        modifiedAt: new Date().toISOString(),
      },
      {
        qnAId: 2,
        question:
          '예상치 못한 문제에 직면했을 때, 원칙을 준수하며 해결한 경험이 있습니까?',
        answer:
          '시험 기간 중 족보(기출문제) 공유의 유혹이 있었지만, 정직하게 공부하는 것이 저의 원칙이었습니다. 비록 요령을 피운 친구들보다 점수는 낮았을지라도, 전공 지식을 탄탄히 쌓았다는 자부심이 있습니다. 구매 직무에서도 투명성과 공정성이라는 원칙을 최우선으로 하여 협력사와의 신뢰 관계를 구축하겠습니다.',
        answerSize: 240,
        modifiedAt: new Date().toISOString(),
      },
      {
        qnAId: 3,
        question:
          '자동차 산업의 공급망 이슈(Supply Chain Crisis)에 대한 대응 방안을 제안하시오.',
        answer:
          '특정 국가나 업체에 의존하는 리스크를 분산시키는 "멀티 소싱" 전략이 필수적입니다. 또한, 협력사와의 실시간 재고 데이터 공유 시스템을 구축하여 위기 징후를 조기에 포착해야 합니다.',
        answerSize: 150,
        modifiedAt: new Date().toISOString(),
      },
      {
        qnAId: 4,
        question: '입사 후 이루고 싶은 목표는 무엇입니까?',
        answer:
          '글로벌 소싱 전문가로 성장하여, 전 세계 곳곳의 우수한 부품사를 발굴하고 기아의 품질 경쟁력을 높이는 것입니다. 특히 배터리 원자재 확보 분야에서 전문성을 키우고 싶습니다.',
        answerSize: 160,
        modifiedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 304,
    applySeason: '2024년 하반기',
    companyName: '기아',
    jobPosition: '품질보증',
    questionCount: 3,
    modifiedAt: new Date().toISOString(),
    question: [
      {
        qnAId: 1,
        question:
          '품질이란 무엇이라고 생각하며, 품질 확보를 위해 어떤 노력을 했는지 기술하시오.',
        answer:
          '품질은 "고객과의 약속"입니다. 작은 결함 하나가 기업의 신뢰를 무너뜨릴 수 있기 때문입니다. 저는 품질경영기사를 준비하며 6시그마와 SPC(통계적 공정 관리) 기법을 익혔습니다. 프로젝트에서 코드 리뷰를 도입하여 버그 발생률을 현저히 낮춘 경험도 있습니다.',
        answerSize: 210,
        modifiedAt: new Date().toISOString(),
      },
      {
        qnAId: 2,
        question:
          '데이터를 활용하여 문제를 분석하고 개선안을 도출한 경험을 서술하시오.',
        answer:
          '공모전 데이터를 분석하던 중, 특정 시간대에 서버 응답 속도가 느려지는 패턴을 발견했습니다. 로그 데이터를 시각화하여 병목 구간을 찾아냈고, 쿼리 최적화를 통해 응답 시간을 50% 단축했습니다. 데이터 뒤에 숨겨진 원인을 찾아내는 통찰력을 품질 문제 해결에 활용하겠습니다.',
        answerSize: 220,
        modifiedAt: new Date().toISOString(),
      },
      {
        qnAId: 3,
        question: '본인의 꼼꼼함이나 세심함이 돋보였던 사례를 기술하시오.',
        answer:
          '회계 동아리 총무를 맡아 1원 단위의 오차도 허용하지 않고 장부를 관리했습니다. 영수증 하나하나를 대조하며 누락된 내역을 찾아내 동아리 재정의 투명성을 확보했습니다.',
        answerSize: 150,
        modifiedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 305,
    applySeason: '2024년 상반기',
    companyName: '기아',
    jobPosition: '데이터 분석',
    questionCount: 2,
    modifiedAt: new Date().toISOString(),
    question: [
      {
        qnAId: 1,
        question:
          '데이터 분석 역량을 키우기 위해 수행한 프로젝트와 본인의 역할을 구체적으로 기술하시오.',
        answer:
          '"서울시 따릉이 수요 예측 프로젝트"를 수행했습니다. Python과 Pandas를 활용해 1년 치의 대여 데이터를 전처리하고, 날씨와 요일 변수를 추가하여 XGBoost 모델을 학습시켰습니다. 저는 데이터 전처리와 피처 엔지니어링을 주도적으로 담당했으며, 예측 정확도(RMSE)를 기존 대비 15% 개선하는 성과를 거뒀습니다.',
        answerSize: 270,
        modifiedAt: new Date().toISOString(),
      },
      {
        qnAId: 2,
        question:
          '기아의 데이터 자산을 활용하여 창출할 수 있는 새로운 가치는 무엇이라 생각합니까?',
        answer:
          '커넥티드 카 데이터를 활용한 "개인화 보험 및 정비 서비스"라고 생각합니다. 주행 습관 데이터를 분석하여 안전 운전자에게 보험료를 할인해주거나, 소모품 교체 주기를 정확히 예측하여 알림을 주는 서비스는 고객 충성도를 높이는 핵심 키가 될 것입니다.',
        answerSize: 210,
        modifiedAt: new Date().toISOString(),
      },
    ],
  },
];

// 1. [지원동기] 관련 문항
export const MOCK_MOTIVATION_ITEMS: QuestionItem[] = [
  {
    id: 1,
    companyName: '삼성전자',
    jobPosition: 'MX사업부 마케팅',
    applySeason: '2025년 상반기',
    question:
      '삼성전자를 지원한 이유와 입사 후 회사에서 이루고 싶은 꿈을 기술하십시오.',
    answer:
      '글로벌 모바일 시장에서의 압도적인 점유율과 끊임없는 폴더블 혁신에 매료되어 지원했습니다. 입사 후 Z세대를 타겟팅한 새로운 브랜드 캠페인을 주도하고 싶습니다.',
  },
  {
    id: 2,
    companyName: 'LG에너지솔루션',
    jobPosition: '배터리 셀 개발',
    applySeason: '2024년 하반기',
    question:
      '지원 분야에 관심을 갖게 된 계기와 해당 분야의 전문가로 성장하기 위해 기울인 노력을 서술해 주십시오.',
    answer:
      '전기차 시장의 급성장을 보며 배터리 기술이 미래 산업의 핵심임을 확신했습니다. 학부 시절 신소재 공학 프로젝트를 통해 양극재 효율 개선 실험을 주도하며...',
  },
];

// 2. [성공경험] 관련 문항
export const MOCK_SUCCESS_ITEMS: QuestionItem[] = [
  {
    id: 3,
    companyName: 'SK하이닉스',
    jobPosition: '양산기술',
    applySeason: '2025년 상반기',
    question:
      '자발적으로 최고 수준의 목표를 세우고 끈질기게 성취한 경험에 대해 서술해 주십시오.',
    answer:
      '졸업 작품 프로젝트 당시, 기존 센서 대비 감도를 20% 향상시키겠다는 도전적인 목표를 세웠습니다. 수십 번의 실패 끝에 노이즈 캔슬링 알고리즘을 최적화하여...',
  },
  {
    id: 4,
    companyName: '네이버',
    jobPosition: '서비스 기획',
    applySeason: '2024년 하반기',
    question:
      '가장 열정을 가지고 임했던 프로젝트 경험과 그 과정에서 배운 점을 기술해주세요.',
    answer:
      '교내 창업 동아리에서 중고 서적 거래 플랫폼을 기획했습니다. 실제 런칭 3개월 만에 MAU 1,000명을 달성하는 쾌거를 이루었습니다.',
  },
  {
    id: 5,
    companyName: '카카오',
    jobPosition: '서버 개발자',
    applySeason: '2024년 상반기',
    question:
      '어려운 문제를 해결하기 위해 창의적인 방법을 시도했던 경험을 구체적으로 설명해주세요.',
    answer:
      '대용량 트래픽 처리를 위한 해커톤에서 로드 밸런싱 이슈가 발생했습니다. 기존 방식 대신 새로운 캐싱 전략을 도입하여 응답 속도를 0.5초 단축시켰습니다.',
  },
  {
    id: 6,
    companyName: 'CJ제일제당',
    jobPosition: '식품마케팅',
    applySeason: '2023년 하반기',
    question:
      '예상치 못한 문제에 직면했을 때 이를 극복하고 성과를 낸 경험이 있습니까?',
    answer:
      '신제품 시식 행사 당일 폭우로 인해 유동 인구가 급감했습니다. 이에 행사를 온라인 라이브 방송으로 빠르게 전환하여 목표 대비 120%의 홍보 효과를 거두었습니다.',
  },
  {
    id: 7,
    companyName: '롯데백화점',
    jobPosition: 'MD',
    applySeason: '2023년 상반기',
    question:
      '남들과 다른 방식으로 생각하여 변화를 이끌어낸 경험에 대해 기술해 주십시오.',
    answer:
      '기존의 진열 방식이 2030 세대에게 매력적이지 않다고 판단하여, 팝업 스토어 형태의 큐레이션 존을 제안했습니다. 그 결과 해당 코너의 매출이 전월 대비 30% 상승했습니다.',
  },
];

// 3. [갈등경험] 관련 문항
export const MOCK_CONFLICT_ITEMS: QuestionItem[] = [
  {
    id: 8,
    companyName: '포스코',
    jobPosition: '설비기술',
    applySeason: '2025년 상반기',
    question:
      '조직 내에서 의견 차이나 갈등이 발생했을 때 이를 어떻게 해결했는지 구체적인 사례를 들어 기술하십시오.',
    answer:
      '팀 프로젝트 중 설계 방식에 대해 팀원 간 의견이 엇갈렸습니다. 감정적인 대립 대신 각 안의 장단점을 수치화하여 비교하는 표를 만들자고 제안했고, 이를 통해 합리적인 결론을 도출했습니다.',
  },
  {
    id: 9,
    companyName: '아모레퍼시픽',
    jobPosition: 'SCM',
    applySeason: '2024년 하반기',
    question:
      '공동의 목표 달성을 위해 협업하는 과정에서 자신과 다른 의견을 가진 사람을 설득해본 경험이 있습니까?',
    answer:
      '물류 프로세스 개선 프로젝트에서 현장 작업자분들의 반대가 있었습니다. 현장에 2주간 상주하며 그분들의 고충을 먼저 경청하고, 개선안이 업무 강도를 실제로 낮출 수 있음을 데이터로 증명하여 설득했습니다.',
  },
  {
    id: 10,
    companyName: '대한항공',
    jobPosition: '일반직',
    applySeason: '2024년 상반기',
    question:
      '동료와 원활한 소통을 위해 본인이 특별히 노력하는 점은 무엇이며, 그로 인해 갈등을 예방하거나 해결한 경험을 기술하세요.',
    answer:
      '저는 "중간 요약" 화법을 사용하여 오해를 줄입니다. 외국인 유학생과의 팀 과제에서 언어 장벽으로 인한 갈등이 생길 뻔했으나, 회의 끝마다 서로 이해한 내용을 재확인하는 절차를 두어 무사히 과제를 마쳤습니다.',
  },
];

// qnAName에 따라 적절한 목 데이터를 반환하는 함수
export const getMockQuestionsByQnAName = (
  qnAName: string | null,
): QuestionItem[] => {
  switch (qnAName) {
    case '지원동기':
      return MOCK_MOTIVATION_ITEMS;
    case '성공경험':
      return MOCK_SUCCESS_ITEMS;
    case '갈등경험':
      return MOCK_CONFLICT_ITEMS;
    default:
      return [];
  }
};
