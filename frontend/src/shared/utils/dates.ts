export const getDate = (date: string) => {
  if (!date) return;

  return date.slice(0, 10).replace(/-/g, '.');
};
