/**
 * Date 객체를 복제하여 반환 (불변성 유지용)
 */
const cloneDate = (date: Date): Date => new Date(date.getTime());

/**
 * 날짜를 YYYY-MM-DD 형태의 문자열로 변환 (Time 제외, 순수 날짜 비교용)
 */
export const getISODate = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

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
