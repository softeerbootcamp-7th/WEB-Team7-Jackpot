import { useEffect, useRef, useState } from 'react';

import type { IFrame } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { getAccessToken } from '@/features/auth/libs/tokenStore';
import { refreshAccessToken } from '@/shared/api/apiClient';

const SOCKET_URL = `${import.meta.env.VITE_SOCKET_URL}`;

interface UseStompClientProps {
  shareId: string;
}

export const useStompClient = ({ shareId }: UseStompClientProps) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!shareId) {
      return;
    }
    const client = new Client({
      // 소켓 재연결을 위해 새 소켓을 만들 수 있는 콜백 함수
      // 이미 만들어진 소켓 객체를 넘겨주면 재사용이 불가
      webSocketFactory: () => new SockJS(`${SOCKET_URL}/ws/connect`),
      connectHeaders: {
        Authorization: '',
        shareId: shareId,
      },
      beforeConnect: async () => {
        let token = getAccessToken();
        try {
          token = await refreshAccessToken();
        } catch (error) {
          // refresh 실패 시 기존 access token으로 한 번 더 시도한다.
          // (로그아웃/만료 상태면 서버에서 연결을 거절하고 재연결 루프가 중단된다)
          console.warn('[useStompClient] Token refresh failed:', error);
        }

        client.connectHeaders = {
          Authorization: token ?? '',
          shareId: shareId,
        };
      },
      onConnect: () => {
        setIsConnected(true);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onWebSocketClose: () => {
        setIsConnected(false);
      },
      onStompError: (frame: IFrame) => {
        setIsConnected(false);
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
      client.deactivate();
      setIsConnected(false);
    };
  }, [shareId]);

  const sendMessage = (destination: string, body: unknown) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    }
  };

  return { isConnected, sendMessage, clientRef };
};
