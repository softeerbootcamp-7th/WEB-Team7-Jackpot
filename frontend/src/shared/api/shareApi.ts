import { apiClient } from '@/shared/api/apiClient';
import type { RecentCoverLetterType } from '@/shared/types/coverLetter';
import type { ShareQnA } from '@/shared/types/qna';

interface ShareCoverLetterInfo {
  coverLetter: RecentCoverLetterType;
  qnAIds: number[];
}



// ShareId로 CoverLetter와 QnAId 목록 조회
export const getShareCoverLetterWithQnAIds = async (
  shareId: string,
): Promise<ShareCoverLetterInfo> => {
  return apiClient.get<ShareCoverLetterInfo>({
    endpoint: `/share/${shareId}/qna/id/all`,
  });
};

// ShareId로 버전을 포함한 QnA 단건 조회
export const getShareQnA = async (
  shareId: string,
  qnAId: number,
): Promise<ShareQnA> => {
  return apiClient.get<ShareQnA>({
    endpoint: `/share/${shareId}/qna/${qnAId}`,
  });
};
