export const readStream = async <T = unknown>(
  // fetch로 응답 받은 객체
  response: Response,
  // 파싱에 성공할때마다 실행할 콜백 함수
  onMessage: (data: T) => void,
) => {
  // 본문이 없는 경우 읽지 않음
  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { value, done } = await reader.read();

      // 읽을 데이터가 없으면 while 루프 탈출
      if (done) break;

      // 깨지지 않도록 디코딩
      const chunk = decoder.decode(value, { stream: true });

      // SSE 데이터 파싱 로직
      // SSE 프로토콜에 맞게 메시지는 엔터 두 번으로 구분
      const lines = chunk.split('\n\n');
      lines.forEach((line) => {
        // data: 로 시작하는 메시지 내부의 JSON 문자열만 남김
        if (line.startsWith('data: ')) {
          const jsonStr = line.replace('data: ', '');
          try {
            const data = JSON.parse(jsonStr) as T;
            // 파싱 성공하면 콜백 실행
            onMessage(data);
          } catch (error) {
            console.error(error);
          }
        }
      });
    }
  } finally {
    // 스트림 locking
    reader.releaseLock();
  }
};
