import { useCallback } from 'react';

import type { UseReviewStateResult } from '@/shared/hooks/useReviewState';
import type { WebSocketResponse } from '@/shared/types/websocket';

interface UseSocketMessageParams {
  dispatchers: UseReviewStateResult['dispatchers'];
}

export const useSocketMessage = ({ dispatchers }: UseSocketMessageParams) => {
  const handleMessage = useCallback(
    (message: WebSocketResponse) => {
      console.log('[WS] incoming', {
        type: message.type,
        qnAId: message.qnAId,
        payload: message.payload,
      });
      switch (message.type) {
        case 'TEXT_REPLACE_ALL':
          dispatchers.handleTextReplaceAllEvent(message.qnAId, message.payload);
          break;
        case 'TEXT_UPDATE':
          dispatchers.handleTextUpdateEvent(message.qnAId, message.payload);
          break;
        case 'REVIEW_CREATED':
          dispatchers.handleReviewCreatedEvent(message.qnAId, message.payload);
          break;
        case 'REVIEW_UPDATED':
          dispatchers.handleReviewUpdatedEvent(message.qnAId, message.payload);
          break;
        case 'REVIEW_DELETED':
          dispatchers.handleReviewDeletedEvent(message.qnAId, message.payload);
          break;
        default:
          break;
      }
    },
    [dispatchers],
  );

  return { handleMessage };
};
