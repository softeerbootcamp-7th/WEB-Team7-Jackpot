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
  };
}

interface CoverLetterType {
  coverLetterId: number;
  questionIds: number[];
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
