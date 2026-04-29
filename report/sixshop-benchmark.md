# Sixshop Benchmark Analysis

수집 시점: 2026-04-29 KST  
대상: https://www.sixshop.com/

## 1. 접근 범위와 한계

이 문서는 공개적으로 접근 가능한 웹 페이지, HTML, CSS, JavaScript 번들, 공개 API 응답, 템플릿 데모 페이지의 `__NEXT_DATA__`를 기준으로 분석했다.

확인 가능한 범위:

- 공개 랜딩 페이지의 정보 구조, 섹션 구성, CTA, 내비게이션, 푸터
- 템플릿 목록 페이지의 카드 구조, 필터 구조, 가격/이벤트 표시 구조
- 블록 마켓플레이스의 공개 API, 카드 렌더링, 모달/iframe 프리뷰 구조
- 앱스토어의 공개 API, 카테고리, 카드/모달 구조
- 템플릿 데모 사이트의 Next.js 라우팅, 섹션 타입, 블록 타입, 스타일 데이터 구조
- 브라우저에 내려오는 minified JS/CSS 기준의 구현 방식

확인 불가능한 범위:

- 식스샵 내부 GitHub 저장소
- 운영 DB 원본
- 관리자 화면 내부 로직
- 비공개 API, 권한이 필요한 편집기 내부 데이터
- 결제/주문/회원 영역의 실제 운영 데이터

따라서 이 분석은 "합법적으로 보이는 공개 표면과 브라우저가 받은 코드" 기준의 코드 레벨 분석이다.

## 2. 전체 포지셔닝

식스샵은 단순 쇼핑몰 제작툴이 아니라 다음 4개 축을 묶어서 판매한다.

- AI 웹빌더: 템플릿, 블록, 커스텀 섹션, 코드 삽입을 강조
- 쇼핑몰 운영: 상품, 결제, 배송, 주문, 통계, 회원, 마케팅
- 마켓 통합: 스마트스토어, 쿠팡, 지그재그, 무신사, 옥션, 11번가, G마켓, 셀러허브
- 확장 생태계: 블록 마켓플레이스, 앱스토어, 파트너 제작 의뢰

핵심 벤치마킹 포인트는 "웹사이트 생성 기능"을 기능 목록으로만 보여주지 않고, 템플릿/블록/앱/파트너라는 구매 가능한 구성품으로 분해해 놓은 점이다.

## 3. 메인 홈페이지 정보 구조

홈 페이지의 주요 섹션 순서:

1. 헤더/상단 배너
2. 히어로: "쉽고 빠른 쇼핑몰·홈페이지 제작", "웹빌더의 한계를 없애다 식스샵 프로"
3. 템플릿 쇼케이스: 여러 템플릿 데모 사이트로 직접 이동
4. 고급 기능 섹션: 블록, AI 웹빌더, 커스텀 섹션, 코드 편집, 앱 개발
5. 올인원 솔루션: 자사몰 관리, 마켓 통합 관리, 마케팅 자동화, 확장
6. 고객/브랜드 성공 사례
7. 파트너 제작 의뢰/고객 지원
8. 최종 CTA: 14일 무료 체험
9. 푸터: 회사 정보, 고객센터, 약관/개인정보처리방침

메인 페이지에서 반복되는 설계 패턴:

- 기능 설명은 "기능명 + 한 문장 가치 + 이미지"의 카드로 구성
- CTA는 대부분 `store.sixshop.com`의 가입/로그인으로 연결
- 템플릿과 블록을 첫 화면 이후 바로 노출해 "실물을 먼저 보여주는" 흐름
- 고객사례/파트너 제작사례를 신뢰 장치로 후반부에 배치
- 고객지원과 제작의뢰를 구매 전 불안을 줄이는 보조 CTA로 사용

## 4. 랜딩 사이트 기술 구조

공개 HTML 기준:

- 서버: `nginx`
- CDN: CloudFront
- HTML: 서버 렌더링된 정적/동적 JSP 계열 랜딩 페이지로 추정
- 프론트 스택: RequireJS, jQuery 1.x, jQuery UI, Backbone, Underscore, Handlebars
- 주요 스크립트:
  - `landing-main.js`
  - `landing-marketing-content.js`
  - `global.js`
  - `internal_ssa.js`
  - `require-config.js`
