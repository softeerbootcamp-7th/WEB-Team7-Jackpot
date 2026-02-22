import { useCallback, useMemo, useState } from 'react';

import { useParams } from 'react-router';

import { useDeleteCoverLetter } from '@/features/recruit/hooks/queries/useCoverLetterMutation';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import { getISODate, isValidDate } from '@/shared/utils/dates';

export const useRecruit = () => {
  const { year, month, day } = useParams();
  const { mutateAsync: deleteCoverLetter } = useDeleteCoverLetter();
  const { showToast } = useToastMessageContext();

  // 1. 상태 관리: 폼 UI 상태
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecruitId, setEditingRecruitId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 2. 파생 상태 (Derived State): 날짜 계산
  const selectedDateParams = useMemo(() => {
    if (year && month && day) {
      if (!isValidDate(year, month, day)) {
        const today = getISODate(new Date());
        return { startDate: today, endDate: today };
      }
      return {
        startDate: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
        endDate: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
      };
    }
  }, [year, month, day]);

  // 3. 액션 핸들러
  const openNewForm = useCallback(() => {
    setEditingRecruitId(null);
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((id: number) => {
    setEditingRecruitId(id);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingRecruitId(null);
  }, []);

  // 삭제 버튼을 눌렀을 때의 동작
  const openDeleteModal = useCallback((id: number) => {
    setDeletingId(id); // 삭제할 ID를 저장하고 모달을 띄워
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeletingId(null); // ID를 비워서 모달을 닫아
  }, []);

  // 실제 '삭제하기' 버튼을 눌렀을 때 실행될 로직
  const confirmDelete = useCallback(async () => {
    if (deletingId !== null) {
      await deleteCoverLetter({ coverLetterId: deletingId });
      showToast('공고가 삭제되었습니다.', true);
      setDeletingId(null); // 완료 후 모달 닫기
    }
  }, [deletingId, deleteCoverLetter, showToast]);

  return {
    state: {
      isFormOpen,
      editingRecruitId,
      selectedDateParams,
      deletingId,
    },
    actions: {
      openNewForm,
      openEditForm,
      closeForm,
      openDeleteModal,
      closeDeleteModal,
      confirmDelete,
    },
  };
};
