// 해당 파일이 일반 브라우저(DOM) 환경이 아닌 Web Worker 환경에서 사용되는 것을 알려주는 지시어
/// <reference lib="webworker" />

import { setAccessToken } from '@/features/auth/libs/tokenStore';
import { apiClient } from '@/shared/api/apiClient';
import { isNotificationPayload } from '@/shared/libs/checkStreamPayload';
import { readStream } from '@/shared/libs/readStream';
import type { SSEPayload } from '@/shared/types/sse';

// SharedWorker 환경인지 확인하는 타입 가드
const isSharedWorkerScope = (
  self: Window | SharedWorkerGlobalScope | DedicatedWorkerGlobalScope,
): self is SharedWorkerGlobalScope => {
  return (
    typeof SharedWorkerGlobalScope !== 'undefined' &&
    self instanceof SharedWorkerGlobalScope
  );
};

let ports: MessagePort[] = [];
let abortController: AbortController | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
// 탭이 하나일 때 새로고침을 하면 port의 길이가 0이라서 워커가 abort를 호출 -> 새 탭으로 인식하여 다시 SSE 연결

let token: string | null = null;
let isConnected = false;
// isConnected의 상태가 await 이후에 true로 바뀌기 때문에 순간적으로
// isConnected가 여러번 호출되는 race condition 방지하기 위한 플래그 (연결 시도를 한다는 플래그)
let isConnecting = false;
// 지수 백오프용 카운트
let retryCount = 0;

// 연결된 모든 탭(port)에 메시지 브로드캐스트
const broadcast = (data: unknown) => {
  if (isSharedWorkerScope(self)) {
    // 네트워크 연결이 끊기는 상황에 실패한 포트를 정리하면서 나머지 탭에 메시지를 전달
    // 유효한 포트만 남도록 배열 업데이트
    ports = ports.filter((port) => {
      try {
        port.postMessage(data);
        return true;
      } catch {
        return false;
      }
    });
  } else {
    // Dedicated Worker
    self.postMessage(data);
  }
};

const connectSSE = async () => {
  // 연결되었거나 연경 중이면 종료
  if (!token || isConnected || isConnecting) return;

  isConnecting = true;

  if (abortController) abortController.abort();
  abortController = new AbortController();

  try {
    const response = await apiClient.get<Response>({
      endpoint: '/sse/connect',
      isStream: true,
      options: {
        signal: abortController.signal,
        headers: {
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      },
    });

    isConnected = true;
    // 연결 완료 했다는 의미
    isConnecting = false;
    // 연결 성공 시 백오프 카운트 초기화
    retryCount = 0;

    await readStream<SSEPayload>(response, (data) => {
      if (!data || !isNotificationPayload(data)) return;
      // 데이터가 오면 UI 스레드로 전송
      broadcast({ type: 'NOTIFICATION', payload: data });
    });

    // 스트림이 정상 종료되면 재연결 시도
    scheduleReconnect();
  } catch (error) {
    isConnected = false;
    // 에러가 발생했으므로 연결 초기화
    isConnecting = false;
    if (error instanceof Error && error.name === 'AbortError') {
      // 의도된 중단은 재연결 안 함
      return;
    }

    // 400 에러든 뭐든 끊어지면 지수 백오프로 재연결
    console.error('SSE Error:', error);

    scheduleReconnect();
  }
};

const scheduleReconnect = () => {
  isConnected = false;
  if (reconnectTimer) clearTimeout(reconnectTimer);

  // Shared Worker 환경에서 활성 포트가 없으면 재연결 스케줄링 중단
  if (isSharedWorkerScope(self) && ports.length === 0) {
    reconnectTimer = null;
    return;
  }

  // 토큰이 없으면 연결할 수 없으므로 재시도 불필요
  if (!token) return;

  const maxRetries = 4;
  const currentRetry = Math.min(retryCount, maxRetries);

  retryCount++;

  reconnectTimer = setTimeout(() => {
    connectSSE();
  }, delay);
};

// 메인 스레드로부터 메시지 수신 처리
const handleMessage = (e: MessageEvent, port?: MessagePort) => {
  const { type, payload } = e.data;

  if (type === 'START') {
    // 메인 스레드에서 받아온 토큰을 Worker 환경의 tokenStore에 저장
    // 이렇게 해둬야 apiClient가 내부에서 getAccessToken()을 호출할 때 값을 가져올 수 있음
    if (payload.token) {
      token = payload.token;
      setAccessToken(payload.token);
    }

    // SharedWorker의 경우 연결된 포트 관리
    if (port && !ports.includes(port)) {
      ports.push(port);
    }

    // 아직 연결 전이라면 연결 시작
    if (!isConnected) connectSSE();
  } else if (type === 'STOP') {
    if (port) {
      ports = ports.filter((p) => p !== port);
      // 더 이상 연결된 탭이 없으면 완전 종료
      if (ports.length === 0) {
        abortController?.abort();
        if (reconnectTimer) clearTimeout(reconnectTimer);
        isConnected = false;
      }
    } else {
      // Dedicated Worker 종료
      abortController?.abort();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    }
  }
};

// Worker 이벤트 연결 (환경별)
// Shared Worker 환경
if (isSharedWorkerScope(self)) {
  self.onconnect = (e: MessageEvent) => {
    const port = e.ports[0];
    port.onmessage = (event) => handleMessage(event, port);
    port.start();
  };
} else {
  // Dedicated Worker 환경
  self.addEventListener('message', (event) => handleMessage(event));
}
