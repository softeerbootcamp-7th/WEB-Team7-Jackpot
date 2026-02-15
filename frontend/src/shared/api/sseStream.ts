import { apiClient } from '@/shared/api/apiClient';

export const sseStream = {
  connect: async (signal: AbortSignal): Promise<Response> => {
    return await apiClient.get({
      endpoint: '/sse/connect',
      options: {
        signal: signal,
      },
      isStream: true,
    });
  },
};
