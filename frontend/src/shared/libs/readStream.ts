export const readStream = async <T = unknown>(
  response: Response,
  onMessage: (data: T) => void,
) => {
  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        console.log('SSE 스트림 정상 종료');
        break;
      }

      const chunk = decoder.decode(value, { stream: true });

      buffer += chunk;

      // 줄바꿈 기준으로 청크 분리 (\n\n 또는 \r\n\r\n)
      const parts = buffer.split(/\r\n\r\n|\n\n/);

      // 마지막 조각은 덜 들어온 데이터일 수 있으므로 남겨둠
      buffer = parts.pop() || '';

      parts.forEach((part) => {
        const lines = part.split(/\r\n|\n/);

        let jsonStr = '';
        let isHeartbeat = false;

        lines.forEach((line) => {
          const trimmedLine = line.trim();

          // Comment (Ping) 처리
          if (trimmedLine.startsWith(':')) {
            isHeartbeat = true;
            return;
          }

          // Data 처리
          if (line.startsWith('data:')) {
            // "data:" 제거
            const dataContent = line.replace(/^data:/, '');
            // 내부 데이터 공백을 제외한 앞뒤 공백 제거
            jsonStr += dataContent.trim();
          }
        });

        // 핑이면 파싱 로직 건너뜀
        if (isHeartbeat) return;
        // 데이터 없으면 건너뜀
        if (!jsonStr) return;
        if (jsonStr === '[DONE]') return;

        try {
          // 백엔드가 'SSE connected...' 같은 단순 문자열을 보낼 때를 대비
          if (jsonStr.startsWith('{') || jsonStr.startsWith('[')) {
            const data = JSON.parse(jsonStr) as T;
            onMessage(data);
          } else {
            console.log('텍스트 메시지 수신:', jsonStr);
          }
        } catch (error) {
          console.error('JSON 파싱 실패:', error, '원본:', jsonStr);
        }
      });
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.log('스트림 읽기 중단됨 (Abort)');
    } else {
      console.error('스트림 읽기 에러:', err);
      throw err;
    }
  } finally {
    reader.releaseLock();
  }
};
