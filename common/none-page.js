/*
 * none-page (빈 상태) + 기능 활용 가이드 bottom sheet — see docs/none-page-policy.md for the policy.
 *   class:   [6.2.3.1.1.0.0]학원관리_클래스관리 (320:133189) · [7.1.1.4.6.0.0]…클래스 없는 경우_생성 유도 컨텐츠01~04 (320:134123/134240/134346/134449)
 *   student: [7.1.1.4.1.0.0]학습관리_학생명단_학생이 없을 때 (320:138183) · …_생성 유도 컨텐츠01~04 (320:138213/138322/138473/138617)
 *
 *   NonePage.gate({ needs, from, have }) → element | null   ← use this on any screen that needs a class and/or a student.
 *       needs: REQUIRED, no default — each screen opts in to exactly what its funnel needs: ["class"] | ["student"] | ["class","student"].
 *              Omitted/empty → null (no none-page). Only what is listed is checked, in fixed priority 클래스 → 학생.
 *       Returns the none-page of the FIRST missing prerequisite, or null when everything needed exists (render the real screen).
 *       have:  optional override { class?: bool, student?: bool } for scoped checks (e.g. "this class has no students").
 *   NonePage.missing({ needs, have }) → "class" | "student" | null   (same decision without building the element)
 *   NonePage.render({ kind, from })    → illustration, "등록된 …이 없습니다.", CTA button, "…을 왜 …해야 하나요 ?" (opens the guide — 개선 전(before/)에서는 이 텍스트 버튼을 그리지 않는다)
 *   NonePage.openGuide({ kind, from }) → opens that kind's 4-page guide over the device screen
 *   kind: "class" (default) | "student". `from` = page to return to after the CTA (class-new.html?from=… / student-add.html?from=…).
 * Requires ds/rallyz.browser.js (+ common/data.js for gate/missing). Styles live in common/onboarding.css (".none*", ".guide-sheet*").
 */
