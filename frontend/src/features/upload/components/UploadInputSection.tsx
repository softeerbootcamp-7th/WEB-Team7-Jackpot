import { useState } from 'react';

import { useNavigate } from 'react-router';

import UploadFileArea from '@/features/upload/components/UploadFileArea';
import UploadInputHeader from '@/features/upload/components/UploadInputHeader';
import { useAiLabeling } from '@/features/upload/hooks/useUploadQueries';
import LoadingModal from '@/shared/components/modal/LoadingModal';
import ConfirmModal from '@/shared/components/modal/ConfirmModal';

const UploadInputSection = () => {
  const navigate = useNavigate();
  const [isContent, setIsContent] = useState<boolean>(false);
  const { mutateAsync: startAiLabeling } = useAiLabeling();
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ presignedUrl: string; fileKey: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [modalType, setModalType] = useState<null | 'success' | 'error'>(null);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const handleNextStep = async () => {
    const startTime = Date.now();
    setIsLoading(true);
    try {
      await startAiLabeling({ files: uploadedFiles });

      // 성공: 최소 1초 로딩 후 모달 띄우기
      const elapsed = Date.now() - startTime;
      if (elapsed < 1000)
        await new Promise((r) => setTimeout(r, 1000 - elapsed));
      setModalTitle('요청 접수 완료');
      setModalType('success');
      setModalMessage(
        '라벨링 요청을 접수했습니다. 완료되면 상단 알림으로 알려드릴게요.',
      );
    } catch (err) {
      console.error('AI 라벨링 시작 실패:', err);

      const message = err instanceof Error ? err.message : String(err);
      const elapsed = Date.now() - startTime;
      if (elapsed < 1000)
        await new Promise((r) => setTimeout(r, 1000 - elapsed));

      // 서버 내부 에러인 경우
      if (message.includes('500')) {
        setModalTitle('오류 발생');
        setModalType('error');
        setModalMessage(
          '서버 오류가 발생했습니다. 업로드한 파일을 초기화합니다. 잠시 후 다시 시도해주세요.',
        );
      } else {
        setModalTitle('오류 발생');
        setModalType('error');
        setModalMessage('알 수 없는 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <UploadInputHeader isContent={isContent} nextStep={handleNextStep} />
      <UploadFileArea
        setIsContent={setIsContent}
        setUploadedFiles={setUploadedFiles}
        resetKey={resetKey}
      />

      <LoadingModal isLoading={isLoading} />

      <ConfirmModal
        isOpen={modalType !== null}
        type={modalType || 'info'}
        title={modalTitle}
        description={modalMessage}
        onConfirm={() => {
          if (modalType === 'error') {
            // 리셋 동작
            setUploadedFiles([]);
            setResetKey((v) => v + 1);
            setModalType(null);
          } else if (modalType === 'success') {
            // 성공: 홈으로 이동
            navigate('/', { replace: true });
          }
        }}
        confirmText={modalType === 'success' ? '홈으로 이동' : '확인'}
        onCancel={() => setModalType(null)}
      />
    </div>
  );
};

export default UploadInputSection;
