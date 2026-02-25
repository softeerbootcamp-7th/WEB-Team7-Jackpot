import type {
  FileUploadRequest,
  PresignedUrlRequest,
  PresignedUrlResponse,
  SaveCoverLetterRequest,
  SaveCoverLetterResponse,
  StartAiLabelingRequest,
} from '@/features/upload/types/upload';
import { apiClient } from '@/shared/api/apiClient';

// Presigned URL 발급
export const issuePresignedUrlApi = (request: PresignedUrlRequest) =>
  apiClient.post<PresignedUrlResponse>({
    endpoint: '/upload/presignedurl',
    body: request,
  });

// S3 파일 업로드
export const fileUploadToS3Api = async (request: FileUploadRequest) => {
  const response = await fetch(request.presignedUrl, {
    method: 'PUT',
    body: request.file,
    headers: { 'Content-Type': request.contentType },
  });

  if (!response.ok) throw new Error(`S3 업로드 실패: ${response.status}`);
};

// AI 라벨링 시작
export const startAiLabelingApi = (request: StartAiLabelingRequest) =>
  apiClient.post<void>({
    endpoint: '/upload/jobs',
    body: request,
  });

// 자기소개서 저장
export const saveCoverLetterApi = ({
  uploadJobId,
  coverLetters,
}: SaveCoverLetterRequest) =>
  apiClient.post<SaveCoverLetterResponse>({
    endpoint: `/coverletter/upload/${uploadJobId}`,
    body: { coverLetters },
  });
