import { useEffect, useState } from 'react';

interface Props {
  label: string;
  name?: string;
  value?: string | Date;
  onChange: (value: string) => void;
  upload?: boolean;
}

// 파싱 헬퍼 함수 (컴포넌트 밖)
const parseDate = (val?: string | Date) => {
  if (!val) return { y: '', m: '', d: '' };

  if (typeof val === 'string') {
    const parts = val.split('-');
    return parts.length === 3
      ? { y: parts[0], m: parts[1], d: parts[2] }
      : { y: '', m: '', d: '' };
  }

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return { y: '', m: '', d: '' };
    return {
      y: String(val.getFullYear()),
      m: String(val.getMonth() + 1).padStart(2, '0'),
      d: String(val.getDate()).padStart(2, '0'),
    };
  }

  return { y: '', m: '', d: '' };
};

const Deadline = ({ label, value, onChange, upload = false }: Props) => {
  // 초기값 세팅
  const initial = parseDate(value);

  const [localY, setLocalY] = useState(initial.y);
  const [localM, setLocalM] = useState(initial.m);
  const [localD, setLocalD] = useState(initial.d);

  // [수정된 useEffect]
  useEffect(() => {
    const { y: propY, m: propM, d: propD } = parseDate(value);

    // 숫자로 변환하여 비교 ( "5" == "05" )
    // 빈 문자열('')은 Number 변환 시 0이 되므로, 둘 다 비어있는 경우도 체크해야 함
    const isEq = (a: string, b: string) => {
      if (a === b) return true; // 완전 일치
      if (a === '' || b === '') return false; // 하나만 비었으면 불일치
      return Number(a) === Number(b); // "05" vs "5" 처리
    };

    // 현재 로컬 상태와 부모로부터 온 값이 '의미적으로' 같으면 무시
    if (isEq(localY, propY) && isEq(localM, propM) && isEq(localD, propD)) {
      return;
    }

    // 다르면 업데이트 (외부에서 데이터가 로드된 경우)
    setLocalY(propY);
    setLocalM(propM);
    setLocalD(propD);

    // 의존성 배열에는 value만 넣습니다. local state를 넣으면 루프 돕니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleInputChange = (
    type: 'year' | 'month' | 'day',
    inputValue: string,
  ) => {
    const numValue = inputValue.replace(/[^0-9]/g, '');

    if (type === 'year' && numValue.length > 4) return;
    if ((type === 'month' || type === 'day') && numValue.length > 2) return;

    // UI 즉시 반영 (사용자 경험 최우선)
    if (type === 'year') setLocalY(numValue);
    if (type === 'month') setLocalM(numValue);
    if (type === 'day') setLocalD(numValue);

    // 부모 전송용 데이터 계산
    const nextY = type === 'year' ? numValue : localY;
    const nextM = type === 'month' ? numValue : localM;
    const nextD = type === 'day' ? numValue : localD;

    // 모두 유효할 때만 전송
    if (nextY.length === 4 && nextM.length >= 1 && nextD.length >= 1) {
      const formattedM = nextM.padStart(2, '0');
      const formattedD = nextD.padStart(2, '0');

      // 입력 중인 값과 기존 value가 다를 때만 호출하여 부모 리렌더링 최소화
      onChange(`${nextY}-${formattedM}-${formattedD}`);
    }
  };

  return (
    <div className='flex w-full flex-col items-start justify-start gap-3'>
      <div className='text-lg font-bold text-gray-950'>
        {label} <span className='text-red-600'>*</span>
      </div>

      <div
        className={
          upload
            ? 'grid w-full grid-cols-3 gap-2'
            : 'flex w-full items-start justify-between gap-2'
        }
      >
        {/* 연도 */}
        <div
          className={`flex h-12 ${upload ? '' : 'min-w-0 flex-1'} items-center rounded-lg bg-gray-50 px-3`}
        >
          <input
            type='text'
            inputMode='numeric'
            placeholder='YYYY'
            value={localY}
            onChange={(e) => handleInputChange('year', e.target.value)}
            className='min-w-0 flex-1 bg-transparent text-center text-sm leading-5 font-normal text-gray-950 placeholder:text-gray-400 focus:outline-none'
          />
          <div className='ml-1 shrink-0 text-base leading-6 font-medium whitespace-nowrap text-gray-950'>
            년
          </div>
        </div>

        {/* 월 */}
        <div
          className={`flex h-12 ${upload ? '' : 'min-w-0 flex-1'} items-center rounded-lg bg-gray-50 px-3`}
        >
          <input
            type='text'
            inputMode='numeric'
            placeholder='MM'
            value={localM}
            onChange={(e) => handleInputChange('month', e.target.value)}
            className='min-w-0 flex-1 bg-transparent text-center text-sm leading-5 font-normal text-gray-950 placeholder:text-gray-400 focus:outline-none'
          />
          <div className='ml-1 shrink-0 text-base leading-6 font-medium whitespace-nowrap text-gray-950'>
            월
          </div>
        </div>

        {/* 일 */}
        <div
          className={`flex h-12 ${upload ? '' : 'min-w-0 flex-1'} items-center rounded-lg bg-gray-50 px-3`}
        >
          <input
            type='text'
            inputMode='numeric'
            placeholder='DD'
            value={localD}
            onChange={(e) => handleInputChange('day', e.target.value)}
            className='min-w-0 flex-1 bg-transparent text-center text-sm leading-5 font-normal text-gray-950 placeholder:text-gray-400 focus:outline-none'
          />
          <div className='ml-1 shrink-0 text-base leading-6 font-medium whitespace-nowrap text-gray-950'>
            일
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deadline;