- 주요 CSS:
  - `home-common.css`
  - `home-header.css`
  - `design.css`
  - `home-appstore.css`
  - `webfont-sixshop.css`

마케팅/트래킹:

- Google Tag Manager 2개 컨테이너 사용
- Naver Premium Log 사용
- 페이지 타입, 섹션, 결제 시작/성공 같은 이벤트를 `dataLayer`에 push
- 랜딩 팝업과 상단 배너는 외부 CMS API에서 가져옴

벤치마킹 포인트:

- 마케팅 랜딩과 실제 템플릿/스토어 렌더러가 분리되어 있다.
- 랜딩은 오래된 jQuery 기반이라도, 템플릿 데모는 Next.js 기반으로 별도 운영한다.
- 홍보 페이지, 템플릿 데모, 가입/스토어 관리가 각각 다른 서브도메인으로 분리된다.

## 5. 내비게이션 구조

헤더 메뉴:

- 고객사례
- 파트너 제작사례
- 템플릿
- 블록
- 앱스토어
- 요금제
- 제작의뢰
- 블로그
- 고객지원
- 로그인
- 시작하기

모바일 구조:

- 별도 `nav-mobile`
- 오버레이/딤 처리
- 모바일 하단에도 CTA와 지원 링크를 재배치

벤치마킹 포인트:

- 상단 메뉴를 제품 탐색축과 구매 전환축으로 분리한다.
- 템플릿/블록/앱스토어를 요금제보다 앞에 둔다.
- "제작의뢰"를 메뉴 최상위에 두어 셀프 제작과 대행 제작을 동시에 흡수한다.

## 6. 템플릿 목록 페이지 구조

URL: https://www.sixshop.com/template-list

템플릿 총량:

- 전체 76개
- 식스샵 프로 38개
- 기존 식스샵 38개

필터 구조:

- 제품 타입: 전체, 식스샵 프로, 식스샵
- 업종: 전체, 패션, 홈/인테리어, 식품, 뷰티/케어, 기타
- 스타일: 전체, 심플/모던, 내추럴, 통통튀는

카드 DOM 구조:

- `figure.template-item`
- `data-templateType="sixshoppro"` 또는 `data-templateType="sixshop"`
- 일부 신형 템플릿은 `data-filters="홈/인테리어,심플/모던"` 같은 필터 메타 보유
- 썸네일 영역: `.template-img-wrapper > .scroll-inner > img`
- 가짜 스크롤바: `.fake-scrollbar-thumb`
- 정보 영역: `.template-info-wrapper`, `.template-name`, `.template-type`
- 가격 영역: `.template-price`, `.price-free`, `.price-origin`, `.price-event`
- 상세 이동: `.template-detail-cover .template-detail-btn`

인터랙션:

- 썸네일 안쪽을 세로로 스크롤하면 긴 템플릿 프리뷰를 미리 볼 수 있다.
- 드래그 가능한 가짜 스크롤바를 구현했다.
- 모바일에서는 탭으로 상세 페이지 이동을 처리한다.
- 필터는 DOM 카드의 메타와 JS의 `templateFilterMap`을 기준으로 클라이언트에서 숨김/표시한다.
- 스크롤 시 필터 바가 sticky로 고정되고, 헤더는 스크롤 방향에 따라 숨김/표시된다.

## 7. 템플릿 카탈로그

식스샵 프로 템플릿:

