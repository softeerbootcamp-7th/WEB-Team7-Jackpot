import { useEffect, useRef, useState } from 'react';

import type { IFrame } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
import { useNavigate } from 'react-router';
import SockJS from 'sockjs-client';

import { getAccessToken } from '@/features/auth/libs/tokenStore';
import { refreshAccessToken } from '@/shared/api/apiClient';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';

const SOCKET_URL = `${import.meta.env.VITE_SOCKET_URL}`;

interface UseStompClientProps {
  shareId: string;
}

export const useStompClient = ({ shareId }: UseStompClientProps) => {
  const { showToast } = useToastMessageContext();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const clientRef = useRef<Client | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!shareId) {
      return;
    }
    const client = new Client({
      // 소켓 재연결을 위해 새 소켓을 만들 수 있는 콜백 함수
      // 이미 만들어진 소켓 객체를 넘겨주면 재사용이 불가
      webSocketFactory: () => new SockJS(`${SOCKET_URL}/ws/connect`),
      connectHeaders: {},
      beforeConnect: async () => {
        let token = getAccessToken();
        try {
          await refreshAccessToken();
          token = getAccessToken();
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
        const errorMessage = frame.headers['message'] ?? '';
        const errorCode = frame.headers['error-code'];
        console.error('Broker reported error:', frame.headers['message']);
        console.error('Additional details', frame.body);

        // 인증 오류는 재연결해도 해결되지 않으므로 즉시 비활성화
        const isAuthError =
          errorMessage.toLowerCase().includes('auth') ||
          errorMessage.toLowerCase().includes('unauthorized');
        const isExpiredError =
          errorCode === '410' || errorMessage.includes('만료');
        const isFullError =
          errorCode === '410' || errorMessage.includes('초과');
        if (isAuthError || isExpiredError || isFullError) {
          // force: true로 즉시 세션을 종료하고 재연결을 막음
          client.deactivate({ force: true });

          if (isExpiredError) {
            showToast('첨삭 링크가 만료되었습니다.', false);
            navigate('/home', { replace: true });
          } else if (isFullError) {
            showToast('접근 가능한 인원 수가 초과되었습니다.', false);
            navigate('/home', { replace: true });
          }
        }
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
  }, [shareId, showToast, navigate]);

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
