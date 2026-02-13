import type { CoverLetter } from '@/shared/types/coverLetter';
import type { QnA } from '@/shared/types/qna';
import type { Review } from '@/shared/types/review';

// Mock API
export const mockCoverLetterApi: {
  coverLetter: CoverLetter;
  qnas: QnA[];
} = {
  coverLetter: {
    coverLetterId: 1,
    companyName: '삼성전자',
    jobPosition: '비주얼 인터랙션 디자인',
    applyYear: 2026,
    applyHalf: '상반기',
    deadline: '2025-01-25',
  },
  qnas: [
    {
      qnAId: 1,
      question:
        '본인의 성장과정, 성격의 장단점, 핵심 역량 및 지원 동기와 입사 후 포부를 구체적인 사례를 바탕으로 기술해 주십시오. (공백 포함 3,000자 이내)',
      answer:
        '저의 <c1>성장 과정을 통해 <c2>논리적 사고력</c2>을 키웠습니다</c1>. ' +
        '대학 시절 <c3>팀 프로젝트를 <c4>주도하며</c4> 협업의 중요성</c3>을 깨달았습니다. ' +
        '특히 <c5>정량적 분석과 <c6>사용자 조사</c6>를 통한 의사결정</c5> 과정에서 ' +
        '많은 것을 배웠습니다.',
      answerSize: 800,
      modifiedAt: '2026-02-12T18:00:00',
    },
    {
      qnAId: 2,
      question:
        '삼성전자에 지원한 이유와 해당 직무에 필요한 역량에 대해 설명해 주십시오. (공백 포함 1,500자 이내)',
      answer:
        '삼성전자의 <c7>혁신적인 <c8>기술력과 글로벌 영향력</c8>에 매료</c7>되어 ' +
        '지원하게 되었습니다. <c9>사용자 경험을 중시하는</c9> 디자인 철학이 ' +
        '<c10>저의 가치관과</c10> 부합합니다.',
      answerSize: 650,
      modifiedAt: '2026-02-12T18:00:00',
    },
  ],
};

export const mockFetchReviewsByQnaId = (qnAId: number) => {
  if (qnAId === 1) {
    return {
      reviews: [
        {
          id: 1,
          sender: { id: 'user-1', nickname: '귀여운 캥거루' },
          originText: '성장 과정을 통해 논리적 사고력을 키웠습니다',
          suggest:
            '성장 과정에서 논리적 사고 역량을 지속적으로 발전시켜 왔습니다',
          comment: '전체적인 문맥을 좀 더 구체적으로 풀어주면 좋겠습니다.',
          createdAt: '2025-01-26T10:00:00Z',
        },

        {
          id: 2,
          sender: { id: 'user-2', nickname: '멋진 사자' },
          originText: '문제 해결 능력',
          suggest: '논리적 문제 해결 능력',
          comment:
            '어떤 종류의 문제 해결 능력인지 구체화하면 더 좋을 것 같아요.',
          createdAt: '2025-01-20T09:45:00Z',
        },
        {
          id: 3,
          sender: { id: 'user-3', nickname: '똑똑한 올빼미' },
          originText: '팀 프로젝트를 주도하며 협업의 중요성',
          suggest: '팀 프로젝트에서 리더십을 발휘하며 협업의 가치',
          comment: '주도한 경험을 좀 더 강조하면 좋겠습니다.',
          createdAt: '2025-01-25T10:00:00Z',
        },
        {
          id: 4,
          sender: { id: 'user-5', nickname: '지혜로운 부엉이' },
          originText: '데이터 분석과 사용자 리서치를 통한 의사결정',
          suggest:
            '정량적 데이터 분석과 정성적 사용자 리서치를 결합한 의사결정',
          comment: '분석 방법을 좀 더 구체화하면 설득력이 높아집니다.',
          createdAt: '2025-01-22T10:10:00Z',
        },
        {
          id: 5,
          sender: { id: 'user-6', nickname: '친절한 펭귄' },
          originText: '사용자 리서치',
          suggest: '심층 사용자 인터뷰 및 관찰 조사',
          comment: '구체적인 리서치 방법론을 언급하면 좋겠어요.',
          createdAt: '2025-01-22T10:15:00Z',
        },
        {
          id: 99,
          sender: { id: 'user-99', nickname: '과거의 리뷰어' },
          originText: '체계적인 분석 프로세스',
          suggest: '보다 구조화된 분석 방법론',
          comment: '이 부분은 원문에서 완전히 삭제되었습니다.',
          createdAt: '2025-01-18T15:30:00Z',
        },
      ],
      hasNext: false,
    };
  }

  if (qnAId === 2) {
    return {
      reviews: [],
      hasNext: false,
    };
  }

  return { reviews: [], hasNext: false };
};