| 이름 | 필터 | 데모 |
| --- | --- | --- |
| TerraLoom | 홈/인테리어, 심플/모던 | https://youwebd.sixshop.site/ |
| Eterra | 뷰티/케어, 내추럴 | https://eterra.sixshop.site/ |
| Flowlab | 기타, 심플/모던 | https://flowlab.sixshop.site/ |
| JUICE CO | 식품, 통통튀는 | https://shop-template2.sixshop.site/ |
| 온온스테이 | 기타, 심플/모던 | https://ownonstay.sixshop.site/ |
| MIO Creative Agency | 기타, 심플/모던 | https://youwebdside2.sixshop.site/ |
| Pinkrose | 뷰티/케어, 심플/모던 | https://pink-rose.sixshop.site/ |
| Perlea | 홈/인테리어, 심플/모던 | https://sample.sixshop.site/ |
| Apextech | 기타, 심플/모던 | https://apextech.sixshop.site/ |
| Reno Lab | 홈/인테리어, 심플/모던 | https://temp-interior.sixshop.site/ |
| Nove | 뷰티/케어, 심플/모던 | https://temp-b.sixshop.site/ |
| 로움택스 | 기타, 심플/모던 | https://loumtax.sixshop.site/ |
| Butterrr | 식품, 통통튀는 | https://butterrr.sixshop.site/ |
| Plantism | 홈/인테리어, 심플/모던 | https://plantism.sixshop.site/ |
| Urban Grid | 홈/인테리어, 심플/모던 | https://tokkiweb.sixshop.site/ |
| 비즈니스코어 B1 | 기타, 심플/모던 | https://bondy04.sixshop.site/ |
| 루미에르 클리닉 | 뷰티/케어, 심플/모던 | https://lumiereclinic.sixshop.site/ |
| Blinktone | 기타, 통통튀는 | https://youwebdside1.sixshop.site/ |
| 엠디솔루션 | 기타, 심플/모던 | https://business.sixshop.site/ |
| SAMPLE ENERGY | 기타, 심플/모던 | https://orrtemplate1.sixshop.site/ |
| Grainylab | 패션, 통통튀는 | https://orrdesign.sixshop.site/ |
| Soft | 목록 필터는 JS 맵에서 처리 | https://essential-theme-living.sellerhub.site |
| Minimal | 목록 필터는 JS 맵에서 처리 | https://grid-theme-minimal.sellerhub.site |
| Bubble | 목록 필터는 JS 맵에서 처리 | https://round-theme-bubble.sellerhub.site |
| Natural | 목록 필터는 JS 맵에서 처리 | https://essential-theme-woman-fashion.sellerhub.site |
| Clear | 목록 필터는 JS 맵에서 처리 | https://grid-theme-clear.sellerhub.site |
| Fresh | 목록 필터는 JS 맵에서 처리 | https://round-theme-fresh.sellerhub.site |
| Healthy | 목록 필터는 JS 맵에서 처리 | https://essential-theme-health-food.sellerhub.site |
| Luminous | 목록 필터는 JS 맵에서 처리 | https://grid-theme-luminous.sellerhub.site |
| Sweet | 목록 필터는 JS 맵에서 처리 | https://round-theme-sweet.sellerhub.site |
| Plain | 목록 필터는 JS 맵에서 처리 | https://essential-theme-unisex-fashion.sellerhub.site |
| Exhibit | 목록 필터는 JS 맵에서 처리 | https://grid-theme-exhibit.sellerhub.site |
| Calm | 목록 필터는 JS 맵에서 처리 | https://round-theme-calm.sellerhub.site |
| Cozy | 목록 필터는 JS 맵에서 처리 | https://essential-theme-cozy.sellerhub.site |
| Pop | 목록 필터는 JS 맵에서 처리 | https://grid-theme-pop.sellerhub.site |
| Joyful | 목록 필터는 JS 맵에서 처리 | https://round-theme-joyful.sellerhub.site |
| Urban | 목록 필터는 JS 맵에서 처리 | https://round-theme-urban.sellerhub.site |
| Vivid | 목록 필터는 JS 맵에서 처리 | https://essential-theme-vivid.sellerhub.site |

기존 식스샵 템플릿:

- 미오의일상
- éclairer
- Cloudy
- BUTTER FREE
- Haus
- Picnique
- HOMME
- LIFE FOR US
- COSMETIC
- SIMPLICITY
- UNUSUAL
- UNDERWOOD
- 호밀밭 파수꾼
- APPAREL
- 375ml
- BALANCE
- COFFEETIME
- Plate
- BARBERSHOP
- GROF'WILD
- Bloom
- CYCLE-DAY
- ARBOL
- EATS
- FLORENCE
- SYLT
- 살림살이
- LUMINANCE
- CAR WORKSHOP
- HEIMISH
- SURFBOARD
- Isaly Kitchen
- SERAPHIC
- CLEVER
- Awesome
- SKATEBOARD
- EDI GALLIA
- Corp

## 8. 템플릿 데모 사이트 기술 구조

신형 템플릿 데모는 공통적으로 다음 구조를 사용한다.

