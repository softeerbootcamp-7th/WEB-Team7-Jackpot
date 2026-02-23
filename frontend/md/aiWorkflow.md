# AI-assisted Development Workflow — 자료 업로드 기능

요약: 이번 작업은 자료 업로드(Presigned URL 발급 → S3 업로드) 기능을 단계별로 설계·구현하고 문서화한 작업입니다. 작업은 `feat/#441-upload_service` 브랜치에서 진행했습니다.

## 브랜치

- feat/#441-upload_service

## 주요 커밋 (단계별)

- `959184dd` — [feat] 1-1단계: upload.ts - 파일 업로드 타입 정의
  - `FileState`, `PresignedUrlRequest`, `PresignedUrlResponse`, `StartLabelingRequest` 추가

- `d3dd3d37` — [feat] 1-2단계: uploadApi.ts - presigned URL 및 S3 업로드 API 함수
  - `requestPresignedUrl()` 및 `uploadFileToS3()` 구현

- `61158a66` — [refactor] 2단계: UploadFileArea - FileState 상태 구조 변경 및 presigned URL 순차 업로드
  - 컴포넌트 상태를 `FileState[]`로 변경
  - `handlePresignedUrlAndUpload()` 추가 (순차 요청, uploadInProgressRef로 중복 방지)

- `43ccfb10` — [feat] 3단계: AddFileItem - 드래그 드롭 기능 구현
  - `handleDragOver`, `handleDragLeave`, `handleDrop`, `isDragOver` 상태 및 UI 피드백

- `c3e045cd` — [docs] 자료 업로드 API 연결 문서 작성 및 개발 계획 정의
  - 상세 개발 계획(6단계) 및 테스트 포인트 문서화

## 변경된 주요 파일

- frontend/src/features/upload/types/upload.ts
- frontend/src/features/upload/api/uploadApi.ts
- frontend/src/features/upload/components/UploadFileArea.tsx
- frontend/src/features/upload/components/AddFileItem.tsx
- frontend/md/자료 업로드 API 연결 (바이브 코딩) 30c148... .md

## 로컬에서 재현하는 방법

1. 브랜치 체크아웃

```bash
git fetch origin
git checkout feat/#441-upload_service
```

2. 개발 서버 실행

```bash
cd frontend
pnpm install
pnpm dev
```

3. 변경 사항 확인

```bash
git log --oneline --decorate --graph -n 10
git status
```

## 테스트 & 검증 포인트

- 파일 선택/드래그 → presigned URL 요청 → S3 업로드 순서가 정상 동작하는지 확인
- 업로드 중 UI(스피너) 표시 여부 확인
- 업로드 실패 시 `업로드 실패` 상태 노출 및 X 버튼으로만 삭제 가능한지 확인
- AI 라벨링 버튼 활성/비활성화 로직 (다음 단계)

## PR 작성 시 권장 체크리스트

- [ ] Types 정의가 API 명세와 일치하는지 확인
- [ ] presigned 요청 body에 `clientFileId`가 BigInt/String 규격으로 전송되는지 확인
- [ ] S3 PUT 요청에 `requiredHeaders`가 적용되는지 확인
- [ ] 드래그 & 드롭 UX가 모든 브라우저에서 정상 동작하는지 크로스체크
- [ ] 문서(frontend/md/)가 최신 상태인지 확인

## 다음 작업(권장 우선순위)

1. AI 라벨링 버튼 활성화 로직 구현 (상위 컴포넌트: UploadInputSection)
2. `tanstack query`로 AI 라벨링 시작 API 연결 (mutation) 및 에러/성공 처리
3. E2E / 통합 테스트 플로우 작성 (파일 업로드 → 라벨링 요청)
4. PR 생성 및 코드리뷰 요청 (리뷰어: using2, Sminp)

## 협업 및 기록

- 공동 작업자: using2 (강유진), Sminp (박소민)
- 관련 이슈: #441

---

파일 위치: `frontend/md/aiWorkflow.md`

필요하면 이 문서를 확장하여 각 커밋의 변경 diff, 코드 스니펫, 또는 PR 템플릿을 추가해드리겠습니다.
