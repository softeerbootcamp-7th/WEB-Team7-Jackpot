import doneIcon from '/images/doneIcon.png';
import failIcon from '/images/failIcon.png';

import BaseModal from './BaseModal';

import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import * as SI from '@/shared/icons';

// 1. 지원하는 모달 타입 정의
export type ConfirmModalType = 'success' | 'error' | 'warning' | 'info';

interface ConfirmModalProps {
  isOpen: boolean;
  type?: ConfirmModalType; // 선택적 prop으로 변경 (기본값 제공을 위해)
  isPending?: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// 2. 타입별 스타일 및 아이콘 매핑 객체 (Lookup Table)
const MODAL_CONFIG = {
  success: {
    Icon: () => <img src={doneIcon} alt='done' className='h-9 w-9' />,
    titleColor: 'text-green-600',
  },
  error: {
    Icon: () => <img src={failIcon} alt='fail' className='h-9 w-9' />,
    titleColor: 'text-red-600',
  },
  warning: {
    Icon: SI.AlertIcon,
    titleColor: 'text-orange-600',
  },
  info: {
    Icon: SI.MoreVertIcon, //SI.InfoIcon
    titleColor: 'text-blue-600',
  },
} as const;

const ConfirmModal = ({
  isOpen,
  type = 'error', // 기본값을 error로 두어 기존 코드와 호환성 유지
  isPending = false,
  title,
  description,
  confirmText = '삭제하기',
  cancelText = '취소하기',
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const modalRef = useFocusTrap(isOpen);

  // 3. 현재 타입에 맞는 설정값 가져오기
  const currentConfig = MODAL_CONFIG[type];
  const CurrentIcon = currentConfig.Icon;

  return (
    <BaseModal isOpen={isOpen} onClose={onCancel}>
      <div
        ref={modalRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby='confirm-modal-title'
        aria-describedby='confirm-modal-description'
        className='inline-flex w-96 flex-col items-center justify-center gap-5 rounded-[32px] bg-white p-6 shadow-[0px_0px_30px_0px_rgba(41,41,41,0.02)]'
      >
        <div className='flex flex-col items-center justify-start gap-3.5 self-stretch'>
          {/* 동적 아이콘 렌더링 */}
          <div className='relative h-9 w-9'>
            <div className='absolute top-0 left-0 flex h-9 w-9 items-center justify-center overflow-hidden'>
              <CurrentIcon />
            </div>
          </div>

          <div className='flex flex-col items-center justify-center gap-px self-stretch'>
            {/* 동적 타이틀 색상 적용 */}
            <h3
              id='confirm-modal-title'
              className={`text-center text-lg leading-7 font-bold ${currentConfig.titleColor}`}
            >
              {title}
            </h3>
            <p
              id='confirm-modal-description'
              className='text-center text-sm leading-5 font-normal whitespace-pre-line text-gray-400'
            >
              {description}
            </p>
          </div>
        </div>

        <div className='inline-flex items-center justify-start gap-3 self-stretch'>
          <button
            type='button'
            onClick={onCancel}
            className='flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-5 py-3 transition-opacity hover:opacity-80 active:scale-95'
          >
            <span className='text-lg leading-7 font-bold text-gray-600'>
              {cancelText}
            </span>
          </button>
          <button
            type='button'
            disabled={isPending}
            onClick={onConfirm}
            // 동적 확인 버튼 배경색 적용 및 비활성화 상태 스타일 추가
            className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gray-950 px-5 py-3 transition-opacity hover:opacity-80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <span className='text-lg leading-7 font-bold text-white'>
              {isPending ? '처리 중...' : confirmText}
            </span>
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ConfirmModal;
