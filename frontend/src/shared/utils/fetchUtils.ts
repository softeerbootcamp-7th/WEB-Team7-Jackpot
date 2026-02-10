export async function parseErrorResponse(response: Response): Promise<never> {
  let message: string;

  try {
    const error = await response.json();
    message = error.message || `HTTP ${response.status}`;
  } catch {
    const text = await response.text().catch(() => '');
    message = text || `HTTP ${response.status}`;
  }

  throw new Error(message);
}
