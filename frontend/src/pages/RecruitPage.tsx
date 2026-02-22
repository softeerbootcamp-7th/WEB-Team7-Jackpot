import CalendarContainer from '@/features/recruit/components/calendar/CalendarContainer';
import NewRecruitButton from '@/features/recruit/components/NewRecruitButton';
import RecruitFormContainer from '@/features/recruit/components/recruitForm/RecruitFormContainer';
import RecruitListContainer from '@/features/recruit/components/recruitForm/RecruitListContainer';
import {
  recruitEmptyText,
  recruitHeaderText,
} from '@/features/recruit/constants';
import { useRecruit } from '@/features/recruit/hooks/useRecruit';
import ContentHeader from '@/shared/components/ContentHeader';
import EmptyCase from '@/shared/components/EmptyCase';
import ConfirmModal from '@/shared/components/modal/ConfirmModal';

const RecruitPage = () => {
  const { state, actions } = useRecruit();

  return (
    <>
      <div className='flex min-h-[calc(100vh-5.625rem)] w-full max-w-screen min-w-[1700px] flex-col px-75 pb-30'>
        <div className='flex flex-row items-center justify-between'>
          <ContentHeader {...recruitHeaderText} />
          <NewRecruitButton onClick={actions.openNewForm} />
        </div>

        <div className='flex flex-1 flex-row items-start gap-1'>
          <div className='flex-none'>
            <CalendarContainer />
          </div>

          <div className='flex-1 overflow-auto pl-4'>
            {state.isFormOpen ? (
              <RecruitFormContainer
                recruitId={state.editingRecruitId}
                onClose={actions.closeForm}
              />
            ) : (
              <RecruitListContainer
                dateParams={state.selectedDateParams}
                onEdit={actions.openEditForm}
                // 진짜 삭제가 아니라 모달 열기만 한다.
                onDelete={actions.openDeleteModal}
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

      <ConfirmModal
        isOpen={state.deletingId !== null}
        isPending={state.isDeleting}
        title='연결된 자기소개서가 사라져요!'
        description={
          '해당 공고를 삭제하시면 공고와 연결되어 있는\n자기소개서 문항들이 함께 삭제됩니다.'
        }
        onConfirm={actions.confirmDelete} // 여기서 진짜 삭제 실행
        onCancel={actions.closeDeleteModal} // 취소 시 닫힘
      />
    </>
  );
};

export default RecruitPage;
