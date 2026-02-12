const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function httpClient<T>(
  path: string,
  config?: RequestInit,
): Promise<T> {
  // const token = localStorage.getItem('accessToken');
  const token = 'Bearer ' + localStorage.getItem('accessToken');

  if (!token) {
    throw new Error('Access Denied');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',

    ...config,

    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      ...config?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  return response.json();
}
