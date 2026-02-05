export const getDate = (date: string) => {
  if (!date) return;

  return date.slice(0, 10).replace(/-/g, '.');
};

export const getKoreanDate = (datetime: string) => {
  if (!datetime) return '';

  const date = new Date(datetime);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${month}월 ${day}일`;
};

export const getKoreanTime = (datetime: string) => {
  if (!datetime) return '';

  const date = new Date(datetime);
  let hours = date.getHours();
  const minutes = date.getMinutes();

  const period = hours >= 12 ? '오후' : '오전';

  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }

  return `${period} ${hours}시 ${minutes}분`;
};
