import { useEffect, useRef } from 'react';

import type { Client, IMessage, StompSubscription } from '@stomp/stompjs';

interface UseSocketSubscribeProps {
  shareId: string;
  qnaId?: string;
  onMessage?: (message: unknown) => void;
  isConnected: boolean;
  clientRef: React.RefObject<Client | null>;
}

export const useSocketSubscribe = ({
  shareId,
  qnaId,
  onMessage,
  isConnected,
  clientRef,
}: UseSocketSubscribeProps) => {
  const onMessageRef = useRef(onMessage);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!isConnected || !clientRef.current || !qnaId) return;
    if (subscriptionRef.current) subscriptionRef.current.unsubscribe();

    // 리뷰에 대한 데이터만 받기 위해 review SUB URL 구독
    if (qnaId) {
      subscriptionRef.current = clientRef.current.subscribe(
        `/sub/share/${shareId}/qna/${qnaId}/review`,
        (message: IMessage) => {
          if (message.body) {
            const parsedBody = JSON.parse(message.body);
            if (onMessageRef.current) {
              onMessageRef.current(parsedBody);
            }
          }
        },
      );
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [shareId, isConnected, qnaId, clientRef]);
};
