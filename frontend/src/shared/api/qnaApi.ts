import { getAccessToken } from '@/features/auth/libs/tokenStore';
import type { QnA } from '@/shared/types/qna';
import { parseErrorResponse } from '@/shared/utils/fetchUtils';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 하나의 자기소개서의 QnA id 목록 조회
export const getQnAIdList = async ({
  coverLetterId,
}: {
  coverLetterId: number;
}): Promise<number[]> => {
  const params = new URLSearchParams();
  params.append('coverLetterId', String(coverLetterId));

  const response = await fetch(`${BASE_URL}/qna/id/all?${params.toString()}`, {
    headers: {
      Authorization: getAccessToken(),
    },
  });

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  return response.json();
};

// 단건 QnA 조회
export const getQnA = async (qnaId: number): Promise<QnA> => {
  const response = await fetch(`${BASE_URL}/qna/${qnaId}`, {
    headers: {
      Authorization: getAccessToken(),
    },
  });

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  return response.json();
};

interface UpdateQnAResponse {
  qnAId: number; // 백엔드 응답과 일치
  modifiedAt: string;
}

// QnA 수정
export const updateQnA = async ({
  qnAId,
  answer,
}: {
  qnAId: number;
  answer: string;
}): Promise<UpdateQnAResponse> => {
  const response = await fetch(`${BASE_URL}/qna`, {
    method: 'PUT',
    headers: {
      Authorization: getAccessToken(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ qnAId, answer }),
  });

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  return response.json();
};
