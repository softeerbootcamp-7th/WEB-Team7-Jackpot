/**
 * Date 객체를 복제하여 반환 (불변성 유지용)
 */
const cloneDate = (date: Date): Date => new Date(date.getTime());

/**
 * 날짜를 YYYY-MM-DD 형태의 문자열로 변환 (로컬 타임존 기준)
 * 기존 toISOString()의 타임존 오차 버그 수정
 */
export const getISODate = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  // 브라우저가 실행되는 로컬 환경(KST) 기준으로 날짜를 가져옵니다.
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * 오늘 날짜를 YYYY-MM-DD 문자열로 반환
 */
export const getTodayISODate = (): string => getISODate(new Date());

/**
 * YYYY.MM.DD 형태로 변환 (getISODate 재사용)
 */
export const getDate = (date: Date | string): string => {
  const isoDate = getISODate(date);
  return isoDate ? isoDate.replace(/-/g, '.') : '';
};

/**
 * YYYY/MM/DD 형태로 변환 (getISODate 재사용)
 */
export const getLinkDate = (date: Date | string): string => {
  const isoDate = getISODate(date);
  return isoDate ? isoDate.replace(/-/g, '/') : '';
};

/**
 * 두 날짜가 같은 날인지 확인
 * 기존: 연/월/일 각각 비교 -> 개선: ISO 문자열 비교 (더 빠르고 정확함)
 */
export const isSameDay = (dateLeft: Date, dateRight: Date): boolean => {
  return getISODate(dateLeft) === getISODate(dateRight);
};

/**
 * targetDate가 baseDate보다 과거인지 확인 (Time 무시)
 */
export const isBeforeDay = (targetDate: Date, baseDate: Date): boolean => {
  // 문자열 비교가 가장 안전함 (타임존/시간 계산 실수 방지)
  return getISODate(targetDate) < getISODate(baseDate);
};

// 포맷터 인스턴스를 외부에 선언하여 불필요한 재생성 방지
const koreanDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
});

const koreanTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true, // 오후/오전 자동 처리
});

const yearMonthFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
});

/**
 * "M월 D일" 포맷
 */
export const getKoreanDate = (datetime: string | Date): string => {
  if (!datetime) return '';
  const date = typeof datetime === 'string' ? new Date(datetime) : datetime;
  if (isNaN(date.getTime())) return '';

  return koreanDateFormatter.format(date); // 예: "2월 16일"
};

/**
 * "오전/오후 H시 mm분" 포맷
 * 복잡한 if문 로직 제거하고 Intl 사용
 */
export const getKoreanTime = (datetime: string | Date): string => {
  if (!datetime) return '';
  const date = typeof datetime === 'string' ? new Date(datetime) : datetime;
  if (isNaN(date.getTime())) return '';

  return koreanTimeFormatter.format(date); // 예: "오후 10:10" (브라우저 설정에 따라 "10시 10분" 등으로 나옴)
};

export const formatYearMonth = (date: Date) => yearMonthFormatter.format(date);

export const addMonths = (date: Date, amount = 1): Date => {
  const newDate = cloneDate(date);
  const originalDay = newDate.getDate();

  newDate.setMonth(newDate.getMonth() + amount);

  // 월말 오버플로우 처리 (예: 1/31 -> 2/28)
  if (newDate.getDate() !== originalDay) {
    newDate.setDate(0);
  }
  return newDate;
};

export const subMonths = (date: Date, amount = 1): Date =>
  addMonths(date, -amount);

export const addWeeks = (date: Date, amount = 1): Date => {
  const newDate = cloneDate(date);
  newDate.setDate(newDate.getDate() + amount * 7);
  return newDate;
};

export const subWeeks = (date: Date, amount = 1): Date =>
  addWeeks(date, -amount);

export const startOfMonth = (date: Date): Date => {
  const newDate = cloneDate(date);
  newDate.setDate(1);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const endOfMonth = (date: Date): Date => {
  const newDate = cloneDate(date);
  newDate.setMonth(newDate.getMonth() + 1);
  newDate.setDate(0);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

export const startOfWeek = (date: Date): Date => {
  const newDate = cloneDate(date);
  const day = newDate.getDay(); // 0(일) ~ 6(토)
  const diff = newDate.getDate() - day;
  newDate.setDate(diff);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const endOfWeek = (date: Date): Date => {
  const newDate = startOfWeek(date);
  newDate.setDate(newDate.getDate() + 6);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

export const eachDayOfInterval = ({
  start,
  end,
}: {
  start: Date;
  end: Date;
}): Date[] => {
  const days: Date[] = [];
  const current = startOfWeek(start); // 시작일이 포함된 주의 일요일부터 시작
  const endTime = end.getTime();

  // 무한 루프 방지를 위해 안전장치(1년 제한 등)를 두는 것도 좋으나, 여기선 기본 로직 유지
  while (current.getTime() <= endTime) {
    days.push(cloneDate(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

// generateDateGrid는 eachDayOfInterval과 완전히 동일하므로 제거하거나 래핑만 유지
export const generateDateGrid = (startDate: Date, endDate: Date) =>
  eachDayOfInterval({ start: startDate, end: endDate });

export const getMonthRange = (currentDate: Date) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  return {
    startDate: startOfWeek(monthStart),
    endDate: endOfWeek(monthEnd),
  };
};

export const getThreeWeekRange = (baseDate: Date) => {
  return {
    startDate: startOfWeek(subWeeks(baseDate, 1)),
    endDate: endOfWeek(addWeeks(baseDate, 1)),
  };
};

export const createRecruitPath = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `/recruit/${year}/${month}`;
};

export const generateYearList = (year: number) => {
  // Array.from을 사용하여 더 깔끔하게 생성
  return Array.from({ length: 100 }, (_, i) => year - i);
};

/**
 * 목표 날짜까지 남은 D-Day를 계산합니다.
 * getISODate를 활용해 시분초 및 타임존 오차를 완전히 제거한 순수 날짜로 비교합니다.
 */
export const getDDay = (targetDate: string | Date): number => {
  if (!targetDate) return 0;

  // "YYYY-MM-DD" 문자열을 다시 Date 객체로 만들어 시분초 00:00:00 UTC 상태로 통일
  // (양쪽 모두 UTC 자정이므로 차이는 정확히 정수 일(day) 단위가 됨)
  const today = new Date(getTodayISODate());

  const targetISO = getISODate(targetDate);
  if (!targetISO) return 0; // invalid Date 또는 빈 문자열 처리
  const target = new Date(targetISO);

  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 마감일을 입력할 때 "2024-02-30"과 같은 논리적으로 존재하지 않는 날짜를 방지하기 위한 유틸 함수
// 1. 파싱 헬퍼 함수
export const parseDate = (val?: string | Date) => {
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

// 2. 특정 연도와 월의 최대 일수를 구하는 함수 (윤년 완벽 처리)
export const getDaysInMonth = (year: string, month: string): number => {
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);

  // 연도나 월이 아직 다 입력되지 않았다면 기본 최대일인 31 반환
  if (isNaN(y) || isNaN(m)) return 31;

  // 자바스크립트 Date 객체의 특징 활용: 일(Day) 자리에 0을 넣으면 이전 달의 마지막 날을 반환함
  return new Date(y, m, 0).getDate();
};

// 3. 2월 31일과 같은 논리적 오류를 잡아내는 최종 검증 함수
export const isValidDate = (
  year: string,
  month: string,
  day: string,
): boolean => {
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);

  if (isNaN(y) || isNaN(m) || isNaN(d)) return false;

  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
};
