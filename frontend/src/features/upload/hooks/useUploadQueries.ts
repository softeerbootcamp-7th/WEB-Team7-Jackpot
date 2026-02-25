import { useMutation } from '@tanstack/react-query';

import {
  fileUploadToS3Api,
  issuePresignedUrlApi,
  saveCoverLetterApi,
  startAiLabelingApi,
} from '@/features/upload/api/uploadApi';
import { useInvalidateCoverLetters } from '@/shared/hooks/useCoverLetterQueries';

export const useIssuePresignedUrl = () =>
  useMutation({ mutationFn: issuePresignedUrlApi });

export const useFileUpload = () =>
  useMutation({ mutationFn: fileUploadToS3Api });

export const useAiLabeling = () =>
  useMutation({ mutationFn: startAiLabelingApi });

export const useSaveCoverLetter = () => {
  const invalidate = useInvalidateCoverLetters();

  return useMutation({
    mutationFn: saveCoverLetterApi,
    onSuccess: () => {
      invalidate();
    },
  });
};
