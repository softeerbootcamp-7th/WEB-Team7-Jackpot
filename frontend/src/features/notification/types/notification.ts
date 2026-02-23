interface NotificationBaseType {
  id: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface FeedbackNotificationType extends NotificationBaseType {
  type: 'FEEDBACK';
  meta: {
    sender: {
      id: string;
      nickname: string;
    };
    coverLetterId: number;
    qnAId: number;
  };
}

export interface LabelingNotificationType extends NotificationBaseType {
  type: 'LABELING_COMPLETE';
  meta: {
    jobId: string;
    successFileCount: number;
    failFileCount: number;
  };
}

export type NotificationType =
  | FeedbackNotificationType
  | LabelingNotificationType;

export interface NotificationResponse {
  notifications: NotificationType[];
  hasNext: boolean;
}

export interface NotificationCountResponse {
  unreadNotificationCount: number;
}

export interface QnAType {
  question: string;
  answer: string;
  questionCategory: string;
  answerSize: number;
}

export interface CoverLetterType {
  qnAs: QnAType[];
}

export interface LabeledQnAListResponse {
  coverLetters: CoverLetterType[];
}
