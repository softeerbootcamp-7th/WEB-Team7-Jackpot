import { useEffect, useRef, useState } from 'react';

import type { IFrame, IMessage } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { getAccessToken } from '@/features/auth/libs/tokenStore';

const SOCKET_URL = `${import.meta.env.VITE_SOCKET_URL}`;

interface UseStompClientProps {
  shareId: string;
  qnaId: string;
  onMessage?: (message: IMessage) => void;
}

export const useStompClient = ({
  shareId,
  qnaId,
  onMessage,
}: UseStompClientProps) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const clientRef = useRef<Client | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!shareId) {
      return;
    }
    const token = getAccessToken();
    const client = new Client({
      // 소켓 재연결을 위해 새 소켓을 만들 수 있는 콜백 함수
      // 이미 만들어진 소켓 객체를 넘겨주면 재사용이 불가
      webSocketFactory: () => new SockJS(`${SOCKET_URL}/ws/connect`),
      connectHeaders: {
        Authorization: token ?? '',
        shareId: shareId,
      },
      debug: (str: string) => {
        console.log('[STOMP]:', str);
      },
      onConnect: () => {
        console.log('Websocket Connected!');
        setIsConnected(true);

        // 리뷰에 대한 데이터만 받기 위해 review SUB URL 구독
        client.subscribe(
          `/sub/share/${shareId}/qna/${qnaId}/review`,
          (message: IMessage) => {
            if (message.body) {
              const parsedBody = JSON.parse(message.body);
              console.log('received message:', parsedBody);
              if (onMessageRef.current) {
                onMessageRef.current(parsedBody);
              }
            }
          },
        );
      },
      onStompError: (frame: IFrame) => {
        console.error('Broker reported error:', frame.headers['message']);
        console.error('Addtional details', frame.body);
      },
      reconnectDelay: 5000,
      // 서버에게 연결이 끊긴지 확인하는 수신 주기
      heartbeatIncoming: 4000,
      // 서버에게 연결이 안 끊겼다고 보내는 송신 주기
      heartbeatOutgoing: 4000,
    });
    client.activate();
    clientRef.current = client;

    return () => {
      console.log('websocket disconnecting');
      client.deactivate();
      setIsConnected(false);
    };
  }, [shareId, qnaId]);

  const sendMessage = (destination: string, body: unknown) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.log('STOMP not connected');
    }
  };

  return { isConnected, sendMessage };
};
