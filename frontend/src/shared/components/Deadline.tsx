import { useState } from 'react';

import { getDaysInMonth, isValidDate, parseDate } from '@/shared/utils/dates';

interface Props {
  label: string;
  name?: string;
  value?: string | Date;
  onChange: (value: string) => void;
}

const Deadline = ({ label, value, onChange }: Props) => {
  const initial = parseDate(value);

  const [localY, setLocalY] = useState(initial.y);
  const [localM, setLocalM] = useState(initial.m);
  const [localD, setLocalD] = useState(initial.d);

  // ✨ 핵심 1: 부모로부터 받은 이전 value를 기억할 상태를 하나 만듭니다.
  const [prevValue, setPrevValue] = useState(value);

  // ✨ 핵심 2: useEffect 없이 렌더링 중에 바로 비교해 버립니다!
  if (value !== prevValue) {
    // 값이 달라졌다면, 새로운 값으로 동기화합니다.
    setPrevValue(value);

    const { y, m, d } = parseDate(value);
    setLocalY(y);
    setLocalM(m);
    setLocalD(d);
  }

  const handleInputChange = (
    type: 'year' | 'month' | 'day',
    inputValue: string,
  ) => {
    const numValue = inputValue.replace(/[^0-9]/g, '');

    // 1. 입력 단계에서의 방어 로직 (사용자가 타이핑하는 순간 블로킹)
    if (type === 'year' && numValue.length > 4) return;

    if (type === 'month') {
      if (numValue.length > 2) return;
      if (Number(numValue) > 12) return; // 13 이상 입력 블록
      if (numValue.length === 2 && Number(numValue) === 0) return; // '00' 입력 블록
    }

    if (type === 'day') {
      if (numValue.length > 2) return;

      // 현재 입력된 연/월 기준으로 허용되는 최대 일수 계산
      const maxDays = getDaysInMonth(localY, localM);
      if (Number(numValue) > maxDays) return; // (예) 2월인데 30을 누르면 무시됨
      if (numValue.length === 2 && Number(numValue) === 0) return; // '00' 입력 블록
    }

    // UI 즉시 반영
    if (type === 'year') setLocalY(numValue);
    if (type === 'month') setLocalM(numValue);
    if (type === 'day') setLocalD(numValue);

    // 부모 전송용 데이터 계산
    const nextY = type === 'year' ? numValue : localY;
    const nextM = type === 'month' ? numValue : localM;
    const nextD = type === 'day' ? numValue : localD;

    // 2. 완벽한 날짜가 완성되었을 때의 검증 로직
    if (nextY.length === 4 && nextM.length >= 1 && nextD.length >= 1) {
      const formattedM = nextM.padStart(2, '0');
      const formattedD = nextD.padStart(2, '0');

      // 사용자가 '일'을 31로 먼저 치고, 나중에 '월'을 2월로 바꾼 경우 등 예외 상황 방어
      if (isValidDate(nextY, formattedM, formattedD)) {
        onChange(`${nextY}-${formattedM}-${formattedD}`);
      }
    }
  };

  return (
    <div className='flex w-full flex-col items-start justify-start gap-3'>
      <div className='text-lg font-bold text-gray-950'>
        {label} <span className='text-red-600'>*</span>
      </div>

      <div className='flex w-full items-start justify-between gap-2'>
        {/* 연도 */}
        <div className='flex h-12 min-w-0 flex-1 items-center rounded-2xl bg-gray-50 px-3'>
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
        <div className='flex h-12 min-w-0 flex-1 items-center rounded-2xl bg-gray-50 px-3'>
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
        <div className='flex h-12 min-w-0 flex-1 items-center rounded-2xl bg-gray-50 px-3'>
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
