import QnA from '@/features/library/components/QnA';
import { emptyCaseText } from '@/features/library/constants';
import DataGuard from '@/shared/components/DataGuard';
import EmptyCase from '@/shared/components/EmptyCase';

// 데이터 로직 나중에
// 문항 데이터 + 기업 데이터 타입 다르고 BE한테 물어봐야함
// 자잘한 디자인 수정
const DetailView = () => {
  const hasContent = false;

  return (
    <DataGuard
      className='w-[873px] overflow-hidden'
      data={hasContent}
      fallback={<EmptyCase {...emptyCaseText.folder} />}
    >
      {<QnA />}
    </DataGuard>
  );
};

export default DetailView;
