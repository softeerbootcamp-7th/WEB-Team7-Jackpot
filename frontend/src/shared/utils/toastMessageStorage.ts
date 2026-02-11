const STORAGE_KEY = 'TOAST_MESSAGE';

interface StoredToastMessageType {
  message: string;
  status: boolean;
}


export const getStoredToastMessage = (): StoredToastMessageType | null => {
  const toastMessage = sessionStorage.getItem(STORAGE_KEY);

  if (!toastMessage) {
    return null;
  }

  try {
    const parse = JSON.parse(toastMessage);
    return parse;
  } catch (e) {
    console.error('토스트 메시지 파싱 에러', e);
    return null;
  } finally {
    sessionStorage.removeItem(STORAGE_KEY);
  }
};

export const setStoredToastMessage = ({
  message,
  status,
}: StoredToastMessageType) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ message, status }));
};
