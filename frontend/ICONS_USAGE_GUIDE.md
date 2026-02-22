# Icons Usage Guide

이 가이드는 프로젝트의 icons 사용 방식을 설명합니다.

## 개요

icons는 다음 두 가지 방식으로 import할 수 있습니다:

- **네임스페이스 import** (권장): tree-shaking이 가능한 방식
- **기존 호환성 방식**: 기존 코드와의 호환성을 위한 방식

## shared/icons 사용법

### 1. 네임스페이스 Wildcard Import (Tree-Shaking 가능) ✅ 권장

```tsx
import * as SI from '@/shared/icons';

export default function MyComponent() {
  return (
    <div>
      <SI.SearchIcon />
      <SI.AlertIcon />
      <SI.DeleteIcon />
    </div>
  );
}
```

**장점:**

- Tree-shaking이 자동으로 작동
- 사용하지 않는 icon은 번들에서 제거됨
- 명확한 네임스페이스

### 2. 개별 Import

```tsx
import { SearchIcon, AlertIcon, DeleteIcon } from '@/shared/icons';

export default function MyComponent() {
  return (
    <div>
      <SearchIcon />
      <AlertIcon />
      <DeleteIcon />
    </div>
  );
}
```

**장점:**

- 매우 명확한 dependency 명시
- Tree-shaking 지원

### 3. 기존 네임스페이스 방식 (호환성)

```tsx
import { SharedIcons as SI } from '@/shared/icons';

export default function MyComponent() {
  return (
    <div>
      <SI.SearchIcon />
      <SI.AlertIcon />
      <SI.DeleteIcon />
    </div>
  );
}
```

**주의:**

- const로 선언되어 있어 tree-shaking이 완벽하게 작동하지 않을 수 있음
- 기존 코드와의 호환성을 위해 지원

## Features Icons 사용법

각 feature 도메인의 icons도 동일한 방식을 지원합니다.

### Upload Icons

```tsx
// 방식 1: Wildcard import (권장)
import * as UI from '@/features/upload/icons';

export default function UploadComponent() {
  return (
    <div>
      <UI.UploadIcon />
      <UI.AILabelingIcon />
      <UI.LoadingSpinnerIcon />
    </div>
  );
}
```

```tsx
// 방식 2: 개별 import
import {
  UploadIcon,
  AILabelingIcon,
  LoadingSpinnerIcon,
} from '@/features/upload/icons';

export default function UploadComponent() {
  return (
    <div>
      <UploadIcon />
      <AILabelingIcon />
      <LoadingSpinnerIcon />
    </div>
  );
}
```

```tsx
// 방식 3: 기존 네임스페이스 (호환성)
import { UploadPageIcons as UI } from '@/features/upload/icons';

export default function UploadComponent() {
  return (
    <div>
      <UI.UploadIcon />
      <UI.AILabelingIcon />
      <UI.LoadingSpinnerIcon />
    </div>
  );
}
```

### CoverLetter Icons

```tsx
import * as CI from '@/features/coverLetter/icons';

export default function CoverLetterComponent() {
  return (
    <div>
      <CI.CoverLetterIcon />
      <CI.NewCoverLetterIcon />
      <CI.ChevronDownIcon />
    </div>
  );
}
```

### Recruit Icons

```tsx
import * as RI from '@/features/recruit/icons';

export default function RecruitComponent() {
  return (
    <div>
      <RI.DateIcon />
      <RI.EditIcon />
      <RI.NewRecruitIcon />
    </div>
  );
}
```

### Library Icons

```tsx
import * as LI from '@/features/library/icons';

export default function LibraryComponent() {
  return (
    <div>
      <LI.ChevronLeftIcon />
      <LI.SearchIcon />
      <LI.EditIcon />
    </div>
  );
}
```

### 기타 Icons

- **Auth**: `import * as AI from '@/features/auth/icons';`
- **Home**: `import * as HI from '@/features/home/icons';`
- **Notification**: `import * as NI from '@/features/notification/icons';`
- **Review**: `import * as RI from '@/features/review/icons';`
- **Landing**: `import * as LI from '@/features/landing/icons';`

## 마이그레이션 팁

기존 코드를 새로운 방식으로 마이그레이션하려면:

### Before (기존 방식)

```tsx
import { SharedIcons as SI } from '@/shared/icons';

<SI.SearchIcon />
<SI.AlertIcon />
```

### After (새 방식)

```tsx
import * as SI from '@/shared/icons';

<SI.SearchIcon />
<SI.AlertIcon />
```

> **주의**: 코드는 동일하지만, wildcard import 방식이 더 나은 tree-shaking 성능을 제공합니다.

## Tree-Shaking 효과

### 권장 순서 (Tree-shaking 효율성)

1. ✅ `import * as SI from '@/shared/icons'` - 완벽한 tree-shaking
2. ✅ `import { SearchIcon, AlertIcon } from '@/shared/icons'` - 완벽한 tree-shaking
3. ⚠️ `import { SharedIcons as SI } from '@/shared/icons'` - tree-shaking 미보장

## 사용 가능한 Icons

### shared/icons

- `AlertIcon`
- `DeleteIcon`
- `DropdownArrow`
- `MoreVertIcon`
- `NotFoundIllustration`
- `PaginationIcon`
- `PaperChipIcon`
- `PenToolIcon`
- `PlusIcon`
- `ReviewMessageIcon`
- `RightArrow`
- `SaveCheckIcon`
- `SearchIcon`
- `TitleLogo`
- `UserAvatarIcon`
- `WritingCoverLetterIcon`

각 feature의 icons는 해당 feature의 `icons/` 디렉토리를 참고하세요.