- Next.js Pages Router
- `__NEXT_DATA__`에 React Query의 `dehydratedState` 포함
- 공통 query key:
  - `website`
  - `page`
  - `website/settings`
  - `clientIp`
- 공통 스크립트:
  - `/axios.min.js`
  - `/handlebars.min.js`
  - `/handlebarsHelper.min.js`
  - `/blockMaker.min.js`
  - `/webPixels.min.js`
  - Next.js chunks
- 선택적 외부 라이브러리:
  - Swiper
  - GSAP
  - ScrollTrigger
  - Motion
- 공통 CSS:
  - `/themes/round/global.*.css`
  - `/themes/grid/global.*.css`
  - `/themes/essential/global.*.css`
  - `/_next/static/css/*.css`

Next.js 라우팅에서 확인된 쇼핑몰/사이트 기능:

- `/`
- `/cart`
- `/checkout`
- `/products/[identifier]`
- `/product/[identifier]`
- `/categories/[categoryId]`
- `/boards/[boardId]`
- `/posts/[postId]`
- `/reviews`
- `/search`
- `/auth/login`
- `/auth/signup`
- `/my-page/orders`
- `/my-page/coupons`
- `/my-page/points`
- `/my-page/reviews`
- `/qna/form`
- `/orders/[orderId]`
- `/terms/policy`
- `/terms/privacy`
- `/sitemap.xml`
- `/robots.txt`

벤치마킹 포인트:

- 템플릿 데모가 단순 이미지 미리보기가 아니라 실제 쇼핑몰 라우트 구조를 가진다.
- 상품/장바구니/회원/게시판/리뷰/검색/마이페이지까지 데모 앱 안에 공통 포함된다.
- 템플릿은 "디자인 스킨"이고, 상거래 기능은 공통 Storefront 앱에서 처리한다.

## 9. 템플릿 렌더링 데이터 모델

`website` query:

- `id`
- `themeTemplateId`
- `style`
- `customCode`
- `globalSection`

`style.property` 주요 키:

- `color`
- `typography`
- `layout`
- `button`
- `product`
- `productBadge`
- `round`
- `animation`
- `sns`

`page` query:

- `id`
- `name`
- `featureType`
- `isHomepage`
- `seo`
- `sections`

`section` 주요 구조:

- `id`
- `type`
- `name`
- `property`
- `blocks`

주요 섹션 타입:

- `Custom-T02`
- `Text`
- `Text-T01`
- `MediaProduct`
- `MediaProduct-T01`
- `MediaWithText`
- `MediaWithText-T01`
- `TopBanner-T01`
- `Html`
- `Custom`

주요 블록 타입:

- `app`
- `group`
- `text`
- `image`
- `button`

핵심 패턴:

- 대부분의 신형 템플릿은 `Custom-T02` 섹션을 중심으로 구성된다.
- 시각적 차이는 섹션 타입보다 `app` 블록과 커스텀 블록 스니펫에서 크게 난다.
- 템플릿의 컬러는 `.colorScheme1`부터 `.defaultColorScheme`까지 CSS 변수로 주입된다.
- 버튼, 제품 카드, 배지, SNS 표기 방식도 템플릿 전역 스타일 객체에서 제어된다.

## 10. 템플릿 데모 크롤링 요약

외부 데모 URL 38개를 순회했다. 한 개는 DNS 확인 실패가 있었다.

