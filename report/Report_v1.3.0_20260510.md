# 작업 보고서

## 기본 정보
- **버전**: v1.3.0-20260510
- **작업 일시**: 2026-05-10
- **이전 버전**: v1.2.0-20260510
- **프로젝트명**: Castfolio (루트 `src/`)

## 작업 요약
기존 이미지 편집기(X/Y/영역 슬라이더 + 숫자 입력 + 적용 버튼 방식)가 직관적이지 않다는 사용자 피드백을 반영.
캔버스 기반 비주얼 크롭 에디터(`ImageCropEditor`)를 신규 컴포넌트로 제작하고, 크리에이트 위저드와 대시보드 빌더 모두에 적용.
드래그 앤 드롭 업로드, 마우스 핸들 크롭, 3등분 가이드라인을 제공하는 UI로 교체.

## 변경 사항

### 추가된 기능
- `src/components/ui/ImageCropEditor.tsx` 신규 (177라인)
  - **드래그 앤 드롭 업로드**: 업로드 존에 이미지를 끌어다 놓거나 클릭으로 파일 선택
  - **캔버스 비주얼 크롭 에디터**:
    - 이미지 위 8개 핸들(모서리 4 + 가장자리 4)을 드래그하여 크롭 영역 크기 조정
    - 크롭 사각형 내부를 드래그하여 위치 이동
    - 핸들 호버 시 방향에 맞는 커서(nw-resize, n-resize 등) 자동 표시
    - 3등분 가이드라인(rule of thirds) 오버레이 표시
    - 비선택 영역 반투명 다크 오버레이 처리
  - **자르기 적용** 버튼: 크롭 결과를 `outputWidth × outputHeight` JPEG으로 출력
  - **교체** 버튼: 다른 이미지로 초기화
  - **적용된 이미지 미리보기**: 하단에 현재 저장된 이미지 표시
  - `outputWidth`, `outputHeight` prop으로 출력 해상도 커스터마이즈 가능
- 대시보드 빌더 히어로/프로필 섹션에 이미지 업로드 기능 추가 (기존에는 없었음)

### 수정된 사항
- `src/app/(marketing)/create/page.tsx`
  - 구형 `ImageEditor` 함수 제거
  - `ImageCropEditor` import 추가
  - 히어로 이미지: `ImageCropEditor` (900×600)
  - 프로필 이미지: `ImageCropEditor` (400×400, 정방형)
  - 경력 이미지: `ImageCropEditor` (900×600)
  - 포트폴리오 이미지: `ImageCropEditor` (900×600)
  - lucide import에서 `Crop`, `Image as ImageIcon` 제거 (미사용)
- `src/app/dashboard/builder/[projectId]/page.tsx`
  - `ImageCropEditor` import 추가
  - 히어로 섹션 에디터에 `ImageCropEditor` (900×600) 추가
  - 프로필 섹션 에디터에 `ImageCropEditor` (400×400) 추가
- `src/lib/version.ts`: 1.2.0-20260510 → 1.3.0-20260510

### 삭제/제거된 사항
- `create/page.tsx` 내 `ImageEditor` 함수 (슬라이더 기반 구형 UI)

## 설계 결정

| 항목 | 선택 | 이유 |
|------|------|------|
| 외부 크롭 라이브러리 | 미사용 (직접 구현) | 추가 의존성 없이 동일 UX 구현 가능, 번들 크기 최소화 |
| 드래그 상태 관리 | `useRef` (useState 아님) | mousemove 매 프레임 state 업데이트 시 렌더링 병목 방지 |
| 이미지 로딩 | `useEffect([rawDataUrl])` | canvas가 DOM에 마운트된 후 이미지 로드 보장 |
| 캔버스 크기 | 너비 360px 고정, 높이 이미지 비율에 따라 최대 260px | 패널 너비 내 최대 편집 공간 확보 |

## 변경된 주요 파일
| 파일 경로 | 변경 유형 | 설명 |
|----------|---------|------|
| `src/components/ui/ImageCropEditor.tsx` | 신규 | 비주얼 크롭 에디터 컴포넌트 |
| `src/app/(marketing)/create/page.tsx` | 수정 | ImageEditor → ImageCropEditor 교체 |
| `src/app/dashboard/builder/[projectId]/page.tsx` | 수정 | 히어로/프로필 이미지 업로드 추가 |
| `src/lib/version.ts` | 수정 | 버전 업데이트 |

## 알려진 이슈 / 추후 작업
- 터치 디바이스(태블릿/모바일) 터치 이벤트 미지원 — `onTouchStart/Move/End` 추가 권장
- 포트폴리오 이미지 추가 후 에디터 자동 초기화 미지원 (현재 수동으로 "교체" 버튼 클릭 필요)
- (이전 MEDIUM) Hero 슬라이드쇼 `setInterval` 탭 비가시 상태 처리 — `document.visibilityState` 권장
- (이전 LOW) 나눔명조/나눔고딕 Google Fonts 미적용
- (이전 LOW) Type1 NavBar `talentName` hidden span 데드코드 정리

## 버전 히스토리 요약
| 버전 | 날짜 | 주요 변경 |
|------|------|---------|
| v1.3.0 | 2026-05-10 | 비주얼 크롭 에디터 + 드래그 앤 드롭 업로드 |
| v1.2.0 | 2026-05-10 | Type.1 Warm Pink + Type.2 Sky Blue 레이아웃 (루트 src 실제 운영 반영) |
| v1.1.1 | 2026-05-08 | 이전 버전 (5개 테마만 노출) |
