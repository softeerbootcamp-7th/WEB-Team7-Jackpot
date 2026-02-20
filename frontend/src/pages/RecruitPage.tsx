import { useCallback, useMemo, useState } from 'react';

import { useParams } from 'react-router';

import CalendarContainer from '@/features/recruit/components/calendar/CalendarContainer';
import NewRecruitButton from '@/features/recruit/components/NewRecruitButton';
import RecruitFormContainer from '@/features/recruit/components/recruitForm/RecruitFormContainer';
import RecruitListContainer from '@/features/recruit/components/recruitForm/RecruitListContainer';
import {
  recruitEmptyText,
  recruitHeaderText,
} from '@/features/recruit/constants';
import { useDeleteCoverLetter } from '@/features/recruit/hooks/queries/useCoverLetterMutation';
import ContentHeader from '@/shared/components/ContentHeader';
import EmptyCase from '@/shared/components/EmptyCase';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import { getISODate } from '@/shared/utils/dates';

const RecruitPage = () => {
  const { year, month, day } = useParams();
  const { mutate: deleteCoverLetter } = useDeleteCoverLetter();
  const { showToast } = useToastMessageContext();

  // 상태 관리
  // 폼이 열려있는지 여부
  const [isFormOpen, setIsFormOpen] = useState(false);
  // 수정할 공고의 ID (null이면 신규 작성, 값이 있으면 수정 모드)
  const [editingRecruitId, setEditingRecruitId] = useState<number | null>(null);

  // 날짜 계산 로직
  const selectedDateParams = useMemo(() => {
    if (year && month && day) {
      const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      return { startDate: dateStr, endDate: dateStr };
    }
    const today = getISODate(new Date());
    return { startDate: today, endDate: today };
  }, [year, month, day]);

  // 신규 등록 버튼 클릭
  const handleNewRecruitButtonClick = useCallback(() => {
    setEditingRecruitId(null); // ID 초기화 (신규)
    setIsFormOpen(true);
  }, []);

  // // [박소민] 리스트 아이템 클릭 (상세 조회) TODO: 기획 확인
  // const handleDocumentClick = useCallback((id: number) => {
  //   console.log('상세 조회:', id);
  //   // 상세 모달 로직 등
  // }, []);

  // 수정 버튼 클릭
  const handleEditClick = useCallback((id: number) => {
    setEditingRecruitId(id); // 수정할 ID 설정
    setIsFormOpen(true); // 폼 열기
  }, []);

  // 삭제 버튼 클릭
  // [박소민] TODO: 삭제 모달 구현 (window.confirm은 임시)
  const handleDeleteClick = useCallback(
    (id: number) => {
      if (window.confirm('정말 삭제하시겠습니까?')) {
        deleteCoverLetter({ coverLetterId: id });
        showToast('공고가 삭제되었습니다.', true);
      }
    },
    [deleteCoverLetter, showToast],
  );

  // 폼 닫기
  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingRecruitId(null);
  }, []);

  return (
    <div className='flex h-[calc(100vh-5.625rem)] w-full max-w-screen min-w-[1700px] flex-col px-75 pb-30'>
      <div className='flex flex-row items-center justify-between'>
        <ContentHeader {...recruitHeaderText} />
        <NewRecruitButton onClick={handleNewRecruitButtonClick} />
      </div>

      <div className='flex h-full flex-row items-start gap-1'>
        <div className='flex-none'>
          <CalendarContainer />
        </div>
        {/* [박소민] TODO: 레이아웃 flex-1 처리 필요 */}
        <div className='h-full flex-1 pl-4'>
          {isFormOpen ? (
            <RecruitFormContainer
              // 수정 모드일 경우 ID를 넘겨줘서 데이터를 불러오게 함
              recruitId={editingRecruitId}
              onClose={handleCloseForm}
            />
          ) : (
            <RecruitListContainer
              dateParams={selectedDateParams}
              // onItemClick={handleDocumentClick}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              emptyComponent={
                <EmptyCase
                  {...recruitEmptyText}
                  size='small'
                  className='mt-35'
                />
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruitPage;
