# Castfolio Layout Spec — Curated Atelier

## 목적

`stitch_castfolio01(9).zip`에 포함된 Stitch 디자인을 Castfolio의 새 기본 레이아웃으로 추가하기 위한 기준 문서다.

이 레이아웃은 기존 프로그램의 기능과 데이터 구조를 유지한 채, 공개 PR 페이지와 빌더 미리보기의 시각적 레이아웃만 확장하는 것을 목표로 한다.

- 소스 디자인: `stitch_castfolio01(9).zip`
- 참고 파일:
  - `DESIGN.md`
  - `code.html`
  - `screen.png`
- 제안 레이아웃 ID: `curated-atelier`
- 제안 한글명: `큐레이티드 아틀리에`

---

## 핵심 원칙

### 유지해야 하는 것

- 기존 `PageContent` 데이터 스키마는 그대로 유지한다.
- 기존 섹션 구조 `hero / profile / career / portfolio / strength / contact / footer`는 유지한다.
- CTA 동작은 그대로 유지한다.
  - `ctaPrimary.action = contact` -> `#contact`
  - `ctaSecondary.action = portfolio` -> `#portfolio`
- `sectionOrder`, `disabledSections`, 다국어 콘텐츠, 공개 URL 구조 등 현재 프로그램의 기본 동작은 바꾸지 않는다.
- 포트폴리오 링크, 연락처 채널, 공개 페이지 공개 여부 등 기존 기능은 디자인 때문에 축소되면 안 된다.

### 바뀌는 것

- 전체 톤을 다크 기반 PR 페이지에서 웜 크림 기반의 럭셔리 에디토리얼 스타일로 전환한다.
- 레이아웃 밀도는 낮추고, 여백과 타이포그래피 중심의 인상을 만든다.
- 카드/섹션 구분은 진한 보더보다 톤 차이, 여백, 오버랩으로 표현한다.

---

## 디자인 정체성

### 키워드

- editorial
- luxury personal brand
- warm cream
- deep burgundy
- serif contrast
- asymmetry
- quiet premium

### 색상 토큰

`code.html`과 `DESIGN.md` 기준 권장 토큰:

- Background: `#fdf9f4`
- Primary: `#460609`
- Secondary: `#745853`
- Text: `#1c1c19`
- Text muted: `#554241`
- Surface low: `#f7f3ee`
- Surface high: `#ebe8e3`
- Outline variant: `#dac1bf`
- Accent note: `#e2c19b`

### 타이포그래피

- Headline / Display: `Noto Serif`
- Body / Label: `Work Sans`

### 모션 톤

- 빠르고 가벼운 인터랙션보다 느리고 의도적인 움직임
- hover scale은 최대 `1.02`
- 전환 시간은 대체로 `400ms` 전후

---

## 현재 프로그램과의 연결 방식

이 레이아웃은 새 기능을 만드는 작업이 아니라, **기존 기능을 담는 새 외형**이다.

적용 대상:

- 공개 페이지 `/p/[slug]`
- 빌더 내부 미리보기
- 테마 선택 카드/테마 갤러리의 대표 미리보기

비적용 대상:

- 대시보드 셸
- 인테이크 폼
- 견적/주문/정산 UI

---

## 섹션 매핑

## 1. Top Navigation

상단에 고정형 내비게이션 바를 둔다.

- 좌측: 인물명 또는 브랜드명
- 우측: `Profile`, `Career`, `Portfolio`, `Contact`, `Work with Me`
- 배경: 반투명 배경 + `backdrop-blur`
- 모바일에서는 단순화하거나 CTA만 남겨도 되지만, 앵커 이동 기능은 유지한다.

동작 규칙:

- 숨겨진 섹션은 내비게이션에서도 제외한다.
- 섹션 순서가 바뀌면 내비게이션 앵커 순서도 그에 맞춘다.

## 2. Hero

가장 중요한 차별점이 들어가는 구간이다.

- 중앙 정렬
- 세로형 포트레이트 카드 1장
- 카드 바깥에 원형 메모/스탬프처럼 보이는 작은 오버랩 요소
- 매우 큰 serif 이름
- 포지션은 작은 uppercase 메타 텍스트
- 태그라인은 이탤릭 인용문
- CTA 2개는 pill 버튼

데이터 매핑:

- `hero.heroImageId`
  - 우선 사용
- `profile.profileImageId`
  - hero 이미지가 없을 때 대체 사용
- `hero.position`
  - 포지션 라인
- `hero.tagline`
  - 인용문
- `hero.ctaPrimary`
  - primary CTA
