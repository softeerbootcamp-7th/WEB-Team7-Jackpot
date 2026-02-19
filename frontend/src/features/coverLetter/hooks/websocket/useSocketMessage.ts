import { useQueryClient } from '@tanstack/react-query';

import type { WebSocketResponse } from '@/features/coverLetter/types/websocket';
import type { ShareQnA } from '@/shared/types/qna';

export const useSocketMessage = ({ shareId }: { shareId: string }) => {
  const queryClient = useQueryClient();
  const handleMessage = (message: WebSocketResponse) => {
    switch (message.type) {
      case 'TEXT_REPLACE_ALL':
        {
          queryClient.setQueryData(
            ['share', shareId, 'qna', message.qnAId],
            (oldData: ShareQnA) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                version: message.payload.version,
                answer: message.payload.content,
              };
            },
          );
        }
        break;
      case 'TEXT_UPDATE': {
        queryClient.setQueryData(
          ['share', shareId, 'qna', message.qnAId],
          (oldData: ShareQnA) => {
            if (!oldData) return oldData;

            const { startIdx, endIdx, replacedText, version } = message.payload;

            const newAnswer =
              oldData.answer.slice(0, startIdx) +
              replacedText +
              oldData.answer.slice(endIdx);

            return {
              ...oldData,
              version: version,
              answer: newAnswer,
            };
          },
        );
        break;
      }

      case 'REVIEW_CREATED':
      case 'REVIEW_UPDATED':
      case 'REVIEW_DELETED':
        queryClient.invalidateQueries({
          queryKey: ['reviews', message.qnAId],
        });
        break;
    }
  };

  return { handleMessage };
};
