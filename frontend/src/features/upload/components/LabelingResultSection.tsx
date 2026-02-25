import { useEffect } from 'react';

import { useNavigate, useParams } from 'react-router';

import { useLabeledQnAList } from '@/features/notification/hooks/useNotification';
import LabelingResultHeader from '@/features/upload/components/LabelingResultHeader';
import LabelingResultItem from '@/features/upload/components/LabelingResultItem';
import useCoverLetterState from '@/features/upload/hooks/useCoverLetterState';
import useEditableQnA from '@/features/upload/hooks/useEditableQnA';

const LabelingResultSection = () => {
  const navigate = useNavigate();
  const { jobId, coverLetterIndex, qnAIndex } = useParams<{
    jobId: string;
    coverLetterIndex: string;
    qnAIndex: string;
  }>();

  // NaN || 0 -> 0 (비숫자 입력에 대한 방어 처리)
  // 인덱스 파싱 (기본값 0)
  const currentCoverLetterIdx: number = Number(coverLetterIndex) || 0;
  const currentQnAIdx: number = Number(qnAIndex) || 0;

  const { data: labeledData, isLoading } = useLabeledQnAList(jobId!);
  const { contents, updateContents } = useCoverLetterState();

  const { editedData, handleUpdateQnA } = useEditableQnA(labeledData);
  // 전체 실패 판별 로직 -> 필터링을 거친 커버레터가 하나도 없을 때
  const isTotalFailure = labeledData && labeledData.coverLetters.length === 0;

  const originalCoverLetter =
    labeledData?.coverLetters?.[currentCoverLetterIdx];
  const originalQnA = originalCoverLetter?.qnAs?.[currentQnAIdx];

  const isInitialQuestionFailure =
    originalQnA && originalQnA.question.trim() === '';
  const isInitialAnswerFailure =
    originalQnA && originalQnA.answer.trim() === '';
  const isCurrentQnAFailure =
    isInitialQuestionFailure && isInitialAnswerFailure;

  // jobId 변경 시 상태 초기화
  useEffect(() => {
    if (
      labeledData &&
      !isTotalFailure &&
      (!originalCoverLetter || !originalQnA)
    ) {
      navigate(`/upload/labeling/${jobId}/0/0`, { replace: true });
    }
  }, [
    labeledData,
    isTotalFailure,
    originalCoverLetter,
    originalQnA,
    jobId,
    navigate,
  ]);
  useEffect(() => {
    if (!labeledData) return;

    if (isTotalFailure || isCurrentQnAFailure) {
      navigate('/upload/complete', {
        state: { isFailed: true },
        replace: true,
      });
    }
  }, [isTotalFailure, isCurrentQnAFailure, labeledData, navigate]);

  const handleNextStep = () => {
    navigate('/upload/complete', { replace: true });
  };

  const handleCoverLetterIdxChange = (newIdx: number) =>
    navigate(`/upload/labeling/${jobId}/${newIdx}/0`, { replace: true });

  const handleQnAIdxChange = (newIdx: number) =>
    navigate(`/upload/labeling/${jobId}/${currentCoverLetterIdx}/${newIdx}`, {
      replace: true,
    });

  if (isLoading) {
    return <div>라벨링 결과를 불러오는 중입니다...</div>;
  }

  if (!labeledData) {
    return <div>데이터를 찾을 수 없습니다.</div>;
  }

  // 실패로 인해 리다이렉트 되기 직전 화면이 깜빡이는 것을 방지
  if (
    isTotalFailure ||
    isCurrentQnAFailure ||
    !originalCoverLetter ||
    !originalQnA
  ) {
    return null;
  }

  const qnACount = originalCoverLetter.qnAs.length;

  return (
    <div className='flex flex-col gap-6'>
      <LabelingResultHeader
        nextStep={handleNextStep}
        tabState={coverLetterIndex}
        data={editedData}
        qnACount={qnACount}
        contents={contents}
      />
      <LabelingResultItem
        tabState={currentCoverLetterIdx}
        setTabState={handleCoverLetterIdxChange}
        qnAState={currentQnAIdx}
        setQnAState={handleQnAIdxChange}
        data={editedData}
        contents={contents}
        updateContents={updateContents}
        updateQnA={handleUpdateQnA}
        isInitialQuestionFailure={isInitialQuestionFailure || false}
        isInitialAnswerFailure={isInitialAnswerFailure || false}
      />
    </div>
  );
};

export default LabelingResultSection;
