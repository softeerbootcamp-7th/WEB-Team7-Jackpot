import { apiClient } from '@/shared/api/apiClient';

export const sseStream = {
  connect: async (signal: AbortSignal): Promise<Response> => {
    return (await apiClient.get({
      endpoint: '/sse/connect',
      // 원본 Response 객체 반환
      isStream: true,
      options: {
        signal: signal,
        headers: {
          // Content-Type
          // 클라이언트가 받을 수 있는 응답 타입 (SSE 형식의 응답 요청)
          Accept: 'text/event-stream',
          // 실시간 데이터를 받기 위해 캐싱 방지 옵션
          'Cache-Control': 'no-cache',
        },
      },
    })) as Response;
  },
};