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
  data: {
    version: number;
    content: string;
  };
}

export interface TextUpdateResponseType {
  type: 'TEXT_UPDATE';
  qnAId: number;
  data: {
    version: number;
    startIdx: number;
    endIdx: number;
    replacedText: string;
  };
}

export interface ReviewUpdatedResponseType {
  type: 'REVIEW_UPDATED';
  qnAId: number;
  data: {
    reviewId: number;
    originText: string;
    suggest: string;
    content: string;
    modifiedAt: string;
  };
}

export interface ReviewDeletedResponseType {
  type: 'REVIEW_DELETED';
  qnAId: number;
  data: {
    reviewId: number;
  };
}

export interface ReviewCreatedResponseType {
  type: 'REVIEW_CREATED';
  qnAId: number;
  data: {
    sender: {
      id: string;
      nickname: string;
    };
    reviewId: number;
    originText: string;
    suggest: string;
    comment: string;
    createdAt: string;
  };
}

export type WebSocketResponse =
  | TextUpdateResponseType
  | ReviewUpdatedResponseType
  | ReviewDeletedResponseType
  | ReviewCreatedResponseType
  | TextReplaceAllResponseType;
