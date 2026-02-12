import { httpClient } from '@/features/library/api/client';
import {
  type CoverLetterListResponse,
  type CreateScrapRequest,
  type CreateScrapResponse,
  type LibraryResponse,
  type LibraryView,
  type QuestionListResponse,
  type ScrapCount,
} from '@/features/library/types';

export const fetchFolderList = (libraryType: LibraryView) => {
  const queryParams = new URLSearchParams({ libraryType }).toString();

  return httpClient<LibraryResponse>(`/api/v1/library/all?${queryParams}`);
};

export const fetchDocumentList = (
  libraryType: LibraryView,
  folderName: string,
  lastId?: number,
  size = 5,
) => {
  const params = new URLSearchParams({
    size: String(size),
  });

  if (lastId !== undefined && lastId !== null) {
    if (libraryType === 'COMPANY') {
      params.append('lastCoverLetterId', String(lastId));
    } else {
      params.append('lastQuestionId', String(lastId));
    }
  }
  if (libraryType === 'COMPANY') {
    params.append('companyName', folderName);

    return httpClient<CoverLetterListResponse>(
      `/api/v1/library/company/all?${params.toString()}`,
    );
  } else {
    params.append('questionCategoryType', folderName);

    return httpClient<QuestionListResponse>(
      `/api/v1/library/question/all?${params.toString()}`,
    );
  }
};

export const fetchScrapNum = () => {
  return httpClient<ScrapCount>(`/api/v1/scraps/count`);
};

export const createScrap = (payload: CreateScrapRequest) => {
  return httpClient<CreateScrapResponse>('/api/v1/scraps', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const deleteScrap = (qnAId: number) => {
  return httpClient<void>(`/api/v1/scraps/${qnAId}`, {
    method: 'DELETE',
  });
};
