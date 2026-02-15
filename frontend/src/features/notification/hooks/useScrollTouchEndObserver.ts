import { useEffect, useRef } from 'react';

interface UseScrollTouchEndObserverProps {
  // null이면 브라우저 뷰포트 기준, 특정 요소를 기준으로 하려면 해당 ref 전달
  root?: null;
  // 감지 범위를 조정 -> '0px 0px 100px 0px'이면 바닥 100px 전 미리 감지
  rootMargin?: string;
  // 0.0 ~ 1.0 (얼마나 보였을 때 실행할지)
  threshold?: number;
  // 감지되었을 때 실행할 함수
  onIntersect: () => void;
  // 감지를 할지 말지 여부 (로딩 중이거나 더 이상 페이지가 없을 때 끄기 위함)
  enabled?: boolean;
}

export const useScrollTouchEndObserver = ({
  root,
  rootMargin = '0px',
  threshold = 0.5,
  onIntersect,
  enabled = true,
}: UseScrollTouchEndObserverProps) => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 타겟이 없거나 enabled가 false면 실행 안 함
    if (!targetRef.current || !enabled) return;

    // 옵저버 생성
    const observer = new IntersectionObserver(
      (entries) => {
        // entries[0]이 관찰하는 타겟
        if (entries[0].isIntersecting) {
          onIntersect();
        }
      },
      { root, rootMargin, threshold }
    );

    // 관찰 시작
    observer.observe(targetRef.current);

    // 클린업 (컴포넌트 언마운트 시 관찰 중단)
    return () => observer.disconnect();
  }, [enabled, root, rootMargin, threshold, onIntersect]);

  return { targetRef };
};