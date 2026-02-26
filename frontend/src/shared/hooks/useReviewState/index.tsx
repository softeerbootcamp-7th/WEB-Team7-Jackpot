import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useLocation, useNavigate } from 'react-router';

import type { TextChangeResult } from '@/features/coverLetter/types/coverLetter';
import type { ApiReview } from '@/shared/api/reviewApi';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import {
  applyViewStatus,
  buildReviewsFromApi,
  calculateTextChange,
  parseTaggedText,
  reconstructTaggedText,
  updateReviewRanges,
  updateSelectionForTextChange,
} from '@/shared/hooks/useReviewState/helpers';
import type { MinimalQnA } from '@/shared/types/qna';
import type { Review } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';
import type {
  ReviewCreatedResponseType,
  ReviewDeletedResponseType,
  ReviewUpdatedResponseType,
  TextReplaceAllResponseType,
  TextUpdateResponseType,
} from '@/shared/types/websocket';

interface UseReviewStateParams {
  qna: MinimalQnA | undefined;
  apiReviews: ApiReview[] | undefined;
}

interface TaggedRange {
  id: number;
  start: number;
  end: number;
}

interface ReviewDispatchers {
  handleTextUpdateEvent: (
    qnaId: number,
    payload: TextUpdateResponseType['payload'],
  ) => void;
  handleTextReplaceAllEvent: (
    qnaId: number,
    payload: TextReplaceAllResponseType['payload'],
  ) => void;
  handleReviewCreatedEvent: (
    qnaId: number,
    payload: ReviewCreatedResponseType['payload'],
  ) => void;
  handleReviewDeletedEvent: (
    qnaId: number,
    payload: ReviewDeletedResponseType['payload'],
  ) => void;
  handleReviewUpdatedEvent: (
    qnaId: number,
    payload: ReviewUpdatedResponseType['payload'],
  ) => void;
  handleShareLinkDeactivatedEvent: (qnaId: number) => void;
}

export interface UseReviewStateResult {
  currentText: string;
  currentReviews: Review[];
  currentVersion: number;
  currentReplaceAllSignal: number;
  editingReview: Review | null;
  selection: SelectionInfo | null;
  setSelection: (selection: SelectionInfo | null) => void;
  handleTextChange: (
    newText: string,
    options?: { skipVersionIncrement?: boolean },
  ) => TextChangeResult | void;
  reserveNextVersion: () => number;
  handleUpdateReview: (id: number, suggest: string, comment: string) => void;
  handleEditReview: (id: number) => void;
  handleCancelEdit: () => void;
  editedAnswers: Record<number, string>;
  dispatchers: ReviewDispatchers;
}

/**
 * TODO: WebSocket 통합 시 상태 반영 정책
 *
 * 즉시 반영 (낙관적 업데이트):
 *   - Writer 텍스트 수정: handleTextChange로 로컬 즉시 반영, WebSocket으로 상대방에게 발송
 *   - 리뷰 수정: handleUpdateReview로 수정자 로컬 즉시 반영, 상대방은 WebSocket 수신
 *
 * WebSocket 이벤트 수신으로만 반영 (낙관적 업데이트 X):
 *   - 리뷰 생성: API 호출 → REVIEW_CREATED 이벤트 수신 시 반영
 *   - 리뷰 삭제: API 호출 → REVIEW_DELETED 이벤트 수신 시 반영
 *   - 리뷰 적용(approve): API 호출 → WebSocket 이벤트 수신 시 반영
 */