(function () {
  const R = window.Rallyz;
  const A = "../assets/onboarding/";
  const el = (tag, cls, kids = [], attrs = {}) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    n.append(...[].concat(kids).filter((k) => k != null));
    return n;
  };
  // headline parts: [text, highlighted?] · hand/over: [file, left, top] overlays inside the 343×320 preview
  const CLASS_PAGES = [
    { tag: "피드 기능", title: [["소속된 학생/보호자", 1], ["와\n소통을 할 수 있어요!"]], img: "guide-1.svg" },
    { tag: "출결관리 기능", title: [["클래스마다 "], ["학생별", 1], ["로\n"], ["출결관리", 1], ["가 가능해요!"]], img: "guide-2.svg", hand: ["guide-2-hand.svg", 246, 234] },
    { tag: "학습관리 기능", title: [["학생별로 성적관리/학습평가를 진행", 1], ["하여\n보호자에게 전달할 수 있어요."]], img: "guide-3.svg", hand: ["guide-3-hand.svg", 168, 260] },
    { tag: "납부관리 기능", title: [["클래스마다 "], ["일괄적으로", 1], ["\n"], ["수납을 관리", 1], ["할 수 있어요."]], img: "guide-4.svg" },
  ];
  const STUDENT_PAGES = [
    { tag: "학생관리 기능", title: [["학생별로 "], ["일괄적으로", 1], ["\n"], ["조회/관리", 1], [" 할 수 있어요."]], img: "sguide-1.svg", over: ["sguide-1-row.svg", -16, 112, 375, 112] },
    { tag: "청구서 기능", title: [["선택한 "], ["인원별로 청구하여", 1], ["\n"], ["수납", 1], ["할 수 있어요."]], img: "sguide-2.svg" },
    { tag: "일정 기능", title: [["강의 진행중인 클래스의 스케줄은\n"], ["일정메뉴에 자동공유 되요.", 1]], img: "sguide-3.svg" },
    { tag: "라이브 기능", title: [["학원의 운영방침에 따라\n"], ["원격 화상수업을 진행할 수 있어요.", 1]], img: "sguide-4.jpg", round: true },
  ];
  const KINDS = {
    class: { pages: CLASS_PAGES, head: "클래스 생성 시 기능 활용 안내", cta: "지금 바로 클래스 생성하기", empty: "등록된 클래스가 없습니다.", button: "클래스 만들기", why: "클래스를 왜 생성해야 하나요 ?", img: "class-empty.svg",
      url: (from) => `./class-new.html?from=${encodeURIComponent(from || "home")}` },
    student: { pages: STUDENT_PAGES, head: "학생등록 시 기능 활용 안내", cta: "지금 바로 학생 등록하기", empty: "등록된 학생이 없습니다.", button: "학생 등록하기", why: "학생을 왜 등록해야 하나요 ?", img: "student-empty.svg",
      url: (from) => `./student-add.html?from=${encodeURIComponent(from || "student-manage")}` },
  };

  function openGuide({ kind = "class", from } = {}) {
    const K = KINDS[kind], PAGES = K.pages, createUrl = K.url;
    const screen = document.querySelector(".rz-device__screen");
    let page = 0;
    const body = el("div", "guide-sheet__body");
    const dots = el("div", "guide-sheet__dots", [], { role: "tablist", "aria-label": "가이드 페이지" });
    const footer = el("div", "guide-sheet__footer");
    const close = () => dim.remove();
    const render = () => {
      const p = PAGES[page];
      const title = el("h3", "guide-sheet__title", p.title.map(([t, hi]) => (hi ? el("b", "", [t]) : t)));
      const art = el("div", "guide-sheet__art", [el("img", p.round ? "is-round" : "", [], { src: A + p.img, alt: "" })]);
      if (p.hand) art.append(el("img", "guide-sheet__hand", [], { src: A + p.hand[0], alt: "", style: `left:${p.hand[1]}px;top:${p.hand[2]}px` }));
      if (p.over) art.append(el("img", "guide-sheet__over", [], { src: A + p.over[0], alt: "", style: `left:${p.over[1]}px;top:${p.over[2]}px;width:${p.over[3]}px;height:${p.over[4]}px` }));
      body.replaceChildren(el("span", "guide-sheet__tag", [p.tag]), title, dots, art);
      dots.replaceChildren(...PAGES.map((_, i) => {
        const d = el("button", i === page ? "is-on" : "", [], { type: "button", role: "tab", "aria-selected": String(i === page), "aria-label": `${i + 1}/${PAGES.length}` });
        d.addEventListener("click", () => { page = i; render(); });
        return d;
      }));
      const last = page === PAGES.length - 1;
      footer.replaceChildren(R.Button({ label: last ? K.cta : "다음", size: 56, onClick: () => (last ? (location.href = createUrl(from)) : (page++, render())) }));
    };
    // swipe left/right between pages
    let x0 = null;
    body.addEventListener("dragstart", (e) => e.preventDefault()); // images would otherwise swallow the gesture
    body.addEventListener("pointerdown", (e) => (x0 = e.clientX));
    body.addEventListener("pointercancel", () => (x0 = null));
    body.addEventListener("pointerup", (e) => {
      if (x0 == null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) < 40) return;
      page = Math.max(0, Math.min(PAGES.length - 1, page + (dx < 0 ? 1 : -1)));
      render();
    });
    const x = el("button", "guide-sheet__close", [R.Icon("line/ic24_close-type01", { size: 20, color: "var(--rz-gray-07)" })], { type: "button", "aria-label": "닫기" });
    x.addEventListener("click", close);
    const sheet = el("div", "guide-sheet", [el("div", "guide-sheet__head", [K.head, x]), body, footer], { role: "dialog", "aria-modal": "true", "aria-label": K.head });
    const dim = el("div", "guide-dim", [sheet]);
    dim.addEventListener("click", (e) => e.target === dim && close());
    render();
    screen.append(dim);
    return dim;
  }

  function render({ kind = "class", from } = {}) {
    const K = KINDS[kind];
    const why = el("button", "none__why", [R.Icon("line/ic24_info", { size: 20, color: "var(--rz-gray-06)" }), K.why], { type: "button" });
    why.addEventListener("click", () => openGuide({ kind, from }));
    return el("div", "none", [
      el("img", "", [], { src: A + K.img, alt: "" }),
      el("h2", "", [K.empty]),
      R.Button({ label: K.button, size: 48, onClick: () => (location.href = K.url(from)) }),
      ...(window.RzData?.version === "before" ? [] : [why]), // 개선 전: 버튼 아래 "…왜 …해야 하나요 ?" 텍스트 버튼(가이드)을 제공하지 않는다
    ]);
  }

  // ---- gating policy: 클래스 논페이지 first, then 학생 논페이지 ----
  const ORDER = ["class", "student"];
  const HAS = {
    class: () => (window.RzData?.get().classes.length || 0) > 0,
    student: () => (window.RzData?.get().students.length || 0) > 0,
  };
  function missing({ needs = [], have = {} } = {}) {
    return ORDER.find((k) => needs.includes(k) && !(k in have ? have[k] : HAS[k]())) || null;
  }
  function gate({ needs = [], from, have } = {}) {
    const kind = missing({ needs, have });
    return kind ? render({ kind, from }) : null;
  }

  // 가이드 시트에서 클래스 생성/학생 등록으로 갔다가 뒤로 오면(bfcache 복원) 시트가 열린 채 남으므로 닫아 둔다.
  window.addEventListener("pageshow", (e) => { if (e.persisted) document.querySelectorAll(".guide-dim").forEach((d) => d.remove()); });
  // 같은 이유로 이동 직전에 시트를 치운다(bfcache 를 쓰지 않는 브라우저에서도 안전).
  window.addEventListener("pagehide", () => document.querySelectorAll(".guide-dim").forEach((d) => d.remove()));

  window.NonePage = { gate, missing, render, openGuide };
})();