| URL | 테마 | 섹션 수 | 주요 섹션 타입 | 주요 블록 타입 |
| --- | --- | ---: | --- | --- |
| https://apextech.sixshop.site/ | essential 계열 ID | 1 | Custom-T02:1 | app:10 |
| https://bondy04.sixshop.site/ | round | 6 | Custom-T02:6 | app:9 |
| https://business.sixshop.site/ | round | 8 | Custom-T02:8 | app:11 |
| https://butterrr.sixshop.site/ | essential 계열 ID | 4 | Custom-T02:4 | app:11 |
| https://essential-theme-cozy.sellerhub.site/ | essential 계열 ID | 1 | Custom-T02:1 | app:3 |
| https://essential-theme-health-food.sellerhub.site/ | essential 계열 ID | 6 | Custom-T02:3, MediaWithText-T01:3 | app:6 |
| https://essential-theme-living.sellerhub.site/ | essential 계열 ID | 9 | Custom-T02:8, MediaWithText-T01:1 | app:10 |
| https://essential-theme-unisex-fashion.sellerhub.site/ | essential 계열 ID | 1 | Custom-T02:1 | app:4 |
| https://essential-theme-vivid.sellerhub.site/ | essential 계열 ID | 7 | MediaWithText-T01:2, Custom-T02:2, Text-T01:2, MediaProduct-T01:1 | app:5 |
| https://essential-theme-woman-fashion.sellerhub.site/ | essential 계열 ID | 3 | Custom-T02:3 | app:5 |
| https://eterra.sixshop.site/ | round | 9 | Custom-T02:8, Text:1 | app:12 |
| https://flowlab.sixshop.site/ | round | 10 | Custom-T02:9, MediaProduct:1 | app:12 |
| https://grid-theme-clear.sellerhub.site/ | grid | 8 | MediaWithText:3, Custom-T02:3, Text:2 | app:5 |
| https://grid-theme-exhibit.sellerhub.site/ | grid | 2 | Text:1, Custom-T02:1 | app:3 |
| https://grid-theme-luminous.sellerhub.site/ | grid | 5 | Custom-T02:4, Text:1 | app:7 |
| https://grid-theme-minimal.sellerhub.site/ | grid | 9 | Custom-T02:7, MediaWithText:1, Text:1 | app:9 |
| https://grid-theme-pop.sellerhub.site/ | grid | 7 | Custom-T02:5, Text:2 | app:8 |
| https://loumtax.sixshop.site/ | round | 3 | Custom-T02:3 | app:10 |
| https://lumiereclinic.sixshop.site/ | essential 계열 ID | 1 | Custom-T02:1 | app:7 |
| https://orrdesign.sixshop.site/ | round | 4 | Custom-T02:4 | app:5 |
| https://orrtemplate1.sixshop.site/ | DNS 실패 | 0 | 확인 실패 | 확인 실패 |
| https://ownonstay.sixshop.site/ | round | 1 | Custom:1 | app:3 |
| https://pink-rose.sixshop.site/ | essential 계열 ID | 7 | Custom-T02:7 | app:19 |
| https://plantism.sixshop.site/ | essential 계열 ID | 8 | Custom-T02:8 | app:10, text:2, button:1, image:1 |
| https://round-theme-bubble.sellerhub.site/ | round | 6 | Custom-T02:4, Text:1, MediaProduct:1 | app:6 |
| https://round-theme-calm.sellerhub.site/ | round | 7 | Custom-T02:5, Text:1, MediaProduct:1 | app:7 |
| https://round-theme-fresh.sellerhub.site/ | round | 6 | Custom-T02:4, MediaWithText:2 | app:6 |
| https://round-theme-joyful.sellerhub.site/ | round | 10 | Custom-T02:8, MediaProduct:2 | app:11 |
| https://round-theme-sweet.sellerhub.site/ | round | 2 | Text:1, Custom-T02:1 | app:3 |
| https://round-theme-urban.sellerhub.site/ | round | 5 | Custom-T02:3, MediaWithText:1, Text:1 | app:5 |
| https://sample.sixshop.site/ | essential 계열 ID | 3 | Custom-T02:3 | image:6, group:6, app:6, text:4 |
| https://shop-template2.sixshop.site/ | round | 5 | Custom-T02:4, Html:1 | group:12, text:8, app:7 |
| https://temp-b.sixshop.site/ | round | 11 | Custom-T02:11 | app:13, text:8, group:4, image:1 |
| https://temp-interior.sixshop.site/ | round | 9 | Custom-T02:9 | app:13, text:4, group:2 |
| https://tokkiweb.sixshop.site/ | grid | 7 | Custom-T02:7 | app:8, text:1 |
| https://youwebd.sixshop.site/ | round | 10 | Custom-T02:6, Text:3, MediaProduct:1 | app:8, group:2 |
| https://youwebdside1.sixshop.site/ | essential 계열 ID | 1 | Custom-T02:1 | app:3 |
| https://youwebdside2.sixshop.site/ | grid | 15 | Custom-T02:15 | app:18, group:7 |

해석:

