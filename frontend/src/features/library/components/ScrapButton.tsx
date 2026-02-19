import { useEffect, useState } from 'react';

import { useParams } from 'react-router';

import {
  useCreateScrapMutation,
  useDeleteScrapMutation,
} from '@/features/library/hooks/queries/useScrapMutations';

// 1. Props 정의
// 부모 컴포넌트(상세 페이지)에서 초기 스크랩 여부를 받아와야 가장 정확해.
interface Props {
  initialIsScrapped?: boolean; // 서버에서 받은 초기 상태 (없으면 false 처리)
}

const ScrapButton = ({ initialIsScrapped = false }: Props) => {
  const { qnAId } = useParams<{ qnAId: string }>();

  // 2. Local State로 UI 즉각 반응 (Optimistic UI 흉내)
  const [isScrapped, setIsScrapped] = useState(initialIsScrapped);

  // 3. 커스텀 훅 가져오기
  const { mutate: createScrap } = useCreateScrapMutation();
  const { mutate: deleteScrap } = useDeleteScrapMutation();

  // props가 변경되면 state도 동기화
  useEffect(() => {
    setIsScrapped(initialIsScrapped);
  }, [initialIsScrapped]);

  const handleToggleScrap = () => {
    // qnAId가 URL에 없거나 숫자가 아니면 방어 로직
    if (!qnAId) {
      console.error('qnAId가 없습니다.');
      return;
    }

    const targetId = Number(qnAId); // API는 number를 원하므로 변환 필수!

    if (Number.isNaN(targetId)) {
      console.error('유효하지 않은 qnAId입니다:', qnAId);
      return;
    }

    if (isScrapped) {
      if (!confirm('스크랩을 취소하시겠습니까?')) return;

      // 낙관적 업데이트
      setIsScrapped(false);

      deleteScrap(targetId, {
        onError: () => {
          // 실패 시 롤백
          setIsScrapped(true);
          alert('스크랩 취소에 실패했습니다.');
        },
      });
    } else {
      // 낙관적 업데이트
      setIsScrapped(true);

      createScrap(
        { qnAId: targetId },
        {
          onError: () => {
            // 실패하면 원상복구
            setIsScrapped(false);
            alert('스크랩에 실패했습니다.');
          },
        },
      );
    }
  };

  return (
    <button
      onClick={handleToggleScrap}
      className={`rounded-md px-4 py-2 font-bold transition-colors duration-200 ${
        isScrapped
          ? 'bg-yellow-400 text-white hover:bg-yellow-500' // 스크랩 상태 (활성)
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300' // 미스크랩 상태 (비활성)
      } `}
    >
      {/* 아이콘을 넣으면 더 직관적이야 (예: 별 모양) */}
      {isScrapped ? '스크랩 취소' : '스크랩하기'}
    </button>
  );
};

export default ScrapButton;
