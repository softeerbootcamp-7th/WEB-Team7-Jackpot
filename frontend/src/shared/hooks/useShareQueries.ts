import { useQuery } from '@tanstack/react-query';

import {
  getShareCoverLetterWithQnAIds,
  getShareQnA,
} from '@/shared/api/shareApi';

// ShareId로 CoverLetter 정보 + QnA ID 목록 조회 
export const useShareCoverLetter = (shareId: string, isConnected: boolean) => {
  return useQuery({
    queryKey: ['share', shareId, 'coverLetter'],
    queryFn: () => getShareCoverLetterWithQnAIds(shareId),
    staleTime: 5 * 60 * 1000,
    enabled: isConnected,
  });
};

// ShareId로 QnA 단건 조회 (페이지네이션 전환용 non-suspense)
// staleTime 미설정 의도: 페이지 전환 시 항상 최신 QnA 데이터를 가져와야 하므로 기본값(0) 사용
export const useShareQnA = (shareId: string, qnAId: number | undefined) => {
  return useQuery({
    queryKey: ['share', shareId, 'qna', qnAId],
    queryFn: () => {
      if (qnAId == null) {
        throw new Error('qnAId is required');
      }
      return getShareQnA(shareId, qnAId);
    },
    enabled: qnAId !== null,
  });
};
