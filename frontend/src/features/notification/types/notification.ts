interface NotificationBaseType {
  id: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface FeedbackNotificationType extends NotificationBaseType {
  type: 'FEEDBACK';
  meta: {
    sender: {
      id: string;
      nickname: string;
    };
    qnAId: number;
  };
}

interface CoverLetterType {
  coverLetterId: number;
  questionIds: (number | null)[];
}

interface LabelingNotificationType extends NotificationBaseType {
  type: 'LABELING_COMPLETE';
  meta: {
    coverLetters: CoverLetterType[];
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
