import { useCallback, useEffect, useRef } from 'react';

import { createTextUpdatePayload } from '@/features/coverLetter/libs/textPatchUtils';
import type { Review } from '@/shared/types/review';
import type { WriterMessageType } from '@/shared/types/websocket';

const DUPLICATE_PATCH_WINDOW_MS = 150;
const DEBOUNCE_TIME = 300;

interface UseSendTextPatchParams {
  isConnected: boolean;
  shareId: string;
  qnAId: string;
  onReserveNextVersion: (() => number) | undefined;
  sendMessage: (destination: string, body: unknown) => void;
  onTextUpdateSent?: (at: string) => void;
  caretOffsetRef: React.MutableRefObject<number>;
  latestTextRef: React.MutableRefObject<string>;
  reviewsRef: React.MutableRefObject<Review[]>;
}

export const useSendTextPatch = ({
  isConnected,
  shareId,
  qnAId,
  onReserveNextVersion,
  sendMessage,
  onTextUpdateSent,
  caretOffsetRef,
  latestTextRef,
  reviewsRef,
}: UseSendTextPatchParams) => {
  const lastSentPatchRef = useRef<{
    oldText: string;
    newText: string;
    at: number;
  } | null>(null);
  const sendDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const debounceBaseTextRef = useRef<string | null>(null);
  const debounceBaseReviewsRef = useRef<Review[] | null>(null);
  const reservedVersionRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (sendDebounceTimerRef.current) {
        clearTimeout(sendDebounceTimerRef.current);
        sendDebounceTimerRef.current = null;
      }
    };
  }, []);

  const sendTextPatch = useCallback(
    (
      oldText: string,
      newText: string,
      reviewsForMapping?: Review[],
      options?: { force?: boolean },
    ) => {
      if (!isConnected) return false;
      if (!shareId || !qnAId) return false;
      if (!onReserveNextVersion) {
        console.error('[useSendTextPatch] onReserveNextVersion is required');
        return false;
      }
      if (oldText === newText) return false;

      const transmit = (
        fromText: string,
        toText: string,
        reviews: Review[],
        version: number,
      ) => {
        const now = Date.now();
        const lastSentPatch = lastSentPatchRef.current;

        if (
          lastSentPatch &&
          lastSentPatch.oldText === fromText &&
          lastSentPatch.newText === toText &&
          now - lastSentPatch.at < DUPLICATE_PATCH_WINDOW_MS
        ) {
          return;
        }

        if (fromText === toText) return;

        const caretAfter = caretOffsetRef.current;
        const payload = createTextUpdatePayload({
          oldText: fromText,
          newText: toText,
          caretAfter,
          reviews,
        });

        sendMessage(`/pub/share/${shareId}/qna/${qnAId}/text-update`, {
          version,
          startIdx: payload.startIdx,
          endIdx: payload.endIdx,
          replacedText: payload.replacedText,
        } as WriterMessageType);

        lastSentPatchRef.current = {
          oldText: fromText,
          newText: toText,
          at: now,
        };
        onTextUpdateSent?.(new Date().toISOString());
      };

      // FORCE 경로
      if (options?.force) {
        if (sendDebounceTimerRef.current) {
          clearTimeout(sendDebounceTimerRef.current);
          sendDebounceTimerRef.current = null;

          const pendingBaseText = debounceBaseTextRef.current;
          const pendingBaseReviews = debounceBaseReviewsRef.current;
          const pendingReservedVersion = reservedVersionRef.current;

          if (
            pendingBaseText !== null &&
            pendingReservedVersion !== null &&
            pendingBaseText !== latestTextRef.current
          ) {
            transmit(
              pendingBaseText,
              latestTextRef.current,
              pendingBaseReviews ?? reviewsRef.current,
              pendingReservedVersion,
            );
          }

          debounceBaseTextRef.current = null;
          debounceBaseReviewsRef.current = null;
          reservedVersionRef.current = null;
        }

        const immediateVersion = onReserveNextVersion();
        transmit(
          oldText,
          newText,
          reviewsForMapping ?? reviewsRef.current,
          immediateVersion,
        );

        return true;
      }

      // DEBOUNCE 경로
      if (sendDebounceTimerRef.current) {
        clearTimeout(sendDebounceTimerRef.current);
      }

      if (debounceBaseTextRef.current === null) {
        debounceBaseTextRef.current = oldText;
        debounceBaseReviewsRef.current = reviewsForMapping ?? null;
        reservedVersionRef.current = onReserveNextVersion();
      }

      sendDebounceTimerRef.current = setTimeout(() => {
        sendDebounceTimerRef.current = null;
        const baseText = debounceBaseTextRef.current;
        const baseReviews = debounceBaseReviewsRef.current;
        const reservedVersion = reservedVersionRef.current;

        debounceBaseTextRef.current = null;
        debounceBaseReviewsRef.current = null;
        reservedVersionRef.current = null;

        if (baseText === null || reservedVersion === null) return;

        transmit(
          baseText,
          latestTextRef.current,
          baseReviews ?? reviewsRef.current,
          reservedVersion,
        );
      }, DEBOUNCE_TIME);

      return true;
    },
    [
      isConnected,
      onReserveNextVersion,
      onTextUpdateSent,
      qnAId,
      sendMessage,
      shareId,
      caretOffsetRef,
      latestTextRef,
      reviewsRef,
    ],
  );

  const sendTextPatchRef = useRef(sendTextPatch);
  useEffect(() => {
    sendTextPatchRef.current = sendTextPatch;
  }, [sendTextPatch]);

  return { sendTextPatch, sendTextPatchRef };
};
