// 개별 import
import ShareIcon from '@/features/auth/icons/ShareIcon';
import SignUpBackground from '@/features/auth/icons/SignUpBackground';

// 개별 export (tree-shaking 가능)
export { ShareIcon, SignUpBackground };

// 네임스페이스 export (기존 호환성)
export const AuthIcons = {
  ShareIcon,
  SignUpBackgroundIcon: SignUpBackground,
} as const;
