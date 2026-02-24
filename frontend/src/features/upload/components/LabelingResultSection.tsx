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

  // jobId 변경 시 상태 초기화
  useEffect(() => {
    // 라벨링 결과 화면에서 다른 알림을 누르면 내용이 그대로 유지되는 문제를 해결하기 위해
    // useCoverLetterState가 jobId 기반으로 초기화
  }, [jobId]);

  const originalCoverLetter =
    labeledData?.coverLetters?.[currentCoverLetterIdx];
  const originalQnA = originalCoverLetter?.qnAs?.[currentQnAIdx];

  const isInitialQuestionFailure =
    originalQnA && originalQnA.question.trim() === '';

  const isInitialAnswerFailure =
    originalQnA && originalQnA.answer.trim() === '';

  const isNoQnAData =
    !originalCoverLetter?.qnAs || originalCoverLetter.qnAs.length === 0;

  const isInitialTotalFailure =
    isNoQnAData || (isInitialAnswerFailure && isInitialQuestionFailure);

  useEffect(() => {
    if (!labeledData) return;
    if (isInitialTotalFailure) {
      navigate('/upload/complete', {
        state: { isFailed: true },
        replace: true,
      });
    }
  }, [isInitialTotalFailure, labeledData, navigate]);

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

  if (isInitialTotalFailure) return null;
  const qnACount = originalCoverLetter?.qnAs?.length ?? 0;

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
