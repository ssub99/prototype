/*
 * 시간 설정 bottom sheet (hour / minute wheels) — Figma: Group 278 (4865:96423)
 *   TimePicker.open({ value: "HH:MM" | "", kind: "from" | "to", other: "HH:MM" | "", onConfirm: (hhmm) => … })  → opens over the device screen
 *   TimePicker.wheel(count, initial, ariaLabel, { loop, text }) → { list, value, init() } — the wheel used by the sheet (reused by common/ym-picker.js)
 *     kind/other = 시작·종료 시간 규칙: 종료는 시작보다 늦어야 하고, 시작은 종료보다 빨라야 한다. 어긋나면 컨펌 모달을 띄우고
 *     시트를 닫지 않는다(값은 적용되지 않음). 같은 시각도 허용하지 않는다.
 * 24h wheels, 1-minute steps, endless (00 ↔ 59, 23 ↔ 00 loop). Scroll / drag / click a neighbour to move; 확인 returns "HH:MM"; ✕ or the dim area dismisses.
 * Requires ds/rallyz.browser.js. Styles live in common/onboarding.css (".time-sheet*").
 */
(function () {
  const R = window.Rallyz;
  const ROW = 48;
  const el = (tag, cls, kids = [], attrs = {}) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    n.append(...[].concat(kids).filter((k) => k != null));
    return n;
  };
  const pad = (n) => String(n).padStart(2, "0");

  // Endless wheel: the numbers are rendered REPEAT times and the scroll position is kept in the middle copies,
  // so 00 → 59 (and 23 ↔ 00) loops in both directions.
  const REPEAT = 5, MID = 2;
  // opts.loop=false → a single, non-looping copy (e.g. a year wheel); opts.text(i) → item label (default zero-padded number)
  function wheel(count, initial, label, { loop = true, text = pad } = {}) {
    const rep = loop ? REPEAT : 1, mid = loop ? MID : 0;
    const items = Array.from({ length: count * rep }, (_, i) => el("div", "time-sheet__item", [text(i % count)]));
    const list = el("div", "time-sheet__list", items, { role: "listbox", "aria-label": label });
    const span = count * ROW;
    let abs = mid * count + initial, sel = null;
    const mark = () => {
      abs = Math.max(0, Math.min(items.length - 1, Math.round(list.scrollTop / ROW)));
      if (sel !== abs) { sel?.classList.remove("is-sel"); sel?.setAttribute("aria-selected", "false"); sel = items[abs]; sel.classList.add("is-sel"); sel.setAttribute("aria-selected", "true"); }
    };
    const recenter = () => { // identical content one copy away → jump without a visible change
      if (!loop) return;
      if (list.scrollTop < span) list.scrollTop += span;
      else if (list.scrollTop > span * (REPEAT - 2)) list.scrollTop -= span;
    };
    let t;
    list.addEventListener("scroll", () => { mark(); clearTimeout(t); t = setTimeout(() => { recenter(); mark(); }, 120); });
    items.forEach((it, i) => it.addEventListener("click", () => list.scrollTo({ top: i * ROW, behavior: "smooth" })));
    // mouse drag (touch uses native scrolling)
    let y0 = null, s0 = 0, dragging = false;
    list.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; y0 = e.clientY; s0 = list.scrollTop; dragging = false; });
    list.addEventListener("pointermove", (e) => {
      if (y0 == null) return;
      if (!dragging && Math.abs(e.clientY - y0) > 4) { dragging = true; list.style.scrollSnapType = "none"; list.setPointerCapture(e.pointerId); } // capture only once it's a drag, so plain clicks still reach the items
      if (dragging) { list.scrollTop = s0 - (e.clientY - y0); if (loop && (list.scrollTop < span || list.scrollTop > span * (REPEAT - 2))) { const d = list.scrollTop < span ? span : -span; list.scrollTop += d; s0 += d; } }
    });
    const end = () => { if (y0 == null) return; y0 = null; if (!dragging) return; dragging = false; list.style.scrollSnapType = ""; list.scrollTo({ top: abs * ROW, behavior: "smooth" }); };
    list.addEventListener("pointerup", end); list.addEventListener("pointercancel", end);
    return { list, label, get value() { return abs % count; }, init() { list.scrollTop = abs * ROW; mark(); } };
  }

  const MSG = {
    to: "종료 시간은 시작 시간보다 늦어야 합니다.\n시간을 다시 설정해 주세요.",
    from: "시작 시간은 종료 시간보다 빨라야 합니다.\n시간을 다시 설정해 주세요.",
  };
  const invalid = (kind, v, other) => !!(kind && other) && (kind === "to" ? v <= other : v >= other); // "HH:MM" compares lexicographically

  function open({ value = "", kind, other = "", onConfirm } = {}) {
    const screen = document.querySelector(".rz-device__screen");
    const [h0, m0] = /^\d{1,2}:\d{2}$/.test(value) ? value.split(":").map(Number) : [9, 0];
    const hour = wheel(24, h0, "시간"), minute = wheel(60, m0, "분");
    const close = () => dim.remove();
    const x = el("button", "time-sheet__close", [R.Icon("line/ic24_close-type01", { size: 20, color: "var(--rz-gray-06)" })], { type: "button", "aria-label": "닫기" });
    x.addEventListener("click", close);
    const body = el("div", "time-sheet__body", [
      el("div", "time-sheet__labels", [el("span", "", ["시간"]), el("span", "", ["분"])]),
      el("div", "time-sheet__wheels", [hour.list, minute.list, el("span", "time-sheet__colon", [":"])]),
    ]);
    const footer = el("div", "time-sheet__footer", [R.Button({ label: "확인", size: 56, onClick: () => {
      const v = `${pad(hour.value)}:${pad(minute.value)}`;
      if (invalid(kind, v, other)) { R.showAlert(screen, { message: MSG[kind], messageSize: "small" }); return; }
      close(); onConfirm?.(v);
    } })]);
    const sheet = el("div", "time-sheet", [el("div", "time-sheet__head", ["시간 설정", x]), body, footer], { role: "dialog", "aria-modal": "true", "aria-label": "시간 설정" });
    const dim = el("div", "guide-dim", [sheet]);
    dim.addEventListener("click", (e) => e.target === dim && close());
    screen.append(dim);
    hour.init(); minute.init();
    return dim;
  }

  window.TimePicker = { open, wheel };
})();
