export const isSafeRedirect = (path: string | null): path is string => {
  if (!path) return false;
  return path.startsWith('/') && !path.startsWith('//');
};
