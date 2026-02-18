import { useEffect, useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { getAccessToken } from '@/features/auth/libs/tokenStore';
import { sseStream } from '@/shared/api/sseStream';
import { readStream } from '@/shared/libs/readStream';
import type { SSEPayload } from '@/shared/types/sse';

export const useSSE = () => {
  const token = getAccessToken();
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    const connectSSE = async () => {
      try {
        const response = await sseStream.connect(controller.signal);

        await readStream<SSEPayload>(response, (data) => {
          // data 자체가 notification
          if (!data || !('id' in data)) return;

          queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
          queryClient.invalidateQueries({ queryKey: ['notificationList'] });
        });

        // 정상 종료 시에도 즉시 재연결하지 않고 3초 대기
        if (!controller.signal.aborted) {
          if (timerRef.current) clearTimeout(timerRef.current);

          timerRef.current = setTimeout(() => {
            connectSSE();
          }, 3000);
        }
      } catch (error) {
        // 400 에러 (한 유저 당 최대 SSE 연결 개수 5개 초과 오류) 발생 시 재연결 안함
        if (error instanceof Error && error.message.includes('400')) {
          console.error('연결 제한 초과. 재연결 중단.');
          return;
        }
        // AbortError는 사용자가 의도적으로 끊은 것이므로 재연결 안함
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        // 기존 타이머 제거 후 새로 설정
        console.error('SSE 에러, 3초 후 재연결...', error);
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
          // 3초가 지난 시점에 이미 aborted 되었다면 재연결 하지 않음
          if (!controller.signal.aborted) {
            connectSSE();
          }
        }, 3000);
      }
    };

    connectSSE();

    // cleanup 함수
    const handleBeforeUnload = () => {
      controller.abort();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      controller.abort();
      // 대기 중인 재연결 취소
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [token, queryClient]);
};
