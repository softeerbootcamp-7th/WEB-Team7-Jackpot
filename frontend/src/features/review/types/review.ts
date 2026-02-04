export interface ReviewBase {
  selectedText: string;
  revision: string;
  comment: string;
  range: { start: number; end: number };
}

export interface Review extends ReviewBase {
  id: string;
  sender?: { id: string; nickname: string };
  originText?: string;
  suggest?: string | null;
  createdAt?: string;
}
