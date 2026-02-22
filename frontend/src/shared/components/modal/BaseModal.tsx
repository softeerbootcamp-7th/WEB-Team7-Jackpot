import { type ReactNode, useRef } from 'react';
import { createPortal } from 'react-dom';

import { useEscapeKey } from '@/shared/hooks/useEscapeKey';
import useOutsideClick from '@/shared/hooks/useOutsideClick'; // 기존에 만든 훅 사용

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const BaseModal = ({ isOpen, onClose, children }: BaseModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useOutsideClick(modalRef, onClose, isOpen);
  useEscapeKey(onClose, isOpen);

  // 1. SSR 환경 체크 및 모달 오픈 여부 체크
  // Node,js 환경에서는 document가 없으므로, 모달이 열려있지 않거나 SSR 환경에서는 null을 반환하여 아무것도 렌더링하지 않도록 함
  if (!isOpen || typeof document === 'undefined') return null;

  // 2. index.html에 작성한 modal-root 엘리먼트를 찾음
  const modalRoot = document.getElementById('modal-root');

  // 3. 만약 modal-root가 없다면 방어 코드로 처리
  if (!modalRoot) return null;

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4'>
      <div ref={modalRef} className='relative z-50'>
        {children}
      </div>
    </div>,
    modalRoot,
  );
};

export default BaseModal;
