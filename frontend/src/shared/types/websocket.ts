export interface WriterMessageType {
  // 현재 보고 있었던 버전
  version: number;
  // 변경이 시작된 인덱스
  startIdx: number;
  // 변경이 끝난 인덱스 (기존 텍스트 기준)
  endIdx: number;
  // 해당 범위가 이 텍스트로 대체됨
  replacedText: string;
}

export interface TextReplaceAllResponseType {
  type: 'TEXT_REPLACE_ALL';
  qnAId: number;
  payload: {
    version: number;
    content: string;
  };
}

export interface TextUpdateResponseType {
  type: 'TEXT_UPDATE';
  qnAId: number;
  payload: {
    version: number;
    startIdx: number;
    endIdx: number;
    replacedText: string;
  };
}

export interface ReviewUpdatedResponseType {
  type: 'REVIEW_UPDATED';
  qnAId: number;
  payload: {
    reviewId: number;
    originText: string;
    suggest: string | null;
    content: string;
    modifiedAt: string;
    isApproved?: boolean;
  };
}

export interface ReviewDeletedResponseType {
  type: 'REVIEW_DELETED';
  qnAId: number;
  payload: {
    reviewId: number;
  };
}

export interface ReviewCreatedResponseType {
  type: 'REVIEW_CREATED';
  qnAId: number;
  payload: {
    sender: {
      id: string;
      nickname: string;
    };
    reviewId: number;
    originText: string;
    suggest: string | null;
    comment: string;
    createdAt: string;
  };
}

// ShareDeactivatedResponseType은 qnAId/payload가 없는 별도 메시지이므로
// WebSocketResponse 유니온에 포함하지 않고 isShareDeactivatedMessage로 별도 처리한다.
export interface ShareDeactivatedResponseType {
  type: 'SHARE_DEACTIVATED';
}

export type WebSocketResponse =
  | TextUpdateResponseType
  | ReviewUpdatedResponseType
  | ReviewDeletedResponseType
  | ReviewCreatedResponseType
  | TextReplaceAllResponseType;

export const isShareDeactivatedMessage = (
  message: unknown,
): message is ShareDeactivatedResponseType =>
  typeof message === 'object' &&
  message !== null &&
  (message as Record<string, unknown>).type === 'SHARE_DEACTIVATED';

// Record<WebSocketResponse['type'], true>는 유니온의 모든 멤버를 키로 요구한다.
// WebSocketResponse에 새 타입이 추가될 때 여기서 컴파일 에러가 발생한다.
const WEBSOCKET_TYPES = new Set<WebSocketResponse['type']>(
  Object.keys({
    TEXT_UPDATE: true,
    REVIEW_UPDATED: true,
    REVIEW_DELETED: true,
    REVIEW_CREATED: true,
    TEXT_REPLACE_ALL: true,
  } satisfies Record<WebSocketResponse['type'], true>) as WebSocketResponse['type'][],
);

const isWebSocketType = (type: unknown): type is WebSocketResponse['type'] =>
  typeof type === 'string' &&
  WEBSOCKET_TYPES.has(type as WebSocketResponse['type']);

export const isWebSocketResponse = (
  message: unknown,
): message is WebSocketResponse => {
  if (typeof message !== 'object' || message === null) return false;

  const candidate = message as Record<string, unknown>;
  return (
    isWebSocketType(candidate.type) &&
    typeof candidate.qnAId === 'number' &&
    typeof candidate.payload === 'object' &&
    candidate.payload !== null
  );
};
