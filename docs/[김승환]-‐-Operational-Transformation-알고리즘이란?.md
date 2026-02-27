# 📖 [Operational Transformation 알고리즘이란?]

## ✨ 한 줄 요약
> Operational Transformation 알고리즘은 여러 사용자가 동시에 동일한 문서를 편집할 때, 데이터의 일관성을 유지하기 위해 사용하는 동시성 제어 알고리즘입니다.

## Operational Transformation 알고리즘
OT는 입력한 순서에 따라 서버가 이를 적절히 변형하여 전달하는 방식입니다. OT 는 시간상의 순서를 고려해 우선 순위를 부여하고, 앞에서 적용할 변경사항이 다음 순위의 변경사항을 보정하는 정보로 사용됩니다.

Narratix에서는 문서가 실시간으로 Reviewer에게 보여져야 합니다. 하지만, 변경된 문서를 항상 Reviewer에게 전달한다면 서버의 부하가 너무 커질 수 있기에 문서 전체를 서버로 전송하는 것이 아니라, 작업(Operation) 단위로 전송합니다. 예를 들어, 시작 위치 3, 끝 위치 3 인덱스에 안녕하세요라는 글자 삽입이라는 작업을 전송하고, 이 변경분들을 모아 하나의 완성된 문서를 만드는 방식입니다.

이 때, 여러 사용자가 동시에 동일한 문서를 편집할 때, 데이터의 일관성을 유지하기 위해 사용하는 동시성 제어 알고리즘입니다. Google Docs와 같은 동시 편집 에디터의 핵심 기술입니다.

## Narratix에서의 Operational Transformation 알고리즘 구현
Narratix에서는 Operational Transformation 알고리즘을 구현하기 위해 Redis의 List를 사용했습니다.
변경분을 저장하기 위해 list를 사용하였고, 아직 DB에 Flush 되지 않은 Delta를 pending delta, DB에 Flush된 Delta를 committed delta로 관리하였고 pending delta에서 committed delta로 delta를 옮기고, Redis 버전을 올리는 작업까지 원자적으로 진행될 수 있도록 Lua Script를 사용했습니다.

그렇다면, OT 알고리즘은 버전을 어떻게 맞출 수 있을까요?
Narratix에서는 동시 편집 충돌이 발생하는 경우가 리뷰어가 댓글을 달 때 리뷰 마커가 생성되기 때문에 이 때 동시편집이 발생한다고 할 수 있습니다.

![이미지 2026  2  27  오전 12 51](https://github.com/user-attachments/assets/aa5c6ced-37c0-4e73-a88e-bfd2c9a32d25)

위 그림을 보시면, 버전 1부터 버전 4까지 문서의 변경분이 어떻게 변해가는지 그림으로 쉽게 알 수 있습니다. 이 때, 버전 1을 보고 있던 Reviewer가 "안녕"이라는 부분에 첨삭 댓글을 다는 Request를 보내면, 그림에 작성된 Flow로 OT Transform을 진행하고, validate를 통해 클라이언트가 현재 정합성이 맞는 버전으로 요청을 보낸 것인지 검증합니다.

Narratix는 이처럼 동시 편집이 발생하는 리뷰 작성의 로직에서 OT 알고리즘을 사용해 충돌을 제어하였습니다.