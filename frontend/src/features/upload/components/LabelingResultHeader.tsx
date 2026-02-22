import { useParams } from 'react-router';

import type { LabeledQnAListResponse } from '@/features/notification/types/notification';
import {
  QUESTION_TYPE_LIST,
  TAB_STATE,
} from '@/features/upload/constants/uploadPage';
import { useSaveCoverLetter } from '@/features/upload/hooks/useUploadQueries';
import { UploadPageIcons as I } from '@/features/upload/icons';
import type { ContentStateType } from '@/features/upload/types/upload';

interface LabelingResultHeaderProps {
  nextStep?: (step: string) => void;
  tabState: string | undefined;
  data: LabeledQnAListResponse;
  qnACount: number;
  contents: ContentStateType;
}

const LabelingResultHeader = ({
  nextStep,
  tabState,
  data,
  qnACount,
  contents,
}: LabelingResultHeaderProps) => {
  const { jobId } = useParams<{ jobId: string }>();

  const { mutateAsync: saveCoverLetter } = useSaveCoverLetter();

  const handleSaveClick = async () => {
    // API 스펙에 맞게 데이터 조립
    const formattedCoverLetters = data.coverLetters.map((letter, index) => {
      // index에 해당하는 유저 입력 폼 데이터 찾기

      const userInput = contents[index];
      return {
        coverLetter: {
          companyName: userInput.companyName,
          jobPosition: userInput.jobPosition,
          applyYear: Number(userInput.recruitPeriod.year),
          applyHalf: (userInput.recruitPeriod.season.includes('상반기')
            ? 'FIRST_HALF'
            : 'SECOND_HALF') as 'FIRST_HALF' | 'SECOND_HALF',
          deadline: userInput.deadline,
        },
        qnAs: letter.qnAs.map((qna) => {
          // 저장되어 있던 한국어 카테고리
          const originalCategoryKOR = qna.questionCategory;

          // 리스트에서 한글 label과 일치하는 객체 찾기
          const matchedCategory = QUESTION_TYPE_LIST.find(
            (item) => item.label === originalCategoryKOR,
          );

          // 찾은 객체가 있으면 영어 value를 사용하고 없으면 원본값 안전장치
          const finalQuestionCategory = matchedCategory
            ? matchedCategory.value
            : originalCategoryKOR;

          return {
            question: qna.question,
            answer: qna.answer,
            questionCategory: finalQuestionCategory,
          };
        }),
      };
    });

    try {
      // 조립된 데이터로 Mutation 실행
      await saveCoverLetter({
        uploadJobId: jobId || '',
        coverLetters: formattedCoverLetters,
      });

      // 성공 시 다음 스텝으로 이동
      nextStep?.('3');
    } catch (error) {
      console.error('자기소개서 저장 실패:', error);
    }
  };

  return (
    <div>
      <div className='flex items-center justify-between select-none'>
        <div className='flex gap-[0.625rem]'>
          <I.AILabelingIcon size='32' />
          <div className='text-2xl font-bold'>
            <span className='text-purple-500'>
              {TAB_STATE[Number(tabState)]?.label || '첫 번째'}
            </span>
            자기소개서는 총
            <span className='text-purple-500'> {qnACount}개</span>의 문항으로
            분류되었어요!
          </div>
        </div>
        <button
          type='button'
          onClick={handleSaveClick}
          className='cursor-pointer rounded-lg bg-gray-900 px-5 py-3 text-lg font-bold text-white'
        >
          저장하기
        </button>
      </div>
    </div>
  );
};

export default LabelingResultHeader;
