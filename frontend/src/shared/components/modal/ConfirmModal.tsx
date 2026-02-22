import BaseModal from './BaseModal';

import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { SharedIcons as SI } from '@/shared/icons';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  isOpen,
  title,
  description,
  confirmText = '삭제하기',
  cancelText = '취소하기',
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const modalRef = useFocusTrap(isOpen);

  return (
    <BaseModal isOpen={isOpen} onClose={onCancel}>
      <div
        ref={modalRef}
        className='inline-flex w-96 flex-col items-center justify-center gap-5 rounded-[32px] bg-white p-6 shadow-[0px_0px_30px_0px_rgba(41,41,41,0.02)]'
      >
        <div className='flex flex-col items-center justify-start gap-3.5 self-stretch'>
          {/* 경고 아이콘 */}
          <div className='relative h-9 w-9'>
            <div className='absolute top-0 left-0 h-9 w-9 overflow-hidden'>
              <SI.AlertIcon />
            </div>
          </div>

          <div className='flex flex-col items-center justify-center gap-px self-stretch'>
            <h3 className='text-center text-lg leading-7 font-bold text-red-600'>
              {title}
            </h3>
            {/* 문자열에 \n이 있으면 줄바꿈으로 처리되도록 whitespace-pre-line 추가 */}
            <p className='text-center text-sm leading-5 font-normal whitespace-pre-line text-gray-400'>
              {description}
            </p>
          </div>
        </div>

        <div className='inline-flex items-center justify-start gap-3 self-stretch'>
          <button
            type='button'
            onClick={onCancel}
            className='flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-5 py-3 transition-opacity hover:opacity-80 active:scale-95'
          >
            <span className='text-lg leading-7 font-bold text-gray-600'>
              {cancelText}
            </span>
          </button>
          <button
            type='button'
            onClick={onConfirm}
            className='flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-950 px-5 py-3 transition-opacity hover:opacity-80 active:scale-95'
          >
            <span className='text-lg leading-7 font-bold text-white'>
              {confirmText}
            </span>
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ConfirmModal;
