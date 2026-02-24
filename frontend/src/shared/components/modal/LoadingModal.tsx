import BeatLoader from 'react-spinners/BeatLoader';

interface LoadingModalProps {
  isLoading: boolean;
  message?: string;
}

const LoadingModal = ({
  isLoading,
  message = 'AI 라벨링을 시작하는 중입니다...',
}: LoadingModalProps) => {
  if (!isLoading) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='flex min-w-48 flex-col items-center gap-4 rounded-lg bg-white/95 p-6'>
        <BeatLoader color='var(--color-purple-600)' />
        <div className='text-body-m'>{message}</div>
      </div>
    </div>
  );
};

export default LoadingModal;
