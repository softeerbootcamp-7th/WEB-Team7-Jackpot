import type { Review } from '@/features/review/types/review';
import type { CoverLetter } from '@/shared/types/coverLetter';
import type { QnA } from '@/shared/types/qna';

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
    applyHalf: 'FIRST_HALF',
    deadline: '2025-01-25',
  },
  qnas: [
    {
      qnaId: 1,
      question:
        '본인의 성장과정, 성격의 장단점, 핵심 역량 및 지원 동기와 입사 후 포부를 구체적인 사례를 바탕으로 기술해 주십시오. (공백 포함 3,000자 이내)',
      answer:
        "저의 <c1>성장 과정을</c1> 관통하는 핵심 키워드는 '분석을 통한 개선'입니다. 학창 시절부터 단순히 주어진 과제를 수행하는 것에 그치지 않고, \"왜 이 방식이어야 하는가?\"라는 핵심 의문을 던지며 프로세스를 효율화하는 데 흥미를 느꼈습니다.\n대학 시절, 교내 동아리의 운영진으로 활동하며 고질적인 문제를 분석했습니다. 당시 단순 친목 도모 위주의 활동이 고학년 학생들에게는 매력적이지 않다는 점을 발견했고, 이를 보완하기 위해 '직무 스터디 세션'을 도입했습니다. 그 결과, 직전 학기 대비 이탈률을 40% 이상 감소시켰고, 이는 제가 <c2>성장 과정을</c2> 통해 문제를 정의하고 데이터를 기반으로 대안을 제시하는 기획자로서의 자질을 확인하는 계기가 되었습니다.\n저의 <c3>성장 과정을</c3> 관통하는 핵심 키워드는 '분석을 통한 개선'입니다. 학창 시절부터 단순히 주어진 과제를 수행하는 것에 그치지 않고, \"왜 이 방식이어야 하는가?\"라는 핵심 의문을 던지며 프로세스를 효율화하는 데 흥미를 느꼈습니다.\n대학 시절, 교내 동아리의 운영진으로 활동하며 고질적인 문제를 분석했습니다. 당시 단순 친목 도모 위주의 활동이 고학년 학생들에게는 매력적이지 않다는 점을 발견했고, 이를 보완하기 위해 '직무 스터디 세션'을 도입했습니다. 그 결과, 직전 학기 대비 이탈률을 40% 이상 감소시켰고, 이는 제가 <c4>성장 과정을</c4> 통해 문제를 정의하고 데이터를 기반으로 대안을 제시하는 기획자로서의 자질을 확인하는 계기가 되었습니다.",
      answerSize: 1233,
      modifiedAt: '2026-02-12T18:00:00',
    },
    {
      qnaId: 2,
      question:
        '삼성전자에 지원한 이유와 해당 직무에 필요한 역량에 대해 설명해 주십시오. (공백 포함 1,500자 이내)',
      answer:
        '삼성전자의 <c5>혁신적인 기술력</c5>과 글로벌 영향력에 매료되어 지원하게 되었습니다. 특히 사용자 경험을 중시하는 디자인 철학이 저의 가치관과 부합합니다.\n비주얼 인터랙션 디자이너로서 필요한 <c6>공감 능력과 창의성</c6>은 제 강점입니다. 사용자의 니즈를 깊이 있게 이해하고, 이를 직관적이고 아름다운 인터페이스로 구현하는 능력을 갖추고 있습니다.\n입사 후에는 글로벌 제품의 사용자 경험을 개선하는 데 기여하고 싶습니다.',
      answerSize: 650,
      modifiedAt: '2026-02-12T18:00:00',
    },
  ],
};

// TODO: 실제 API와 연동하는 로직으로 대체 필요
export const mockFetchReviewsByQnaId = (qnaId: number) => {
  if (qnaId === 1) {
    return {
      reviews: [
        {
          id: 1,
          sender: { id: 'user-1', nickname: '귀여운 캥거루' },
          originText: '성장 과정을',
          suggest: '저의 성장 과정을 관통하는 핵심 키워드로... ',
          comment:
            '첫 번째 성장 과정 부분을 더 구체적으로 서술하면 좋겠습니다.',
          createdAt: '2025-01-25T09:41:00Z',
        },
        {
          id: 2,
          sender: { id: 'user-2', nickname: '멋진 사자' },
          originText: '성장 과정을',
          suggest: '두 번째 성장 과정에서는 학습 포인트를 강조하면... ',
          comment: '이 부분은 더 깊이 있게 설명해야 할 것 같습니다.',
          createdAt: '2025-01-25T09:45:00Z',
        },
        {
          id: 3,
          sender: { id: 'user-3', nickname: '귀여운 캥거루' },
          originText: '성장 과정을',
          suggest: '저의 성장 과정을 관통하는 핵심 키워드로... ',
          comment:
            '첫 번째 성장 과정 부분을 더 구체적으로 서술하면 좋겠습니다.',
          createdAt: '2025-01-25T09:41:00Z',
        },
        {
          id: 4,
          sender: { id: 'user-4', nickname: '멋진 사자' },
          originText: '성장 과정을',
          suggest: '두 번째 성장 과정에서는 학습 포인트를 강조하면... ',
          comment: '이 부분은 더 깊이 있게 설명해야 할 것 같습니다.',
          createdAt: '2025-01-25T09:45:00Z',
        },
      ],
      hasNext: false,
    };
  }
  if (qnaId === 2) {
    return {
      reviews: [
        {
          id: 5,
          sender: { id: 'user-1', nickname: '귀여운 캥거루' },
          originText: '혁신적인 기술력',
          suggest: '삼성의 혁신적이고 선도적인 기술력',
          comment: '구체적인 제품 사례가 있으면 더 설득력 있을 것 같습니다.',
          createdAt: '2025-01-25T10:00:00Z',
        },
        {
          id: 6,
          sender: { id: 'user-3', nickname: '똑똑한 올빼미' },
          originText: '공감 능력과 창의성',
          suggest: '사용자 중심의 공감 능력과 혁신적 창의성',
          comment:
            '이런 역량을 실제로 어떻게 발휘했는지 구체적인 예시가 있으면 좋습니다.',
          createdAt: '2025-01-25T10:05:00Z',
        },
      ],
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
  const tagRegex = /<c(\d+)>([\s\S]*?)<\/c\1>/g;
  const taggedRanges: Array<{ id: string; start: number; end: number }> = [];

  let cleaned = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(raw)) !== null) {
    const [fullMatch, idStr, inner] = match;
    const matchStart = match.index;

    cleaned += raw.slice(lastIndex, matchStart);
    const startPos = cleaned.length;
    cleaned += inner;
    const endPos = cleaned.length;

    taggedRanges.push({
      id: String(parseInt(idStr, 10)),
      start: startPos,
      end: endPos,
    });

    lastIndex = matchStart + fullMatch.length;
  }

  cleaned += raw.slice(lastIndex);

  return { cleaned, taggedRanges };
};

export const buildReviewsFromApi = (
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
  return taggedRanges.map((tagged) => {
    const api = apiReviews.find((r) => String(r.id) === tagged.id);

    return {
      id: tagged.id,
      selectedText: api?.originText || '',
      revision: api?.suggest || '',
      comment: api?.comment || '',
      range: { start: tagged.start, end: tagged.end },
      sender: api?.sender,
      originText: api?.originText,
      suggest: api?.suggest ?? null,
      createdAt: api?.createdAt,
    } as Review;
  });
};

let internalReviewAutoId = 1000;
export const generateInternalReviewId = () => String(++internalReviewAutoId);
