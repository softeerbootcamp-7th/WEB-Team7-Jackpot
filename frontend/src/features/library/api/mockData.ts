import type {
  CoverLetterListResponse,
  LibraryResponse,
  QuestionListResponse,
} from '../types';

// 기업 혹은 문항 폴더 리스트
export const MOCK_LIBRARIES: LibraryResponse = {
  libraries: [
    '성장과정',
    '지원동기',
    '성격의 장단점',
    '입사 후 포부',
    '직무 수행 경험',
    '실패/극복 사례',
    '현대자동차',
    '기아',
    '현대제철',
    '현대오토에버',
    '현대모비스',
    '현대트랜시스',
    '현대위아',
    '현대엠시트',
    '현대케피코',
    '현대아이에이치엘',
    '현대파텍스',
  ],
};

/*
    '성장과정',
    '지원동기',
    '성격의 장단점',
    '입사 후 포부',
    '직무 수행 경험',
    '실패/극복 사례',
*/

// 기업 폴더 선택 시 (자소서 리스트)
export const MOCK_COVER_LETTERS: CoverLetterListResponse = {
  coverLetters: [
    {
      id: 1,
      applySeason: '2025년 상반기',
      companyName: '현대자동차',
      jobPosition: '인포테인먼트 SW 개발',
      questionCount: 3,
      modifiedAt: '2025-01-30T14:20:00Z',
    },
    {
      id: 2,
      applySeason: '2025년 상반기',
      companyName: '삼성전자',
      jobPosition: 'MX사업부 Front-end',
      questionCount: 4,
      modifiedAt: '2025-01-25T09:41:00Z',
    },
    {
      id: 3,
      applySeason: '2024년 하반기',
      companyName: 'NAVER',
      jobPosition: 'FE 플랫폼 개발',
      questionCount: 2,
      modifiedAt: '2024-11-10T11:00:00Z',
    },
    {
      id: 4,
      applySeason: '2024년 하반기',
      companyName: '우아한형제들',
      jobPosition: '웹프론트엔드 개발자',
      questionCount: 3,
      modifiedAt: '2024-10-05T18:30:00Z',
    },
  ],
  hasNext: true,
};

// 문항 폴더 선택 시 (질문/답변 리스트)
export const MOCK_QUESTIONS: QuestionListResponse = {
  questions: [
    {
      id: 101,
      companyName: '삼성전자',
      jobPosition: '개발자',
      applySeason: '2025년 상반기',
      question:
        '본인의 성장과정을 간략히 설명하세요 (방황했던 시기와 극복 과정을 포함하여)',
      answer:
        '대학 시절 컴퓨터공학을 전공하며 알고리즘 동아리 회장을 맡았을 때...',
    },
    {
      id: 102,
      companyName: 'LG CNS',
      jobPosition: 'Cloud Application Modernization',
      applySeason: '2024년 하반기',
      question: '지원한 직무를 수행하기 위해 키워온 역량은 무엇입니까?',
      answer:
        'React와 TypeScript를 활용한 프로젝트 경험을 통해 컴포넌트 설계 능력을 길렀습니다. 특히 Layered Architecture를 도입하여...',
    },
    {
      id: 103,
      companyName: 'SK하이닉스',
      jobPosition: 'Solution SW',
      applySeason: '2024년 상반기',
      question:
        '자발적으로 최고 수준의 목표를 세우고 끈질기게 성취한 경험에 대해 서술해 주십시오.',
      answer:
        '오픈소스 프로젝트에 기여하며 메모리 누수 문제를 해결한 경험이 있습니다. 크롬 개발자 도구의 Performance 탭을 분석하여...',
    },
  ],
  hasNext: false, // 더 이상 불러올 데이터가 없다고 가정
};

// 나중에 이동
export const MOCK_RESULT = {
  libraryCount: 2,
  libraries: ['성장과정', '지원동기'],
  questionCount: 3,
  questions: [
    {
      questionId: 1,
      companyName: '삼성전자',
      jobPosition: '백엔드 개발자',
      applySeason: '2025년 하반기',
      question: '본인의 성장과정을 간략히 설명하세요',
      answer: '대학 시절, 다양한 프로젝트를 통해...',
    },
    // ... 나머지 데이터
  ],
};
