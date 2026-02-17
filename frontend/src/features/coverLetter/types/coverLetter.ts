export interface ScrapItem {
  questionId: number;
  companyName: string;
  jobPosition: string;
  applySeason: string; // "2025년 하반기"
  question: string;
  answer: string;
}

export interface GetScrapsResponse {
  scraps: ScrapItem[];
  hasNext: boolean;
}
