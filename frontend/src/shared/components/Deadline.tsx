import { useState } from 'react';

import { getDaysInMonth, isValidDate, parseDate } from '@/shared/utils/dates';

interface Props {
  label: string;
  name?: string;
  value?: string | Date;
  onChange: (value: string) => void;
  upload?: boolean;
}

const Deadline = ({ label, value, onChange, upload = false }: Props) => {
  const [isError, setIsError] = useState({
    year: false,
    month: false,
    day: false,
  });
  const isIntegrationError = Object.values(isError).some(
    (each) => each === true,
  );

  const [localY, setLocalY] = useState(() => parseDate(value).y);
  const [localM, setLocalM] = useState(() => parseDate(value).m);
  const [localD, setLocalD] = useState(() => parseDate(value).d);

  // ✨ 핵심 1: 부모로부터 받은 이전 value를 기억할 상태를 하나 만듭니다.
  const [prevValue, setPrevValue] = useState(value);

  // 마지막으로 브로드캐스트한 값을 기억하는 상태 (부모로부터 받은 이전 value로 초기화)
  const [lastBroadcastValue, setLastBroadcastValue] = useState(value);

  const getValidationError = (y: string, m: string, d: string) => {
    const monthNum = Number(m);
    const dayNum = Number(d);
    const maxDays = getDaysInMonth(y, m);

    return {
      year: false,
      month: (m.length > 0 && monthNum < 1) || monthNum > 12,
      day: (d.length > 0 && dayNum < 1) || dayNum > maxDays,
    };
  };

  // ✨ 핵심 2: useEffect 없이 렌더링 중에 바로 비교해 버립니다!
  if (value !== prevValue) {
    // 값이 달라졌다면, 새로운 값으로 동기화합니다.
    setPrevValue(value);

    // 부모로부터 내려온 값과 마지막으로 보낸 값이 다른 경우
    // -> 사용자가 탭을 바꿨거나 외부 요인에 의한 초기화
    if (value !== lastBroadcastValue) {
      const { y, m, d } = parseDate(value);
      setLocalY(y);
      setLocalM(m);
      setLocalD(d);

      setIsError(getValidationError(y, m, d));
    }
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
    }

    if (type === 'day') {
      if (numValue.length > 2) return;
    }

    // UI 즉시 반영
    if (type === 'year') setLocalY(numValue);
    if (type === 'month') setLocalM(numValue);
    if (type === 'day') setLocalD(numValue);

    // 부모 전송용 데이터 계산
    const nextY = type === 'year' ? numValue : localY;
    const nextM = type === 'month' ? numValue : localM;
    const nextD = type === 'day' ? numValue : localD;

    const newErrors = getValidationError(nextY, nextM, nextD);
    setIsError(newErrors);

    const isComplete =
      nextY.length === 4 && nextM.length > 0 && nextD.length > 0;

    // 2. 완벽한 날짜가 완성되었을 때의 검증 로직
    if (isComplete) {
      const formattedM = nextM.padStart(2, '0');
      const formattedD = nextD.padStart(2, '0');

      // 사용자가 '일'을 31로 먼저 치고, 나중에 '월'을 2월로 바꾼 경우 등 예외 상황 방어
      if (
        !newErrors.year &&
        !newErrors.month &&
        !newErrors.day &&
        isValidDate(nextY, formattedM, formattedD)
      ) {
        const finalDate = `${nextY}-${formattedM}-${formattedD}`;
        // 핸들러로 보내는 finalDate를 사용하여 상태 업데이트
        setLastBroadcastValue(finalDate);
        onChange(finalDate);
      } else {
        setLastBroadcastValue('');
        onChange('');
      }
    } else {
      setLastBroadcastValue('');
      onChange('');
    }
  };

  const handleBlur = (type: 'month' | 'day') => {
    const currentY = localY;
    let currentM = localM;
    let currentD = localD;

    if (type === 'month' && localM.length === 1) {
      currentM = localM.padStart(2, '0');
      setLocalM(currentM);
    }

    if (type === 'day' && localD.length === 1) {
      currentD = localD.padStart(2, '0');
      setLocalD(currentD);
    }

    // 포커스가 나갔을 때 완성된 값이 유효하다면 부모에게 최종 전달
    if (currentY.length === 4 && currentM.length > 0 && currentD.length > 0) {
      const errors = getValidationError(currentY, currentM, currentD);
      setIsError(errors);

      if (
        !errors.year &&
        !errors.month &&
        !errors.day &&
        isValidDate(currentY, currentM, currentD)
      ) {
        const finalDate = `${currentY}-${currentM}-${currentD}`;
        setLastBroadcastValue(finalDate);
        onChange(finalDate);
      } else {
        setLastBroadcastValue('');
        onChange('');
      }
    } else {
      setLastBroadcastValue('');
      onChange('');
    }
  };

  return (
    <div className='flex w-full flex-col items-start justify-start gap-3'>
      <div className='relative flex w-full items-center text-lg font-bold text-gray-950'>
        {label} <span className='text-red-600'>*</span>
        <span
          className={`text-body-s absolute right-0 transition-opacity duration-200 ${
            isIntegrationError ? 'opacity-100' : 'pointer-events-none opacity-0'
          } text-red-600`}
        >
          유효하지 않은 마감일입니다.
        </span>
      </div>

      <div
        className={`w-full gap-2 ${
          upload ? 'grid grid-cols-3' : 'flex items-start justify-between'
        } `}
      >
        {/* 연도 */}
        <div
          className={`flex h-12 ${upload ? '' : 'min-w-0 flex-1'} items-center rounded-lg border bg-gray-50 px-3 transition-colors duration-200 ${isError.year ? 'border-red-600' : 'border-transparent'}`}
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
          className={`flex h-12 ${upload ? '' : 'min-w-0 flex-1'} items-center rounded-lg border bg-gray-50 px-3 transition-colors duration-200 ${isError.month ? 'border-red-600' : 'border-transparent'}`}
        >
          <input
            type='text'
            inputMode='numeric'
            placeholder='MM'
            value={localM}
            onBlur={() => handleBlur('month')}
            onChange={(e) => handleInputChange('month', e.target.value)}
            className='min-w-0 flex-1 bg-transparent text-center text-sm leading-5 font-normal text-gray-950 placeholder:text-gray-400 focus:outline-none'
          />
          <div className='ml-1 shrink-0 text-base leading-6 font-medium whitespace-nowrap text-gray-950'>
            월
          </div>
        </div>

        {/* 일 */}
        <div
          className={`flex h-12 ${upload ? '' : 'min-w-0 flex-1'} items-center rounded-lg border bg-gray-50 px-3 transition-colors duration-200 ${isError.day ? 'border-red-600' : 'border-transparent'}`}
        >
          <input
            type='text'
            inputMode='numeric'
            placeholder='DD'
            value={localD}
            onBlur={() => handleBlur('day')}
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