- 템플릿은 섹션 수 1~15개로 편차가 크다.
- 고급/파트너 제작형 템플릿일수록 `app` 블록이 많다.
- `Custom-T02`는 사실상 범용 레이아웃 컨테이너 역할이다.
- `MediaProduct`, `MediaWithText`, `Text` 같은 기본 섹션은 보조 역할이고, 차별화는 커스텀 앱 블록에서 발생한다.

## 11. BlockMaker 구조

템플릿 데모 사이트는 `/blockMaker.min.js`를 사용한다.

확인된 역할:

- 현재 script의 `data-block-id`로 대응되는 `.app-block[data-block-id]`를 찾는다.
- `data-property` JSON을 읽어 블록 설정으로 사용한다.
- Handlebars precompiled template과 style template을 렌더링한다.
- 블록별 scoped `localStorage`, `sessionStorage`를 제공한다.
- `Storefront.get()`과 `Storefront.watch()`를 통해 상품, 카테고리, 게시판, 리뷰 데이터를 가져온다.
- `theme-setting-changed` 이벤트를 받아 버튼 스타일 등 전역 설정 변경에 반응한다.
- DOM 제거 시 `onDestroy`를 호출하고 이벤트 리스너를 정리한다.

지원 데이터 타입:

- PRODUCT
- CATEGORY
- BOARD
- REVIEW

벤치마킹 포인트:

- 블록 하나가 "HTML + CSS + JS + property schema"를 품는 독립 실행 유닛이다.
- 블록은 정적 장식이 아니라 Storefront 데이터와 연결 가능한 미니 앱이다.
- 편집기에서 블록 속성을 바꾸면 `data-property` 변경을 감지해 즉시 재렌더링할 수 있다.
- 우리 서비스에서 템플릿/블록 시스템을 만들 경우 `BlockRenderer`를 별도 패키지처럼 설계하는 것이 좋다.

## 12. 블록 마켓플레이스 구조

URL: https://www.sixshop.com/blocks

공개 API:

- `https://marketplace.sixshop.io/api/block-categories`
- `https://marketplace.sixshop.io/api/blocks`

블록 총량:

- 총 206개
- 랜딩 JS는 pageSize 200으로 첫 페이지를 불러오며, API meta 기준 pageCount는 2

블록 카테고리:

- 카테고리: 프리미어
- 쇼핑: 상품, 리뷰, 프로모션/혜택
- 탐색: 헤더, 푸터
- 콘텐츠: 메인 배너, 띠배너, 갤러리, 정보/소개/FAQ, 인스타그램, 폼, 지도, 팝업, 카운트다운, 아코디언

상위 빈도 카테고리:

- 프리미어: 123
- 정보/소개/FAQ: 108
- 갤러리: 64
- 메인 배너: 28
- 프로모션/혜택: 17
- 리뷰: 11
- 푸터: 11
- 인스타그램: 10
- 상품: 9
- 폼: 8
- 아코디언: 8
- 카운트다운: 8
- 헤더: 5
- 지도: 5
- 팝업: 2

블록 카드 DOM:

- `figure.block-card`
- `data-block-id`
- `data-document-id`
- `data-related-category-ids`
- `data-filters`
- `.img-wrapper`
- `.img-inner`
- `.info-wrapper`
- `.premier-badge`
- `.name`
- `.creator`

블록 모달:

- `#blockPreviewModal`
- iframe 기반 프리뷰
- 운영 환경에서는 `https://store.sixshop.com/market/block/{documentId}?sixshopLanding=true`
- 로컬/테스트 환경에서는 `https://sixshop3.com/market/block/{documentId}`

벤치마킹 포인트:

- 블록 상세를 별도 페이지가 아니라 모달 iframe으로 보여준다.
- 블록 마켓은 실제 편집기/스토어 로그인과 연결된다.
- 블록 파트너 이름을 노출해 생태계 느낌을 만든다.
- 프리미어 배지로 유료/고품질 큐레이션을 강조한다.

## 13. 앱스토어 구조

URL: https://www.sixshop.com/appstore

공개 API:

- `https://marketplace.sixshop.io/api/apps`
- `https://marketplace.sixshop.io/api/app-categories`

앱 수:

- 54개

앱 카테고리:

- 추천 앱
- 주문 관리
- 상품 관리
- 판매 채널
- 통합 솔루션
- 마케팅/통계
- 회원가입/로그인
- 결제
- 기본 제공 기능
- 웹사이트 관리
- 고객 관리 (CRM)

