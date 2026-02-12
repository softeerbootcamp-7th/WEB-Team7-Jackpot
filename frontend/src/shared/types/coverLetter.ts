export type ApplyHalf = '상반기' | '하반기';

export type ApiApplyHalf = 'FIRST_HALF' | 'SECOND_HALF';

export type ISODateString = string;

export interface CoverLetter {
  coverLetterId: number;
  companyName: string;
  jobPosition: string;
  applyYear: number;
  applyHalf: ApplyHalf;
  deadline: ISODateString;
}

export interface RecentCoverLetter extends CoverLetter {
  questionCount: number;
}
