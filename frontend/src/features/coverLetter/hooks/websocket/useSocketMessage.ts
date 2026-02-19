import { useQueryClient } from '@tanstack/react-query';

import type {
  TextReplaceAllResponseType,
  WebSocketResponse,
} from '@/features/coverLetter/types/websocket';

export const useSocketMessage = ({ shareId }: { shareId: string }) => {
  const queryClient = useQueryClient();
  const handleMessage = (message: WebSocketResponse) => {
    switch (message.type) {
      case 'TEXT_REPLACE_ALL':
        {
          queryClient.setQueryData(
            ['coverLetter', shareId, message.qnAId],
            (oldData: TextReplaceAllResponseType) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                version: message.data.version,
                content: message.data.content,
              };
            },
          );
        }
        break;
      case 'TEXT_UPDATE':
        queryClient.invalidateQueries({
          queryKey: ['coverLetter', shareId, message.qnAId],
        });
        break;

      case 'REVIEW_CREATED':
      case 'REVIEW_UPDATED':
      case 'REVIEW_DELETED':
        queryClient.invalidateQueries({
          queryKey: ['coverLetterReviews', shareId],
        });
        break;
    }
  };

  return { handleMessage };
};
