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

  // 데이터 chunk 처리 누락을 방지하기 위한 임시 버퍼
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();

      // 읽을 데이터가 없으면 while 루프 탈출
      if (done) {
        console.log('서버가 연결을 종료함 (done: true)');
        break;
      }

      // 깨지지 않도록 디코딩
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // 메시지 끝인지 엔터 두번의 여부로 확인
      const parts = buffer.split('\n\n');

      buffer = parts.pop() || '';

      // SSE 데이터 파싱 로직
      parts.forEach((part) => {
        const lines = part.split('\n');
        const dataLine = lines.find((line) => line.startsWith('data: '));

        if (dataLine) {
          const jsonStr = dataLine.replace('data: ', '').trim();
          // 종료 신호 무시
          if (jsonStr === '[DONE]') return;

          try {
            const data = JSON.parse(jsonStr) as T;
            onMessage(data);
          } catch (error) {
            console.error('JSON 파싱 에러:', error, '원본 데이터:', jsonStr);
          }
        }
      });
    }
  } catch (err) {
    console.error('스트림 읽기 중 에러:', err);
    // 에러를 상위로 던져서 재연결 로직이 작동하게 함
    throw err;
  } finally {
    // 스트림 locking
    reader.releaseLock();
  }
};