앱 카드 DOM:

- `.appstore-item`
- `data-category`
- `.thumbnail`
- `.logo-wrapper`
- `.name`

앱 상세 모달:

- `#appstoreModal`
- 썸네일이 유튜브 URL이면 YouTube embed로 변환
- 이미지면 이미지 프리뷰 표시
- 오른쪽에는 아이콘, 이름, 카테고리 배지, 요약, "사용해 보기" CTA
- CTA는 `https://store.sixshop.com/auth/login`으로 연결

대표 앱:

- MCP
- 사방넷
- 페이액션
- 채널톡
- 인스타그램 피드
- 주문 알리미
- 미디버스 커머스
- 네이버페이 결제형
- 네이버 로그인
- 카카오싱크
- 구글 태그 매니저
- 구글 애즈
- 카카오픽셀
- 네이버 프리미엄 로그 분석
- 구글 애널리틱스
- 스마트스토어 연동
- 쿠팡 연동
- 지그재그 연동
- 무신사 연동
- 11번가 연동
- G마켓 연동
- 옥션 연동
- 셀러허브 연동

벤치마킹 포인트:

- 앱스토어는 "기능 목록"보다 "확장 생태계"로 보이게 한다.
- 기본 제공 기능도 앱처럼 나열해 제품의 풍성함을 만든다.
- 외부 솔루션과 내부 기능을 같은 카드 문법으로 통합한다.

## 14. 요금제 페이지 구조

URL: https://www.sixshop.com/pricing

주요 플랜:

- 무료 플랜: 0원
- 쇼핑몰 플랜: 21,800원/월
- 홈페이지 플랜: 12,300원/월
- 해외몰 플랜: 0원/월, 식스샵에서 제공

비교표 범주:

- 기본 기능
- 상점 관리
- 결제/주문
- 마케팅/통계/분석
- 마켓 통합 관리
- 연동 지원 마켓
- FAQ

강조 기능:

- 디자인 테마
- 블록 AI 생성
- 블록 마켓플레이스
- 커스텀 도메인
- SSL 인증서
- 페이지 무제한
- 저장공간 무제한
- 트래픽 무제한
- 상품 무제한
- 게시판, 팝업, 채널톡, 알림톡, SMS, 이메일
- 소셜 로그인
- 예약 상품, 디지털 상품
- 네이버페이, 카카오페이, 토스페이
- 쿠폰, 적립금, 비회원 구매
- 주문/매출 통계
- 고객 세그먼트
- SEO, 웹마스터 도구, 애널리틱스, 광고 픽셀

FAQ에서 중요한 메시지:

- 식스샵과 식스샵 프로를 하나의 통합 계정으로 각각 운영 가능
- 기존 식스샵에서 식스샵 프로로 이전 가능
- CSS Flexbox 기반 커스텀 섹션과 HTML/CSS/JS 코드 활용 가능
- PG 연동은 2~3분 내 카드 결제 활성화로 표현
- 도메인 연결 시 SSL 무료 제공

벤치마킹 포인트:

- 가격보다 기능 비교표가 훨씬 길고 자세하다.
- AI/블록/코드 삽입은 제작 자유도 메시지에 쓰고, PG/배송/마켓 연동은 사업 운영 메시지에 쓴다.
- FAQ가 영업 반박 처리 역할을 한다.

## 15. UI/디자인 시스템 단서

랜딩 사이트:

- 주요 브랜드 컬러: 보라 계열 `#5e51f0`, `#6D6BD1`
- 주요 텍스트: `#222222`, `#8B8B9E`, `#85878e`
- 주요 라인/배경: `#F0F0F5`, `#E2E2EA`, `#F4F4FF`, `#FFFFFF`
- 폰트: Pretendard, Open Sans, Noto Sans KR, Nanum 계열 fallback
- 카드 radius: 10px, 12px, 16px, 20px 등
- 버튼은 `btn`, `btn-purple`, `bordered`, `basic`, `small`, `big` 같은 조합형 클래스를 사용

템플릿 데모:

- 테마별 전역 CSS 변수로 색상 주입
- `colorScheme1`부터 `defaultColorScheme`까지 색상 스코프 제공
- `--color-background-*`, `--color-text-*`, `--color-accent-*`, `--color-border-*` 형태
- 버튼 shape/style/color가 전역 설정으로 관리
- 상품 카드 이미지, 정렬, 배지 스타일도 전역 설정으로 관리