- `hero.ctaSecondary`
  - secondary CTA

이미지 폴백:

- 이미지가 없으면 이니셜 카드 또는 중성 배경의 플레이스홀더 프레임으로 대체한다.
- 레이아웃 자체가 무너지면 안 된다.

## 3. Profile

에디토리얼 헤더 라인과 긴 소개문으로 구성한다.

- 좌측에 섹션 타이틀
- 우측은 얇은 divider 라인
- 본문은 넓은 줄간격의 소개 문단
- 강점 태그는 soft chip 형태

데이터 매핑:

- `profile.intro`
  - 메인 소개문
- `profile.strengths`
  - 태그형 키워드
- `profile.infoItems`
  - 참고 디자인에는 직접 노출되지 않지만, 데이터 손실 방지를 위해 소개문 하단의 작은 editorial facts row 또는 2~3열 메타 블록으로 선택적으로 렌더링 가능

## 4. Career

직선적인 타임라인보다 고급스러운 에디토리얼 타임라인으로 표현한다.

- burgundy 또는 muted line 사용
- 왼쪽 점과 얇은 라인
- 기간은 작은 라벨
- 제목은 serif
- 설명은 가벼운 sans

데이터 매핑:

- `career.items[].period`
- `career.items[].title`
- `career.items[].description`

## 5. Portfolio

참고 디자인은 썸네일이 보이는 2열 카드형 레이아웃이다.

- 카드 배경은 `surface-container-low`
- 이미지 썸네일
- 타이틀
- 작은 메타 설명
- 우측 상단 또는 끝쪽에 open icon

데이터 매핑:

- `portfolio.videos`
  - 우선순위가 가장 높다
- `portfolio.photos`
  - video가 부족할 경우 카드로 보완
- `portfolio.audioSamples`
  - 이 레이아웃에서도 누락하지 말고 별도 카드 또는 보조 리스트로 표현 가능

동작 규칙:

- 외부 링크는 새 탭으로 연다.
- 썸네일 데이터가 없으면 추상 배경 또는 포스터형 플레이스홀더를 사용한다.

## 6. Strength

3열 카드형이지만 SaaS 카드처럼 보이면 안 된다.

- 중앙 정렬
- 얇은 경계 또는 약한 톤 차이
- 충분한 여백
- 아이콘은 상징처럼 작동

데이터 매핑:

- `strength.cards[].icon`
- `strength.cards[].title`
- `strength.cards[].description`

## 7. Contact

이 레이아웃의 핵심 비대칭 포인트다.

- 1개의 강조 카드 + 보조 카드들로 구성
- 이메일 또는 가장 중요한 채널 1개를 메인 카드로 보여준다
- 나머지 채널은 작은 타일로 배치한다

추천 규칙:

- 우선순위: `email > kakao > phone > instagram > youtube > tiktok > blog > other`
- 첫 번째 우선 채널은 넓은 대표 카드
- 나머지 채널은 2열 혹은 3열 보조 카드

데이터 매핑:

- `contact.channels[]`

중요:

- 참고 디자인에는 일부 채널만 보이지만, 현재 프로그램이 지원하는 타입은 모두 유지해야 한다.
- 타입이 늘어나도 카드 체계 안에서 자연스럽게 확장 가능해야 한다.

## 8. Footer

브랜드형 마감 구간이다.

- 상단 border 또는 매우 약한 구분선
- 인물명/브랜드명
- 보조 링크 2~3개는 선택적
- 하단에 `Powered by Castfolio`

주의:

- Footer는 공개 PR 페이지의 브랜딩을 유지하되, Castfolio 서명이 사라지면 안 된다.

---

## 기능 보존 체크리스트

새 레이아웃을 추가할 때 아래 항목은 그대로 살아 있어야 한다.

- 다국어 콘텐츠 렌더링
- 섹션 숨김/표시
- 섹션 순서 커스터마이징
- CTA 앵커 스크롤
- 포트폴리오 외부 링크
- 연락처 채널 전체 타입 지원
- 이미지가 없는 상태의 폴백 렌더링
- 모바일 대응
- 빌더 미리보기와 실 공개 페이지의 일관성

---

## `PageContent` 매핑 표

