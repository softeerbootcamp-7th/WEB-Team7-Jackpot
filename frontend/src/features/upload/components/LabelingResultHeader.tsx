import { useState } from 'react';

import { useParams } from 'react-router';

import type { LabeledQnAListResponse } from '@/features/notification/types/notification';
import {
  QUESTION_TYPE_LIST,
  TAB_STATE,
} from '@/features/upload/constants/uploadPage';
import { useSaveCoverLetter } from '@/features/upload/hooks/useUploadQueries';
import * as UI from '@/features/upload/icons';
import type { ContentStateType } from '@/features/upload/types/upload';
import ConfirmModal from '@/shared/components/modal/ConfirmModal';
import { parseDate } from '@/shared/utils/dates';

interface LabelingResultHeaderProps {
  nextStep?: (step: string) => void;
  tabState: string | undefined;
  data: LabeledQnAListResponse | undefined;
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const { mutateAsync: saveCoverLetter } = useSaveCoverLetter();

  const handleSaveClick = async () => {
    if (!data || !data.coverLetters) {
      console.error('저장할 데이터가 없습니다.');
      return;
    }

    const missingFields: string[] = [];
    const isMultiTab = data.coverLetters.length > 1;

    data.coverLetters.forEach((letter, index) => {
      const userInput = contents[index];
      // 여러 탭일 경우 탭에 대한 정보를 같이 구분선으로 붙여줌
      const prefix = isMultiTab ? `[자기소개서 0${index + 1}] ` : '';

      if (!userInput.companyName?.trim()) missingFields.push(`${prefix}기업명`);
      if (!userInput.jobPosition?.trim()) missingFields.push(`${prefix}직무명`);
      // 제출일(마감일) 필수 검사: 연/월/일 중 하나라도 비어있으면 오류
      const { y: dlY, m: dlM, d: dlD } = parseDate(userInput.deadline);
      if (!dlY || !dlM || !dlD) missingFields.push(`${prefix}제출일`);

      letter.qnAs.forEach((qna, qIdx) => {
        const qPrefix = `${prefix}${qIdx + 1}번 문항의 `;

        if (!qna.questionCategory?.trim())
          missingFields.push(`${qPrefix}문항 유형`);
        if (!qna.question?.trim()) missingFields.push(`${qPrefix}문항 제목`);
        if (!qna.answer?.trim()) missingFields.push(`${qPrefix}문항 답변`);
      });
    });

    // 빈 값이 존재하면 모달을 띄우고 저장 로직 중단
    if (missingFields.length > 0) {
      const message = `다음 항목이 입력되지 않았습니다.\n모든 항목을 입력한 후 저장해주세요.\n\n${missingFields.map((field) => `• ${field}`).join('\n')}`;

      setModalMessage(message);
      setIsModalOpen(true);
      return;
    }

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
            : 'OTHER';

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
    <>
      <div>
        <div className='flex items-center justify-between select-none'>
          <div className='flex gap-[0.625rem]'>
            <UI.AILabelingIcon size='32' />
            <div className='text-2xl font-bold'>
              <span className='text-purple-500'>
                {TAB_STATE[Number(tabState)]?.label || '첫 번째'}
              </span>
              {' 자기소개서는 총'}
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
      <ConfirmModal
        isOpen={isModalOpen}
        type='warning'
        title='입력 확인'
        description={modalMessage}
        onConfirm={() => setIsModalOpen(false)}
        confirmText='확인'
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default LabelingResultHeader;
