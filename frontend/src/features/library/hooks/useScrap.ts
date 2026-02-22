import { useEffect, useState } from 'react';

import { useCreateScrapMutation } from '@/features/library/hooks/queries/useScrapMutations';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import { useDeleteScrapMutation } from '@/shared/hooks/useScrapQueries';

interface UseScrapProps {
  qnAId: number;
  initialScrapState: boolean;
}

export const useScrap = ({ qnAId, initialScrapState }: UseScrapProps) => {
  const { showToast } = useToastMessageContext();

  // 로컬 상태 (낙관적 업데이트용)
  const [isScraped, setIsScraped] = useState(initialScrapState);

  // 서버 데이터 동기화 (invalidateQueries 실행 시 최신 상태 반영)
  useEffect(() => {
    setIsScraped(initialScrapState);
  }, [initialScrapState]);

  const { mutateAsync: createScrap } = useCreateScrapMutation();
  const { mutateAsync: deleteScrap } = useDeleteScrapMutation();

  const handleToggleScrap = async () => {
    const previousState = isScraped;

    // 1. UI 즉시 반영 (낙관적 업데이트)
    setIsScraped(!previousState);

    try {
      if (previousState) {
        await deleteScrap(qnAId);
        showToast('스크랩이 삭제되었습니다.'); // 두 번째 인자는 프로젝트 스펙에 맞게 조정하세요
      } else {
        await createScrap(qnAId);
        showToast('스크랩 목록에 추가되었습니다.');
      }
    } catch (error) {
      // 2. 실패 시 원래 상태로 롤백 및 에러 토스트
      setIsScraped(previousState);
      showToast('처리에 실패했습니다. 다시 시도해주세요.');
      console.error('Scrap toggle failed:', error);
    }
  };

  return {
    isScraped,
    handleToggleScrap,
  };
};
