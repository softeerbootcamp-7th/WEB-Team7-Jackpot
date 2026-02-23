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
    if (isLoading) return;
    const previousState = isScraped;

    setIsScraped(!previousState); // 낙관적 업데이트 (UI 즉시 반영)

    try {
      if (previousState) {
        await deleteScrap(qnAId);
        showToast('스크랩이 삭제되었습니다.');
      } else {
        await createScrap(qnAId);
        showToast('스크랩 목록에 추가되었습니다.');
      }
      // 요청이 성공하면 컴포넌트 외부에서 invalidateQueries가 동작하고,
      // 부모 컴포넌트가 최신 initialScrapState를 다시 내려주면서
      // 위의 useEffect가 자연스럽게 한 번만 실행되어 최종 상태를 확정
    } catch (error) {
      setIsScraped(previousState); // 실패 시 롤백
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
