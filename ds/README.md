# Rallyz DS (code)

이 디렉터리는 Figma `(Local)Rallyz Design Library_231028` → Components 페이지를 실측한 결과로 만들었어요.

## 쓰는 법

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
<link rel="stylesheet" href="./ds/tokens.css" />
<link rel="stylesheet" href="./ds/components.css" />
<body class="rz">
<script src="./ds/rallyz.browser.js"></script>   <!-- window.Rallyz (file:// 에서도 동작) -->
<script>
  const { Device, StatusBar, Header, Navagation, Button, Icon } = Rallyz;
  document.body.append(Device({ children: [StatusBar(), Header({ kind: "home" }), Navagation({ active: "home" })] }));
</script>
```

ES 모듈로 쓰려면 `import { Button } from "./ds/index.js"`를 쓰면 돼요.

- 컴포넌트별 호출 예시는 `showcase.html`에 있어요. 마스터 256개 하나하나가 Figma PNG, 코드 렌더, 호출 코드로 나란히 놓여 있고, 오버레이 슬라이더로 겹쳐서 비교할 수 있어요. 로컬 서버로 열어야 해요(예: `npx serve .`).
- 렌더된 요소마다 `data-figma="<마스터 이름>"`이 붙어 있어요.
- 아이콘은 `Icon("line/ic24_add", { size: 24, color: "var(--rz-primary)" })`처럼 써요. SVG는 총 196개예요(Icon 페이지 177개, 컴포넌트 내부 글리프 19개).
  - 단색 아이콘은 `currentColor`로 바뀌어 있어서 색을 바꿀 수 있어요.
  - 다색 아이콘(flat/ic48 등)은 Figma 원색 그대로예요.
- 토큰 이름은 `--rz-primary`, `--rz-gray-01…07`, `--rz-green-*`, `--rz-blue-*`, `--rz-signature`(헤더 그라디언트), `--rz-type-body02-bold`(font shorthand)예요. 텍스트 클래스는 `.rz-t-body02-bold` 형식이에요.

## 다시 생성하기

```
ds/figma/            ← Fluid 플러그인으로 뽑은 원본 (spec/*.json lossless 트리, png/, icon-svg/, glyph-svg/, styles.json, variables.json)
node ds/build-figma.mjs    → icons/, icons.js, tokens.css, registry.json
node ds/build-browser.mjs  → rallyz.browser.js
```

`components.css`와 `components.js`는 직접 작성한 파일이에요. 값은 `figma/spec/*.json` 실측치를 기준으로 했어요.

## Figma와 다르게 처리한 것

- `control/check/type07`은 `checked`와 `default`의 모양이 서로 뒤바뀌어 있어요(default가 초록). 코드는 모양 기준으로 `checked = 초록`이에요.
- Figma의 stroke INSIDE는 `box-shadow: inset 0 0 0 1px`로 구현했어요. 크기에는 영향이 없어요.
- `input/.../error`의 헬퍼 텍스트는 Figma 마스터 바깥(y=52)에 있어요. 코드에서는 `Input({ error, helper })`로 아래에 붙어요.
- 리스트와 카드 썸네일은 `assets/ds/thumb-*.png`(Figma 이미지 fill을 3x로 export한 것)이에요.
