// src/features/notification/hooks/useSSE.ts
import { useEffect, useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { getAccessToken } from '@/features/auth/libs/tokenStore';
// Vite에게 이건 Worker 파일이라고 명시적으로 알려주는 import
// -> 파일 앞에 ?과 접미사 쿼리 파라미터를 붙여주면 Vite가 이 파일이 브라우저(window) 환경이 아니라 Worker 환경용으로 따로 빌드/처리해야하는 것으로 인식
// (Worker에서는 window, document, localStorage, sessionStorage 같은 DOM API에 아예 접근할 수 없어서 에러 발생)
import SharedWorkerURL from '@/workers/sseWorker.ts?sharedworker&url';
import DedicatedWorkerURL from '@/workers/sseWorker.ts?worker&url';

export const useSSE = () => {
  const token = getAccessToken();
  const queryClient = useQueryClient();

  // Worker나 Port를 담아둘 ref
  const workerRef = useRef<SharedWorker | Worker | null>(null);
  const portRef = useRef<MessagePort | Worker | null>(null);

  useEffect(() => {
    if (!token) return;
    // Shared Worker 지원 시 사용, 미지원 시 Dedicated Worker로 폴백
    if (window.SharedWorker) {
      // ?sharedworker&url 로 가져온 경로를 사용
      const worker = new SharedWorker(SharedWorkerURL, { type: 'module' });
      workerRef.current = worker;
      portRef.current = worker.port;
      worker.port.start();
    } else {
      // ?worker&url 로 가져온 경로를 사용
      const worker = new Worker(DedicatedWorkerURL, { type: 'module' });
      workerRef.current = worker;
      portRef.current = worker;
    }

    const port = portRef.current;

    // Worker로부터 오는 메시지(알림) 수신
    port.onmessage = (e: MessageEvent) => {
      if (e.data.type === 'NOTIFICATION') {
        queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
        queryClient.invalidateQueries({ queryKey: ['notificationList'] });
      }
    };

    // Worker에 시작 신호 및 토큰 전달
    port.postMessage({ type: 'START', payload: { token } });
    // 새로고침, 탭 닫힘 감지 이벤트 추가
    const handleBeforeUnload = () => {
      port.postMessage({ type: 'STOP' });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup: 컴포넌트 언마운트 시 현재 탭의 연결 해제 요청
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      port.postMessage({ type: 'STOP' });
      if (port instanceof MessagePort) {
        port.close();
      } else {
        (workerRef.current as Worker).terminate();
      }
    };
  }, [token, queryClient]);
};
