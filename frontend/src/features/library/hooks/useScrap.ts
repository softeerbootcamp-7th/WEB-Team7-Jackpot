import { useEffect, useState } from 'react';

import {
  useCreateScrapMutation,
  useDeleteScrapMutation,
} from '@/features/library/hooks/queries/useScrapMutations';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';

interface Props {
  qnAId: number;
  initialScrapState: boolean;
}

export const useScrap = ({ qnAId, initialScrapState }: Props) => {
  const { showToast } = useToastMessageContext();

  // 로컬 상태 (낙관적 업데이트용)
  const [isScraped, setIsScraped] = useState(initialScrapState);

  // 🔥 핵심 해결책: 서버 데이터가 invalidate 되어 initialScrapState가 바뀌면 로컬 상태도 동기화합니다.
  useEffect(() => {
    setIsScraped(initialScrapState);
  }, [initialScrapState]);

  const { mutateAsync: createScrap } = useCreateScrapMutation();
  const { mutateAsync: deleteScrap } = useDeleteScrapMutation();

  const handleToggleScrap = async () => {
    // 1. UI 선반영 (낙관적 업데이트)
    const previousState = isScraped;
    setIsScraped(!previousState);

    try {
      if (previousState) {
        // 기존에 스크랩 상태였다면 삭제 API 호출
        await deleteScrap(qnAId);
        showToast('스크랩이 삭제되었습니다.', false);
      } else {
        // 아니었다면 생성 API 호출
        await createScrap(qnAId);
        showToast('스크랩 목록에 추가되었습니다.', true);
      }
      // 성공하면 뮤테이션 훅의 onSuccess가 동작하여 자동으로 invalidateQueries를 실행합니다.
    } catch (error) {
      // 2. 에러 로깅 및 롤백
      console.error('스크랩 토글 에러:', error);
      setIsScraped(previousState);
      showToast('처리에 실패했습니다. 다시 시도해주세요.', false);
    }
  };

  return {
    isScraped,
    handleToggleScrap,
  };
};