// TODO: 실제 API와 연동하는 로직으로 대체 필요
export const mockFetchCoverLetterById = (
  coverLetterId: number,
): { coverLetter: CoverLetter | null; qnas: QnA[] } => {
  if (coverLetterId === mockCoverLetterApi.coverLetter.coverLetterId) {
    return mockCoverLetterApi;
  }
  return { coverLetter: null, qnas: [] };
};

export const parseTaggedText = (raw: string) => {
  const openTagRegex = /<c(\d+)>/g;
  const closeTagRegex = /<\/c(\d+)>/g;

  const tags: Array<{
    id: string;
    type: 'open' | 'close';
    position: number;
    matchLength: number;
  }> = [];

  // 여는 태그 수집
  let match: RegExpExecArray | null;
  while ((match = openTagRegex.exec(raw)) !== null) {
    tags.push({
      id: match[1],
      type: 'open',
      position: match.index,
      matchLength: match[0].length,
    });
  }

  // 닫는 태그 수집
  while ((match = closeTagRegex.exec(raw)) !== null) {
    tags.push({
      id: match[1],
      type: 'close',
      position: match.index,
      matchLength: match[0].length,
    });
  }

  // 위치순 정렬
  tags.sort((a, b) => a.position - b.position);

  // 태그 제거하면서 실제 텍스트 위치 계산
  const taggedRanges: Array<{ id: string; start: number; end: number }> = [];
  const stack: Array<{ id: string; start: number }> = [];

  let cleaned = '';
  let lastIndex = 0;

  for (const tag of tags) {
    // 태그 이전의 텍스트 추가
    cleaned += raw.slice(lastIndex, tag.position);

    if (tag.type === 'open') {
      // 여는 태그: 스택에 추가
      stack.push({ id: tag.id, start: cleaned.length });
    } else {
      // 닫는 태그: 스택에서 매칭되는 여는 태그 찾기
      const openIndex = stack.findIndex((t) => t.id === tag.id);

      if (openIndex !== -1) {
        const open = stack[openIndex];
        taggedRanges.push({
          id: tag.id,
          start: open.start,
          end: cleaned.length,
        });
        stack.splice(openIndex, 1);
      } else {
        console.warn(`Closing tag </c${tag.id}> without matching opening tag`);
      }
    }

    lastIndex = tag.position + tag.matchLength;
  }

  // 남은 텍스트 추가
  cleaned += raw.slice(lastIndex);

  // 매칭되지 않은 여는 태그 경고
  if (stack.length > 0) {
    console.warn(
      'Unclosed tags:',
      stack.map((t) => t.id),
    );
  }

  return { cleaned, taggedRanges };
};

// TODO: 자신이 작성한 리뷰인지 여부도 함께 처리 필요
export const buildReviewsFromApi = (
  cleanedText: string,
  taggedRanges: Array<{ id: string; start: number; end: number }>,
  apiReviews: Array<{
    id: number;
    sender: { id: string; nickname: string };
    originText: string;
    suggest: string | null;
    comment: string;
    createdAt: string;
  }>,
) => {
  return apiReviews.map((api) => {
    const tagged = taggedRanges.find((t) => t.id === String(api.id));

    if (!tagged) {
      return {
        id: String(api.id),
        selectedText: api.originText,
        revision: api.suggest || '',
        comment: api.comment,
        range: { start: -1, end: -1 },
        sender: api.sender,
        originText: api.originText,
        suggest: api.suggest,
        createdAt: api.createdAt,
        isValid: false,
      } as Review;
    }

    const actualText = cleanedText.slice(tagged.start, tagged.end);
    const isTextMatching = actualText === api.originText;

    return {
      id: String(api.id),
      selectedText: api.originText,
      revision: api.suggest || '',
      comment: api.comment,
      range: { start: tagged.start, end: tagged.end },
      sender: api.sender,
      originText: api.originText,
      suggest: api.suggest,
      createdAt: api.createdAt,
      isValid: isTextMatching,
    } as Review;
  });
};

let internalReviewAutoId = 1000;
export const generateInternalReviewId = () => String(++internalReviewAutoId);
