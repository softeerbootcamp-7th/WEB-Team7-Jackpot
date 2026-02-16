import { z } from 'zod';

import { fetchCalendarDatesMock } from '@/features/recruit/api/mockData';
import type {
  CalendarRequest,
  CalendarResponse,
  CreateCoverLetterRequest,
  CreateCoverLetterResponse,
  UpdateCoverLetterRequest,
} from '@/features/recruit/types';
import { apiClient } from '@/shared/api/apiClient';

const isDev = import.meta.env.DEV;

// 1. ApiApplyHalf 타입 검증 (Enum)
const ApiApplyHalfSchema = z.enum(['FIRST_HALF', 'SECOND_HALF']);

// 2. 개별 공고 아이템 스키마 (CoverLetterItem)
const CoverLetterItemSchema = z.object({
  coverLetterId: z.number(),
  companyName: z.string(),
  jobPosition: z.string(),
  applyYear: z.number(),
  applyHalf: ApiApplyHalfSchema, // 위에서 정의한 Enum 사용
  deadline: z.string(),
  questionCount: z.number(),
});

// 3. 전체 달력 응답 스키마 (CalendarResponse)
const CalendarResponseSchema = z.object({
  totalCount: z.number(),
  coverLetters: z.array(CoverLetterItemSchema), // 아이템 배열
  hasNext: z.boolean(),
});

// 4. 공고 등록 응답 스키마 (CreateCoverLetterResponse)
const CreateCoverLetterResponseSchema = z.object({
  coverLetterId: z.number(),
});

// 1. 날짜별 공고 조회
export const fetchCalendarDates = async (
  params: CalendarRequest,
  lastIdParam?: number,
): Promise<CalendarResponse> => {
  if (isDev) {
    return fetchCalendarDatesMock(params, lastIdParam);
  }

  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    size: String(params.size ?? 7),
    isShared: String(params.isShared ?? true),
  });

  if (lastIdParam !== undefined) {
    queryParams.append('lastCoverLetterId', String(lastIdParam));
  }

  const response = await apiClient.get({
    endpoint: `/coverletter/all?${queryParams.toString()}`,
  });

  // as CalendarResponse 제거 -> Schema.parse() 사용
  // 응답 데이터가 위에서 정의한 Schema와 다르면 여기서 에러가 발생하여
  // 잘못된 데이터가 UI로 넘어가는 것을 방지합니다.
  return CalendarResponseSchema.parse(response);
};

// 2. 자기소개서 단건 조회는 shared API로 이미 구현됨

// 3. 공고 등록
export const createCoverLetter = async (
  payload: CreateCoverLetterRequest,
): Promise<CreateCoverLetterResponse> => {
  const response = await apiClient.post({
    endpoint: '/coverletter',
    body: payload,
  });

  // 응답 데이터 검증
  return CreateCoverLetterResponseSchema.parse(response);
};

// 4. 공고 수정
export const updateCoverLetter = async (
  payload: UpdateCoverLetterRequest,
): Promise<void> => {
  // 반환값이 void이므로 별도 검증 불필요 (성공 시 에러 없이 통과)
  await apiClient.put({
    endpoint: '/coverletter',
    body: payload,
  });
};

// 5. 공고 삭제
export const deleteCoverLetter = async (
  coverLetterId: number,
): Promise<void> => {
  await apiClient.delete({
    endpoint: `/coverletter/${coverLetterId}`,
  });
};
