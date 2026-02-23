interface ConfirmModalProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose?: () => void;
  onConfirm: () => void;
  closeButtonText?: string;
  confirmButtonText?: string;
}

const getTypeStyles = (type: 'success' | 'error' | 'warning' | 'info') => {
  const styles = {
    success: {
      icon: '✓',
      iconColor: 'text-green-600',
      buttonColor: 'bg-green-50 text-green-600 hover:bg-green-100',
    },
    error: {
      icon: '✕',
      iconColor: 'text-red-600',
      buttonColor: 'bg-red-50 text-red-600 hover:bg-red-100',
    },
    warning: {
      icon: '⚠',
      iconColor: 'text-orange-600',
      buttonColor: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    },
    info: {
      icon: 'ℹ',
      iconColor: 'text-blue-600',
      buttonColor: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    },
  };
  return styles[type];
};

const ConfirmModal = ({
  isOpen,
  type,
  title,
  message,
  onClose,
  onConfirm,
  closeButtonText,
  confirmButtonText = '확인',
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  const typeStyles = getTypeStyles(type);

  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center bg-black/40'>
      <div className='delay-show-fast w-[28rem] rounded-lg bg-white p-6'>
        <div className='text-body-l mb-4 flex items-center gap-3 font-bold'>
          <span className={`text-xl ${typeStyles.iconColor}`}>
            {typeStyles.icon}
          </span>
          {title}
        </div>
        <div className='text-body-m mb-6 leading-relaxed whitespace-pre-wrap text-gray-950'>
          {message}
        </div>
        <div className='flex justify-end gap-3'>
          {onClose && (
            <button
              type='button'
              className='cursor-pointer rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200'
              onClick={onClose}
            >
              {closeButtonText || '닫기'}
            </button>
          )}
          <button
            type='button'
            className={`cursor-pointer rounded-md px-4 py-2 ${typeStyles.buttonColor}`}
            onClick={onConfirm}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
