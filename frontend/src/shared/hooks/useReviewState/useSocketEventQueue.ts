import { useCallback, useRef } from 'react';

/**
 * WebSocket 이벤트를 마이크로태스크 큐에 순서대로 적재하고 순차 실행하는 훅.
 * React의 batching과 충돌 없이 소켓 이벤트를 하나씩 처리한다.
 */
export const useSocketEventQueue = () => {
  const socketEventQueueRef = useRef<Array<() => void>>([]);
  const isSocketQueueScheduledRef = useRef(false);

  const flushSocketEventQueue = useCallback(function flushQueuedSocketEvents() {
    try {
      while (socketEventQueueRef.current.length > 0) {
        const job = socketEventQueueRef.current.shift();
        try {
          job?.();
        } catch (e) {
          console.error('[useSocketEventQueue] socket event handler error:', e);
        }
      }
    } finally {
      isSocketQueueScheduledRef.current = false;
      if (socketEventQueueRef.current.length > 0) {
        isSocketQueueScheduledRef.current = true;
        queueMicrotask(flushQueuedSocketEvents);
      }
    }
  }, []);

  const enqueueSocketEvent = useCallback(
    (job: () => void) => {
      socketEventQueueRef.current.push(job);
      if (isSocketQueueScheduledRef.current) return;
      isSocketQueueScheduledRef.current = true;
      queueMicrotask(flushSocketEventQueue);
    },
    [flushSocketEventQueue],
  );

  return { enqueueSocketEvent };
};