| 영역 | 필드 | 반영 방식 |
|---|---|---|
| Hero | `hero.position` | uppercase 메타 라인 |
| Hero | `hero.tagline` | serif 이탤릭 인용문 |
| Hero | `hero.heroImageId` | 메인 포트레이트 |
| Hero | `hero.ctaPrimary` | primary pill button |
| Hero | `hero.ctaSecondary` | outlined pill button |
| Profile | `profile.intro` | editorial body copy |
| Profile | `profile.strengths` | soft chips |
| Profile | `profile.infoItems` | 보조 메타 블록 |
| Career | `career.items` | vertical editorial timeline |
| Portfolio | `portfolio.videos` | 메인 portfolio cards |
| Portfolio | `portfolio.photos` | 비주얼 카드 보완 |
| Portfolio | `portfolio.audioSamples` | 보조 media cards |
| Strength | `strength.cards` | 3-column editorial cards |
| Contact | `contact.channels` | 대표 카드 + 보조 카드 |

---

## 제안 ThemeConfig

현재 프로젝트의 `src/types/theme.ts` 기준으로 정리한 추천값:

```ts
{
  id: "curated-atelier",
  name: "Curated Atelier",
  nameKo: "큐레이티드 아틀리에",
  description: "Warm editorial layout with serif-driven luxury presentation.",
  descriptionKo: "웜 크림 톤과 세리프 중심 구성이 돋보이는 에디토리얼 럭셔리 레이아웃",
  recommendedFor: "Experienced MCs, anchors, premium hosts, interviewers",
  colors: {
    primary: "#460609",
    secondary: "#745853",
    text: "#1c1c19",
    textLight: "#554241",
    accent: "#e2c19b",
    background: "#fdf9f4",
    backgroundAlt: "#f7f3ee",
    border: "#dac1bf",
    buttonBg: "#460609",
    buttonText: "#ffffff"
  },
  fonts: {
    headingKo: "Noto Serif",
    headingEn: "Noto Serif",
    bodyKo: "Work Sans",
    bodyEn: "Work Sans"
  },
  backgroundStyle: "texture",
  buttonStyle: "pill",
  animationTone: "elegant"
}
```

---

## 구현 메모

### 필수

- 새 레이아웃은 기존 7개에 추가되는 8번째 레이아웃으로 취급한다.
- 공개 페이지와 빌더 미리보기 모두 같은 레이아웃 로직을 사용해야 한다.
- `sectionOrder`를 무시한 하드코딩 순서 렌더링은 피한다.
- `disabledSections`가 적용된 경우 nav, 본문, footer 이전 흐름 모두 자연스럽게 비워져야 한다.

### 권장

- Hero portrait에 약한 회전값과 오버랩 메모 요소를 준다.
- 버튼 hover는 색상 변화보다 scale 중심으로 처리한다.
- 구분선은 얇고 희미하게, 전체적으로는 여백으로 섹션을 나눈다.

### 주의

- 일반적인 SaaS 카드 UI처럼 보이지 않도록 한다.
- pure black 배경/텍스트는 사용하지 않는다.
- 과도한 애니메이션은 금지한다.

---

## Stitch / AI 제작용 프롬프트

아래 프롬프트는 Google Stitch 또는 유사 디자인 생성 도구에서 이 레이아웃을 재생성하거나 변형할 때 사용할 수 있다.

```text
Create a luxury editorial single-page PR website for a Korean broadcaster.
Keep the existing Castfolio page structure and data model:
hero, profile, career, portfolio, strength, contact, footer.

Visual direction:
- warm cream background
- deep burgundy primary color
- serif-driven luxury editorial look
- asymmetrical hero image composition
- high-end personal brand, not SaaS

Typography:
- headlines in Noto Serif
- body text in Work Sans

Layout:
1. Fixed translucent top navigation with anchor links.
2. Hero with a portrait card, slight rotation, floating circular note element,
   oversized serif name, uppercase role line, italic quote, two pill CTA buttons.
3. Profile with editorial divider heading, long bio paragraph, soft keyword chips.
4. Career with elegant vertical timeline.
5. Portfolio with two-column thumbnail cards and open-link affordance.
6. Strength with three editorial cards.
7. Contact with one featured large contact card and smaller supporting contact tiles.
8. Branded footer with subtle utility links and Powered by Castfolio.

Behavior constraints:
- preserve all current data bindings
- preserve contact channel variety
- preserve conditional section visibility
- preserve mobile responsiveness
- preserve builder preview compatibility
```

---

## 결론

이 레이아웃은 현재 Castfolio의 기능 범위를 넓히지 않는다. 대신 같은 기능을 더 고급스럽고 차별화된 에디토리얼 톤으로 보여주는 **새 외형 규격**이다.

즉, 이번 문서의 목표는 다음 한 문장으로 정리된다.

**"기존 Castfolio 기능을 유지한 채, Stitch의 Curated Atelier 디자인을 8번째 PR 페이지 레이아웃으로 추가한다."**
