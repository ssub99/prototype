/*
 * 청구년/월 설정 bottom sheet (year / month wheels) — Figma: 청구서 개선 (351:151124)
 *   YmPicker.open({ year, month, onConfirm: (year, month) => … })  → opens over the device screen
 * Year wheel is a short non-looping list (selected year ±1), month wheel loops 01…12. Wheels/sheet styles come from
 * common/time-picker.js + common/onboarding.css (".time-sheet*"). The keyboard (직접 입력) button has no design → no action.
 * Requires ds/rallyz.browser.js + common/time-picker.js.
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

  function open({ year, month, onConfirm } = {}) {
    const screen = document.querySelector(".rz-device__screen");
    const years = [year - 1, year, year + 1];
    const yw = TimePicker.wheel(3, 1, "년", { loop: false, text: (i) => String(years[i]) });
    const mw = TimePicker.wheel(12, month - 1, "월", { text: (i) => pad(i + 1) });
    const close = () => dim.remove();
    const kb = el("button", "ym-sheet__kb", [R.Icon("solid/ic24_keyboard", { size: 24 })], { type: "button", "aria-label": "직접 입력" });
    const body = el("div", "time-sheet__body ym-sheet__body", [
      kb,
      el("div", "time-sheet__labels", [el("span", "", ["년"]), el("span", "", ["월"])]),
      el("div", "time-sheet__wheels", [yw.list, mw.list]),
    ]);
    const footer = el("div", "time-sheet__footer", [R.Button({ label: "확인", size: 56, onClick: () => { close(); onConfirm?.(years[yw.value], mw.value + 1); } })]);
    const sheet = el("div", "time-sheet ym-sheet", [el("div", "time-sheet__head", ["청구년/월 설정"]), body, footer], { role: "dialog", "aria-modal": "true", "aria-label": "청구년/월 설정" });
    const dim = el("div", "guide-dim", [sheet]);
    dim.addEventListener("click", (e) => e.target === dim && close());
    screen.append(dim);
    yw.init(); mw.init();
    return dim;
  }

  window.YmPicker = { open };
})();
