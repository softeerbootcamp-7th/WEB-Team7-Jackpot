import { useMutation, useQuery } from '@tanstack/react-query';

import type {
  FileUploadRequest,
  PresignedUrlRequest,
  PresignedUrlResponse,
  SaveCoverLetterRequest,
  SaveCoverLetterResponse,
  StartAiLabelingRequest,
} from '@/features/upload/types/upload';
import { apiClient } from '@/shared/api/apiClient';

export const useIssuePresignedUrl = () => {
  return useMutation({
    mutationFn: (request: PresignedUrlRequest) =>
      apiClient.post<PresignedUrlResponse>({
        endpoint: '/upload/presignedurl',
        body: {
          clientFileId: request.clientFileId,
          fileName: request.fileName,
          contentType: request.contentType,
          fileSize: request.fileSize,
        },
      }),
  });
};

export const useFileUpload = () => {
  return useMutation({
    mutationFn: async (request: FileUploadRequest) => {
      const response = await fetch(request.presignedUrl, {
        method: 'PUT',
        body: request.file,
        headers: {
          'Content-Type': request.contentType,
        },
      });

      if (!response.ok) {
        throw new Error(`S3 업로드 실패: ${response.status}`);
      }
    },
  });
};

export const useAiLabeling = () => {
  return useMutation({
    mutationFn: (request: StartAiLabelingRequest) =>
      apiClient.post<void>({
        endpoint: '/upload/jobs',
        body: request,
      }),
  });
};

export const useSaveCoverLetter = () => {
  return useMutation({
    mutationFn: ({ uploadJobId, coverLetters }: SaveCoverLetterRequest) =>
      apiClient.post<SaveCoverLetterResponse>({
        endpoint: `/coverletter/upload/${uploadJobId}`,
        body: { coverLetters },
      }),
  });
};

export const useGetCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () =>
      apiClient.get<string[]>({
        endpoint: '/coverletter/companies/all',
      }),
  });
};

export const useGetJobPositions = () => {
  return useQuery({
    queryKey: ['jobPositions'],
    queryFn: () =>
      apiClient.get<string[]>({
        endpoint: '/coverletter/job-positions/all',
      }),
  });
};