export const useReviewState = ({
  qna,
  apiReviews,
}: UseReviewStateParams): UseReviewStateResult => {
  const qnaId = qna?.qnAId;
  const qnaVersion = qna?.version ?? 0;
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToastMessageContext();

  const [reviewsByQnaId, setReviewsByQnaId] = useState<
    Record<number, Review[]>
  >({});
  const [editedAnswers, setEditedAnswers] = useState<Record<number, string>>(
    {},
  );
  const [versionByQnaId, setVersionByQnaId] = useState<Record<number, number>>(
    {},
  );
  const [replaceAllSignalByQnaId, setReplaceAllSignalByQnaId] = useState<
    Record<number, number>
  >({});

  const answer = qna?.answer ?? '';
  const parsed = useMemo(
    () =>
      answer
        ? parseTaggedText(answer)
        : {
            cleaned: '',
            taggedRanges: [] as Array<{
              id: number;
              start: number;
              end: number;
            }>,
          },
    [answer],
  );
  const originalText = parsed.cleaned;

  const currentText =
    qnaId !== undefined && editedAnswers[qnaId] !== undefined
      ? editedAnswers[qnaId]
      : originalText;
  const currentVersion =
    qnaId !== undefined ? (versionByQnaId[qnaId] ?? qnaVersion) : 0;
  const currentReplaceAllSignal =
    qnaId !== undefined ? (replaceAllSignalByQnaId[qnaId] ?? 0) : 0;

  const reviewsForCurrentQna =
    qnaId !== undefined ? reviewsByQnaId[qnaId] : undefined;

  const currentReviews = useMemo(() => {
    if (qnaId === undefined) return [];

    const baseReviews = (() => {
      if (reviewsForCurrentQna) return reviewsForCurrentQna;
      if (!apiReviews) return [];
      return buildReviewsFromApi(
        parsed.cleaned,
        parsed.taggedRanges,
        apiReviews,
      );
    })();

    // 입력 경로별 로컬 상태 업데이트 타이밍 차이가 있어도
    // 현재 본문 기준으로 viewStatus를 항상 최신으로 유지한다.
    return applyViewStatus(baseReviews, currentText);
  }, [qnaId, apiReviews, parsed, reviewsForCurrentQna, currentText]);

  const currentReviewsRef = useRef(currentReviews);
  useEffect(() => {
    currentReviewsRef.current = currentReviews;
  }, [currentReviews]);

  const editedAnswersRef = useRef(editedAnswers);
  useEffect(() => {
    editedAnswersRef.current = editedAnswers;
  }, [editedAnswers]);

  const versionByQnaIdRef = useRef(versionByQnaId);
  useEffect(() => {
    versionByQnaIdRef.current = versionByQnaId;
  }, [versionByQnaId]);

  const originalTextByQnaIdRef = useRef<Record<number, string>>({});
  useEffect(() => {
    if (qnaId === undefined) return;
    originalTextByQnaIdRef.current[qnaId] = originalText;
  }, [qnaId, originalText]);

  const lastTaggedRangesRef = useRef<Record<number, TaggedRange[]>>({});
  const socketEventQueueRef = useRef<Array<() => void>>([]);
  const isSocketQueueScheduledRef = useRef(false);

  const flushSocketEventQueue = useCallback(function flushQueuedSocketEvents() {
    try {
      while (socketEventQueueRef.current.length > 0) {
        const job = socketEventQueueRef.current.shift();
        try {
          job?.();
        } catch (e) {
          console.error('[useReviewState] socket event handler error:', e);
        }
      }
    } finally {
      isSocketQueueScheduledRef.current = false;
      if (socketEventQueueRef.current.length > 0) {
        isSocketQueueScheduledRef.current = true;
        queueMicrotask(flushQueuedSocketEvents);
      }
    }
  }, []);

  const enqueueSocketEvent = useCallback(
    (job: () => void) => {
      socketEventQueueRef.current.push(job);
      if (isSocketQueueScheduledRef.current) return;
      isSocketQueueScheduledRef.current = true;
      queueMicrotask(flushSocketEventQueue);
    },
    [flushSocketEventQueue],
  );

  const getLatestReviews = useCallback(
    (prev: Record<number, Review[]>, id: number): Review[] => {
      if (prev[id]) return prev[id];
      if (qnaId === id) return currentReviewsRef.current;
      return [];
    },
    [qnaId],
  );

  const [selection, setSelection] = useState<SelectionInfo | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const editingReview = useMemo(
    () =>
      editingId !== null
        ? (currentReviews.find((r) => r.id === editingId) ?? null)
        : null,
    [editingId, currentReviews],
  );

  const getCurrentTextByQnaId = useCallback(
    (targetQnaId: number) =>
      editedAnswersRef.current[targetQnaId] ??
      originalTextByQnaIdRef.current[targetQnaId] ??
      '',
    [],
  );

  const getCurrentVersionByQnaId = useCallback(
    (targetQnaId: number) =>
      versionByQnaIdRef.current[targetQnaId] ??
      (targetQnaId === qnaId ? qnaVersion : 0),
    [qnaId, qnaVersion],
  );

  const getApiReviewSource = useCallback(
    (_targetQnaId: number, baseReviews: Review[]): ApiReview[] => {
      // baseReviews(로컬 상태)를 그대로 변환해 반환한다.
      // 삭제된 리뷰가 stale 상태인 apiReviews 캐시를 통해 부활하지 않도록
      // apiReviews와의 병합은 하지 않는다.
      return baseReviews.map((review) => ({
        id: review.id,
        sender: review.sender ?? { id: '', nickname: '' },
        originText: review.originText,
        suggest: review.suggest ?? null,
        comment: review.comment ?? '',
        createdAt: review.createdAt ?? '',
        isApproved: Boolean(review.isApproved),
      }));
    },
    [],
  );

  const revalidateReviewsByCurrentText = useCallback(
    (reviews: Review[], currentDocumentText: string): Review[] => {
      return applyViewStatus(reviews, currentDocumentText);
    },
    [],
  );

  const handleTextUpdateEvent = useCallback(
    (targetQnaId: number, payload: TextUpdateResponseType['payload']) => {
      if (targetQnaId !== qnaId) return;

      const { startIdx, endIdx, replacedText, version } = payload;
      const currentVersionForQna = getCurrentVersionByQnaId(targetQnaId);
      if (version <= currentVersionForQna) return;

      // 서버 인덱스(startIdx, endIdx)는 태그 포함 본문 기준이므로
      // 현재 clean text에서 tagged text를 복원하고 delta를 적용한 뒤 다시 파싱한다.
      const currentCleanText =
        editedAnswersRef.current[targetQnaId] ??
        originalTextByQnaIdRef.current[targetQnaId] ??
        '';
      const reviewsForTagging = currentReviewsRef.current;

      const taggedText = reconstructTaggedText(
        currentCleanText,
        reviewsForTagging,
      );
      const newTaggedText =
        taggedText.slice(0, startIdx) + replacedText + taggedText.slice(endIdx);
      const { cleaned: newCleanText, taggedRanges } =
        parseTaggedText(newTaggedText);

      // 다음 소켓 이벤트가 render 이전에 와도 최신 기준으로 계산되도록 ref를 즉시 동기화한다.
      editedAnswersRef.current = {
        ...editedAnswersRef.current,
        [targetQnaId]: newCleanText,
      };
      versionByQnaIdRef.current = {
        ...versionByQnaIdRef.current,
        [targetQnaId]: version,
      };
      lastTaggedRangesRef.current[targetQnaId] = taggedRanges;

      setEditedAnswers((prev) => ({ ...prev, [targetQnaId]: newCleanText }));
      setVersionByQnaId((prev) => ({ ...prev, [targetQnaId]: version }));

      setReviewsByQnaId((prevReviews) => {
        const baseReviews = getLatestReviews(prevReviews, targetQnaId);
        const sourceReviews = getApiReviewSource(targetQnaId, baseReviews);
        return {
          ...prevReviews,
          [targetQnaId]: buildReviewsFromApi(
            newCleanText,
            taggedRanges,
            sourceReviews,
          ),
        };
      });

      const change = calculateTextChange(currentCleanText, newCleanText);
      setSelection((prev) => {
        if (!prev) return null;
        return updateSelectionForTextChange(
          prev,
          change.changeStart,
          change.oldLength,
          change.newLength,
          newCleanText,
        );
      });
    },
    [getCurrentVersionByQnaId, getLatestReviews, getApiReviewSource, qnaId],
  );

  const handleTextReplaceAllEvent = useCallback(
    (targetQnaId: number, payload: TextReplaceAllResponseType['payload']) => {
      if (targetQnaId !== qnaId) return;

      const { version, content } = payload;
      // TEXT_REPLACE_ALL은 서버의 전체 상태 스냅샷이므로 버전 비교 없이 항상 적용한다.
      // Writer가 투기적으로 올린 로컬 버전이 서버 버전보다 높더라도 덮어쓴다.
      const { cleaned, taggedRanges } = parseTaggedText(content);
      const oldText = getCurrentTextByQnaId(targetQnaId);
      lastTaggedRangesRef.current[targetQnaId] = taggedRanges;
      // 다음 소켓 이벤트가 render 이전에 와도 최신 기준으로 계산되도록 ref를 즉시 동기화한다.
      editedAnswersRef.current = {
        ...editedAnswersRef.current,
        [targetQnaId]: cleaned,
      };
      versionByQnaIdRef.current = {
        ...versionByQnaIdRef.current,
        [targetQnaId]: version,
      };

      setEditedAnswers((prev) => ({ ...prev, [targetQnaId]: cleaned }));
      const change = calculateTextChange(oldText, cleaned);

      setReviewsByQnaId((prevReviews) => {
        const baseReviews = getLatestReviews(prevReviews, targetQnaId);
        if (taggedRanges.length === 0) {
          const nextReviews = updateReviewRanges(
            baseReviews,
            change.changeStart,
            change.oldLength,
            change.newLength,
            cleaned,
          );
          return {
            ...prevReviews,
            [targetQnaId]: nextReviews,
          };
        }

        const sourceReviews = getApiReviewSource(targetQnaId, baseReviews);
        const nextReviews = buildReviewsFromApi(
          cleaned,
          taggedRanges,
          sourceReviews,
        );
        return {
          ...prevReviews,
          [targetQnaId]: nextReviews,
        };
      });

      setSelection((prev) => {
        if (!prev) return null;
        return updateSelectionForTextChange(
          prev,
          change.changeStart,
          change.oldLength,
          change.newLength,
          cleaned,
        );
      });
      setVersionByQnaId((prev) => ({ ...prev, [targetQnaId]: version }));
      setReplaceAllSignalByQnaId((prev) => ({
        ...prev,
        [targetQnaId]: (prev[targetQnaId] ?? 0) + 1,
      }));
    },
    [getCurrentTextByQnaId, getLatestReviews, getApiReviewSource, qnaId],
  );

  const handleShareLinkDeactivatedEvent = useCallback(
    (targetQnaId: number) => {
      if (targetQnaId !== qnaId) return;

      const isReviewerMode = location.pathname.includes('review');
      if (!isReviewerMode) return;

      showToast('첨삭 링크가 비활성화되어 홈으로 이동합니다.', false);
      navigate('/home', { replace: true });
    },
    [qnaId, navigate, showToast, location],
  );

  const handleReviewCreatedEvent = useCallback(
    (targetQnaId: number, payload: ReviewCreatedResponseType['payload']) => {
      if (targetQnaId !== qnaId) return;

      const { reviewId, originText, suggest, comment, sender, createdAt } =
        payload;
      const taggedRange = lastTaggedRangesRef.current[targetQnaId]?.find(
        (range) => range.id === reviewId,
      );
      const currentDocumentText = getCurrentTextByQnaId(targetQnaId);

      const review: Review = {
        id: reviewId,
        originText,
        comment,
        range: taggedRange
          ? { start: taggedRange.start, end: taggedRange.end }
          : { start: -1, end: -1 },
        sender,
        suggest,
        createdAt,
        isApproved: false,
      };

      setReviewsByQnaId((prevReviews) => {
        const baseReviews = getLatestReviews(prevReviews, targetQnaId);
        const nextReviews = baseReviews.some((r) => r.id === reviewId)
          ? baseReviews.map((r) => (r.id === reviewId ? review : r))
          : [...baseReviews, review];
        return {
          ...prevReviews,
          [targetQnaId]: applyViewStatus(nextReviews, currentDocumentText),
        };
      });
    },
    [getCurrentTextByQnaId, getLatestReviews, qnaId],
  );

  const handleReviewDeletedEvent = useCallback(
    (targetQnaId: number, payload: ReviewDeletedResponseType['payload']) => {
      if (targetQnaId !== qnaId) return;

      setReviewsByQnaId((prevReviews) => ({
        ...prevReviews,
        [targetQnaId]: getLatestReviews(prevReviews, targetQnaId).filter(
          (review) => review.id !== payload.reviewId,
        ),
      }));

      setEditingId((prev) => (prev === payload.reviewId ? null : prev));

      setSelection((prev) => {
        if (!prev) return null;
        if ('reviewId' in prev && prev.reviewId === payload.reviewId)
          return null;
        return prev;
      });
    },
    [getLatestReviews, qnaId],
  );

  const handleReviewUpdatedEvent = useCallback(
    (targetQnaId: number, payload: ReviewUpdatedResponseType['payload']) => {
      if (targetQnaId !== qnaId) return;

      const currentDocumentText = getCurrentTextByQnaId(targetQnaId);

      setReviewsByQnaId((prevReviews) => {
        const baseReviews = getLatestReviews(prevReviews, targetQnaId);
        const patchedReviews = baseReviews.map((review) => {
          if (review.id !== payload.reviewId) return review;

          const { start, end } = review.range;
          const incomingOriginText = payload.originText;
          const incomingSuggest = payload.suggest;
          const previousOriginText = review.originText;
          const previousSuggest = review.suggest ?? null;

          // 승인/되돌리기 토글에서는 origin/suggest가 서로 뒤집혀 들어온다.
          // originText === suggest인 경우 swap 감지가 불가하므로 제외
          const isSwapToggleEvent =
            previousSuggest !== null &&
            incomingOriginText !== incomingSuggest &&
            incomingOriginText === previousSuggest &&
            incomingSuggest === previousOriginText;

          const nextIsApproved = (() => {
            if (payload.isApproved !== undefined) return payload.isApproved;
            if (isSwapToggleEvent) return !review.isApproved;
            const rangeMatchesOrigin =
              start >= 0 &&
              end >= 0 &&
              currentDocumentText.slice(start, end) === incomingOriginText;
            return rangeMatchesOrigin ? Boolean(review.isApproved) : false;
          })();

          return {
            ...review,
            originText: incomingOriginText,
            suggest: incomingSuggest,
            comment: payload.content,
            isApproved: nextIsApproved,
          };
        });

        const nextReviews = revalidateReviewsByCurrentText(
          patchedReviews,
          currentDocumentText,
        );

        return {
          ...prevReviews,
          [targetQnaId]: nextReviews,
        };
      });
    },
    [
      getCurrentTextByQnaId,
      getLatestReviews,
      qnaId,
      revalidateReviewsByCurrentText,
    ],
  );

  const handleTextChange = useCallback(
    (
      newText: string,
      options?: { skipVersionIncrement?: boolean },
    ): TextChangeResult | void => {
      if (qnaId === undefined) return;

      const oldText = getCurrentTextByQnaId(qnaId);
      const change = calculateTextChange(oldText, newText);
      // 같은 tick 내 연속 입력/삭제(특히 IME 경계)에서도
      // 다음 계산이 최신 텍스트를 기준으로 동작하도록 ref를 즉시 동기화한다.
      editedAnswersRef.current = {
        ...editedAnswersRef.current,
        [qnaId]: newText,
      };

      setEditedAnswers((prev) => ({ ...prev, [qnaId]: newText }));
      setReviewsByQnaId((prevReviews) => {
        const baseReviews = getLatestReviews(prevReviews, qnaId);
        return {
          ...prevReviews,
          [qnaId]: updateReviewRanges(
            baseReviews,
            change.changeStart,
            change.oldLength,
            change.newLength,
            newText,
          ),
        };
      });
      if (!options?.skipVersionIncrement) {
        const nextVersion = getCurrentVersionByQnaId(qnaId) + 1;
        versionByQnaIdRef.current = {
          ...versionByQnaIdRef.current,
          [qnaId]: nextVersion,
        };
        setVersionByQnaId((prev) => ({
          ...prev,
          [qnaId]: nextVersion,
        }));
      }

      setSelection((prev) => {
        if (!prev) return null;
        return updateSelectionForTextChange(
          prev,
          change.changeStart,
          change.oldLength,
          change.newLength,
          newText,
        );
      });
      return change;
    },

    [qnaId, getCurrentTextByQnaId, getCurrentVersionByQnaId, getLatestReviews],
  );

  const reserveNextVersion = useCallback((): number => {
    if (qnaId === undefined) return 0;
    const nextVersion = getCurrentVersionByQnaId(qnaId) + 1;
    versionByQnaIdRef.current = {
      ...versionByQnaIdRef.current,
      [qnaId]: nextVersion,
    };
    setVersionByQnaId((prev) => ({
      ...prev,
      [qnaId]: nextVersion,
    }));
    return nextVersion;
  }, [qnaId, getCurrentVersionByQnaId]);

  const handleUpdateReview = useCallback(
    (id: number, suggest: string, comment: string) => {
      if (qnaId === undefined) return;
      setReviewsByQnaId((prev) => ({
        ...prev,
        [qnaId]: getLatestReviews(prev, qnaId).map((r) =>
          r.id === id ? { ...r, suggest, comment } : r,
        ),
      }));
      setEditingId(null);
    },
    [qnaId, getLatestReviews],
  );

  const handleEditReview = useCallback((id: number) => setEditingId(id), []);
  const handleCancelEdit = useCallback(() => setEditingId(null), []);

  const dispatchers = useMemo<ReviewDispatchers>(
    () => ({
      handleTextUpdateEvent: (targetQnaId, payload) =>
        enqueueSocketEvent(() => handleTextUpdateEvent(targetQnaId, payload)),
      handleTextReplaceAllEvent: (targetQnaId, payload) =>
        enqueueSocketEvent(() =>
          handleTextReplaceAllEvent(targetQnaId, payload),
        ),
      handleReviewCreatedEvent: (targetQnaId, payload) =>
        enqueueSocketEvent(() =>
          handleReviewCreatedEvent(targetQnaId, payload),
        ),
      handleReviewDeletedEvent: (targetQnaId, payload) =>
        enqueueSocketEvent(() =>
          handleReviewDeletedEvent(targetQnaId, payload),
        ),
      handleReviewUpdatedEvent: (targetQnaId, payload) =>
        enqueueSocketEvent(() =>
          handleReviewUpdatedEvent(targetQnaId, payload),
        ),
      handleShareLinkDeactivatedEvent: (targetQnaId) =>
        enqueueSocketEvent(() => handleShareLinkDeactivatedEvent(targetQnaId)),
    }),
    [
      enqueueSocketEvent,
      handleTextUpdateEvent,
      handleTextReplaceAllEvent,
      handleReviewCreatedEvent,
      handleReviewDeletedEvent,
      handleReviewUpdatedEvent,
      handleShareLinkDeactivatedEvent,
    ],
  );

  return {
    currentText,
    currentReviews,
    currentVersion,
    currentReplaceAllSignal,
    editingReview,
    selection,
    setSelection,
    handleTextChange,
    reserveNextVersion,
    handleUpdateReview,
    handleEditReview,
    handleCancelEdit,
    editedAnswers,
    dispatchers,
  };
};

export default useReviewState;
