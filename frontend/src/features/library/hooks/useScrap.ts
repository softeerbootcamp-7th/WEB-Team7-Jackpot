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

  const [isScraped, setIsScraped] = useState(initialScrapState);

  const { mutateAsync: createScrap, isPending: isCreating } =
    useCreateScrapMutation();
  const { mutateAsync: deleteScrap, isPending: isDeleting } =
    useDeleteScrapMutation();

  const isLoading = isCreating || isDeleting;

  // 서버에서 새로운 상태가 내려왔을 때만 로컬 상태를 동기화합니다.
  useEffect(() => {
    setIsScraped(initialScrapState);
  }, [initialScrapState]);

  const handleToggleScrap = async () => {
    // mutation 진행 중이면 클릭 방지
    if (isLoading) return;

    const previousState = isScraped;
    // 낙관적 업데이트 (UI 즉시 반영)
    setIsScraped(!previousState);

    try {
      if (previousState) {
        // delete 완료될 때까지 대기 (이 동안 다른 클릭 차단됨)
        await deleteScrap(qnAId);
        showToast('스크랩이 삭제되었습니다.');
      } else {
        // create 완료될 때까지 대기 (이 동안 다른 클릭 차단됨)
        await createScrap(qnAId);
        showToast('스크랩 목록에 추가되었습니다.');
      }
      // onSuccess에서 invalidateQueries → useEffect에서 initialScrapState로 동기화
    } catch (error) {
      // 실패 시 낙관적 업데이트 롤백
      setIsScraped(previousState);
      showToast('처리에 실패했습니다. 다시 시도해주세요.');
      console.error('Scrap toggle failed:', error);
    }
  };

  return {
    isLoading,
    isScraped,
    handleToggleScrap,
  };
};
