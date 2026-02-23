import { apiClient } from '@/shared/api/apiClient';

/**
 * 스크랩 삭제
 */
export const deleteScrap = async (qnAId: number): Promise<void> => {
  return apiClient.delete<void>({
    endpoint: `/scraps/${qnAId}`,
  });
};
