const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://api.narratix.site';

export async function httpClient<T>(
  path: string,
  config?: RequestInit,
): Promise<T> {
  // const token = localStorage.getItem('accessToken');
  const token =
    'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJxd2VycXdlcjEiLCJpYXQiOjE3NzA4NTkyMzYsImV4cCI6MTc3MDg1OTgzNn0.NYXUlJVbS_3b1oyVICZeAL0M6F1t5nlSv1pZYc40eCo';

  if (!token) {
    throw new Error('Access Denied');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',

    ...config,

    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    ...config?.headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  return response.json();
}
