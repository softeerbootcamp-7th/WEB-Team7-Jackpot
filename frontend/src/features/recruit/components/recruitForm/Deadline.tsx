interface Props {
  label: string;
  name?: string;
  value?: string | Date; // [수정] 외부에서 주입받는 값
  onChange: (value: string) => void; // [수정] 변경 핸들러 (YYYY-MM-DD 형식 반환)
}

const Deadline = ({ label, value, onChange }: Props) => {
  // 1. props.value를 기반으로 연/월/일 추출하는 함수
  const parseDate = (val?: string | Date) => {
    if (!val) return { y: '', m: '', d: '' };

    // "YYYY-MM-DD" 문자열인 경우
    if (typeof val === 'string') {
      const parts = val.split('-');
      if (parts.length === 3) {
        return { y: parts[0], m: parts[1], d: parts[2] };
      }
      // Date 객체 변환 시도 (ISO string 등)
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        return {
          y: String(date.getFullYear()),
          m: String(date.getMonth() + 1).padStart(2, '0'),
          d: String(date.getDate()).padStart(2, '0'),
        };
      }
      return { y: '', m: '', d: '' };
    }

    // Date 객체인 경우
    if (val instanceof Date) {
      return {
        y: String(val.getFullYear()),
        m: String(val.getMonth() + 1).padStart(2, '0'),
        d: String(val.getDate()).padStart(2, '0'),
      };
    }

    return { y: '', m: '', d: '' };
  };

  // 2. 현재 상태 (입력 중인 값)
  // 부모의 value가 바뀌면 이 값들도 업데이트되어야 하므로 useEffect 사용 필요
  // 하지만 여기서는 간단하게 렌더링 시마다 계산된 값을 input value로 쓰고,
  // 입력 시 onChange를 호출하는 방식으로 처리합니다.

  // 입력 편의성을 위해 로컬 state를 둡니다. (사용자가 '2'만 쳤을 때 부모에게 바로 반영하기 위해)
  const { y, m, d } = parseDate(value);

  // [중요] 개별 필드 변경 핸들러
  const handleInputChange = (
    type: 'year' | 'month' | 'day',
    inputValue: string,
  ) => {
    // 숫자만 허용
    const numValue = inputValue.replace(/[^0-9]/g, '');

    // 길이 제한
    if (type === 'year' && numValue.length > 4) return;
    if ((type === 'month' || type === 'day') && numValue.length > 2) return;

    // 새로운 날짜 조합
    const newY = type === 'year' ? numValue : y;
    const newM = type === 'month' ? numValue : m;
    const newD = type === 'day' ? numValue : d;

    // [박소민] TODO: 유효한 날짜인지 검증 후 리팩토링

    onChange(`${newY}-${newM}-${newD}`);
  };

  return (
    <div className='flex w-full flex-col items-start justify-start gap-3'>
      <div className='inline-flex items-center justify-start gap-0.5 self-stretch'>
        <div className='text-lg leading-7 font-bold text-gray-950'>{label}</div>
      </div>

      <div className='flex w-full items-start justify-between gap-2'>
        <div className='flex h-12 min-w-0 flex-1 items-center rounded-2xl bg-gray-50 px-3'>
          <input
            type='text'
            placeholder='YYYY'
            value={y}
            onChange={(e) => handleInputChange('year', e.target.value)}
            className='min-w-0 flex-1 bg-transparent text-center text-sm leading-5 font-normal text-gray-950 placeholder:text-gray-400 focus:outline-none'
          />
          <div className='ml-1 shrink-0 text-base leading-6 font-medium whitespace-nowrap text-gray-950'>
            년
          </div>
        </div>

        <div className='flex h-12 min-w-0 flex-1 items-center rounded-2xl bg-gray-50 px-3'>
          <input
            type='text'
            placeholder='MM'
            value={m}
            onChange={(e) => handleInputChange('month', e.target.value)}
            className='min-w-0 flex-1 bg-transparent text-center text-sm leading-5 font-normal text-gray-950 placeholder:text-gray-400 focus:outline-none'
          />
          <div className='ml-1 shrink-0 text-base leading-6 font-medium whitespace-nowrap text-gray-950'>
            월
          </div>
        </div>

        <div className='flex h-12 min-w-0 flex-1 items-center rounded-2xl bg-gray-50 px-3'>
          <input
            type='text'
            placeholder='DD'
            value={d}
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
