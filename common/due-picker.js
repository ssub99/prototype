/*
 * 납부기한 선택 bottom sheet (캘린더) — Figma: [6.2.2.1.0.0.0]학원관리_네비게이션_청구서 생성_납부기한 선택 (375:162478)
 *   DuePicker.open({ value: "yy-mm-dd", title?: "납부기한 선택", onSave: (yymmdd, changed) => … })  → opens over the device screen; 저장 returns the picked date (the given value if nothing picked; changed = whether a day was picked).
 * Measured from the frame: sheet 460px · head 48 (title 14 Bold, ✕ at right) · month header 28 at y64 (chevrons 24, title 16/500 gray-06) ·
 * weekday row 32 at y108 (14 Regular gray-05) · date rows from y140: 30×30 cells, 36px rows (selected = green circle, white Bold; other-month days gray-04) · 저장 56 at y388.
 * Used by 청구서 생성 목록(미생성 카드의 납부기한) and 청구금액 조정(상단 카드의 납부기한). Self-contained: injects its own styles (".dp*", ".due-link") so a cached stylesheet can't break it.
 * Requires ds/rallyz.browser.js.
 */
(function () {
  const R = window.Rallyz;
  const el = (tag, cls, kids = [], attrs = {}) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    n.append(...[].concat(kids).filter((k) => k != null));
    return n;
  };
  const pad = (n) => String(n).padStart(2, "0");

  const CSS = `
.dp { width: 100%; height: 460px; background: var(--rz-white); border-radius: 12px 12px 0 0; display: flex; flex-direction: column; }
.dp__head { position: relative; flex: none; height: 48px; display: grid; place-items: center; border-bottom: 1px solid #F4F4F4; font: var(--rz-type-body02-bold); color: var(--rz-black); }
.dp__close { position: absolute; right: 16px; top: 14px; border: 0; background: none; padding: 0; cursor: pointer; display: inline-flex; }
.dp__cal { flex: 1; min-height: 0; padding: 16px 16px 0; }
.dp__month { height: 28px; display: flex; align-items: center; justify-content: space-between; }
.dp__month strong { font: 500 16px/28px var(--rz-font-sans); color: var(--rz-gray-06); }
.dp__nav { width: 24px; height: 24px; border: 0; background: none; padding: 0; display: grid; place-items: center; cursor: pointer; }
.dp__dow { margin-top: 16px; height: 32px; display: flex; justify-content: space-between; align-items: center; padding: 0 5px; font: var(--rz-type-body02-regular); color: var(--rz-gray-05); }
.dp__dow span { width: 20px; text-align: center; }
.dp__days { display: grid; grid-template-columns: repeat(7, 30px); justify-content: space-between; row-gap: 6px; }
.dp__days.is-six { row-gap: 2px; }
.dp__day { width: 30px; height: 30px; border: 0; border-radius: 50%; background: none; padding: 0; cursor: pointer; font: var(--rz-type-body02-regular); color: var(--rz-gray-06); display: grid; place-items: center; }
.dp__day.is-muted { color: var(--rz-gray-04); cursor: default; }
.dp__day.is-on { background: var(--rz-primary); color: var(--rz-white); font: var(--rz-type-body02-bold); }
.dp__foot { flex: none; padding: 16px; }
.due-link { border: 0; background: none; padding: 0; cursor: pointer; font: inherit; color: var(--rz-secondary); text-decoration: underline; text-underline-offset: 2px; }
`;
  const st = document.createElement("style"); st.id = "due-picker-style"; st.textContent = CSS; document.head.append(st);

  function open({ value, title = "납부기한 선택", onSave } = {}) {
    const [yy, mm, dd] = value.split("-").map(Number);
    let y = 2000 + yy, m = mm;                 // month on screen
    let sel = { y: 2000 + yy, m: mm, d: dd };  // picked date
    let changed = false;
    const x = el("button", "dp__close", [R.Icon("line/ic24_close-type01", { size: 20, color: "var(--rz-gray-06)" })], { type: "button", "aria-label": "닫기" });
    const cal = el("div", "dp__calbox");
    function paint() {
      const nav = (dir) => {
        const b = el("button", "dp__nav", [R.Icon(dir < 0 ? "glyph/chevron-left" : "glyph/chevron-right", { size: 24, color: "var(--rz-gray-07)" })], { type: "button", "aria-label": dir < 0 ? "이전 달" : "다음 달" });
        b.addEventListener("click", () => { m += dir; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } paint(); });
        return b;
      };
      const first = new Date(y, m - 1, 1).getDay(), len = new Date(y, m, 0).getDate(), prevLen = new Date(y, m - 1, 0).getDate();
      const cells = Math.ceil((first + len) / 7) * 7;
      const days = el("div", "dp__days" + (cells > 35 ? " is-six" : ""));
      for (let i = 0; i < cells; i++) {
        const d = i - first + 1, inMonth = d >= 1 && d <= len;
        const on = inMonth && sel.y === y && sel.m === m && sel.d === d;
        const c = el("button", "dp__day" + (inMonth ? "" : " is-muted") + (on ? " is-on" : ""), [String(inMonth ? d : d < 1 ? prevLen + d : d - len)], { type: "button" });
        if (inMonth) { c.addEventListener("click", () => { sel = { y, m, d }; changed = true; paint(); }); } else c.disabled = true;
        days.append(c);
      }
      cal.replaceChildren(
        el("div", "dp__month", [nav(-1), el("strong", "", [`${y}년 ${m}월`]), nav(1)]),
        el("div", "dp__dow", ["일", "월", "화", "수", "목", "금", "토"].map((t) => el("span", "", [t]))),
        days,
      );
    }
    paint();
    const save = R.Button({ label: "저장", size: 56, onClick: () => { dim.remove(); onSave?.(changed ? `${String(sel.y).slice(2)}-${pad(sel.m)}-${pad(sel.d)}` : value, changed); } });
    const sheet = el("div", "dp", [el("div", "dp__head", [title, x]), el("div", "dp__cal", [cal]), el("div", "dp__foot", [save])], { role: "dialog", "aria-modal": "true", "aria-label": title });
    const dim = el("div", "guide-dim", [sheet]);
    x.addEventListener("click", () => dim.remove());
    dim.addEventListener("click", (e) => e.target === dim && dim.remove());
    document.querySelector(".rz-device__screen").append(dim);
    return dim;
  }

  window.DuePicker = { open };
})();