벤치마킹 포인트:

- 랜딩 디자인 시스템과 템플릿 렌더러 디자인 시스템은 별도다.
- 템플릿 데모는 사용자별 커스텀 색상/폰트를 CSS 변수와 JSON 설정으로 주입한다.
- 우리도 템플릿 엔진을 만들 경우 "브랜드 랜딩 UI"와 "생성된 결과물 UI"를 분리해야 한다.

## 16. 벤치마킹 핵심 요약

식스샵의 구조적 강점:

- 템플릿, 블록, 앱을 모두 "마켓"처럼 보여준다.
- 사용자가 완성 결과물을 바로 상상하게 만드는 실물 데모가 많다.
- 웹사이트 제작과 쇼핑몰 운영을 한 제품 안에서 연결한다.
- 블록을 독립 실행 가능한 미니 앱으로 취급한다.
- 기능 설명보다 "결과물 미리보기"와 "확장 가능성"을 전면에 둔다.
- 무료 체험 CTA를 모든 탐색 루트 끝에 둔다.
- 제작의뢰/파트너를 통해 셀프 제작 실패 사용자를 흡수한다.

약점 또는 기회:

- 랜딩 쪽 기술 스택은 오래된 jQuery/RequireJS 기반이다.
- 템플릿 목록의 일부 필터 메타가 HTML 속성보다 JS 맵에 의존한다.
- 블록 목록은 API total 206개인데 랜딩 JS 기본 pageSize가 200이라 페이지네이션 처리에 의존한다.
- 템플릿 데모 HTML이 2~3MB 이상으로 무겁다.
- 일부 템플릿 도메인은 접근 실패 가능성이 있다.
- 앱스토어/블록 상세는 클라이언트 렌더링 의존도가 커서 초기 HTML에는 내용이 적다.

## 17. 우리 서비스에 가져올 설계 포인트

PR Maker/Castfolio에 적용 가능한 구조:

- 템플릿 갤러리: 업종, 목적, 스타일, 가격/무료 여부, 데모 링크
- 블록 마켓: 히어로, 프로필, 커리어, 포트폴리오, 리뷰, 연락처, 가격표, QR, 제출폼
- 블록 데이터 모델: `blockId`, `documentId`, `name`, `category`, `creator`, `previewImages`, `schema`, `snippet`
- 템플릿 데이터 모델: `templateId`, `themeFamily`, `sections`, `globalStyle`, `demoUrl`, `thumbnail`, `filters`
- 렌더러: `SectionRenderer`, `BlockRenderer`, `Storefront/PortfolioContext`
- 편집기: 섹션 단위 속성 패널 + 전역 스타일 패널 + 코드 삽입 영역
- 공개 페이지: Next.js 기반 실제 데모 URL 제공
- 제작의뢰: 셀프 제작과 운영자 제작을 같은 흐름에서 받기

우선순위:

1. 템플릿 목록 페이지를 먼저 만든다.
2. 템플릿별 실제 데모 URL을 제공한다.
3. 블록 시스템은 처음부터 완전한 마켓보다 내부 재사용 컴포넌트 카탈로그로 시작한다.
4. 이후 블록별 설정 스키마와 프리뷰를 붙여 마켓처럼 확장한다.
5. 요금제/기능표에는 "제작 자유도"와 "운영 기능"을 분리해서 표현한다.

## 18. 참고 소스

- Sixshop home: https://www.sixshop.com/
- Template list: https://www.sixshop.com/template-list
- Blocks: https://www.sixshop.com/blocks
- Appstore: https://www.sixshop.com/appstore
- Pricing: https://www.sixshop.com/pricing
- Block categories API: https://marketplace.sixshop.io/api/block-categories
- Blocks API: https://marketplace.sixshop.io/api/blocks
- App categories API: https://marketplace.sixshop.io/api/app-categories
- Apps API: https://marketplace.sixshop.io/api/apps
- Representative template demo: https://youwebd.sixshop.site/
- Representative template demo: https://grid-theme-minimal.sixshop.site/
- Representative template demo: https://essential-theme-living.sixshop.site/
