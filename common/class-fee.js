/*
 * 클래스 수강료 (필수) — shared by 클래스 만들기 / 수정 and the onboarding 클래스 만들기 (개선 전·후).
 *   const fee = ClassFee.create(st)   // st: { type: "" | "기간반" | "회차반", fee, perFee, sessions } (strings of digits)
 *   fee.typeField 클래스 유형 radios (필수, 기본값 없음) — put it where the page wants it; fee.slot shows 클래스 수강료 by default (기간반 layout) until 회차반 is chosen
 *   fee.slot      element to place in the page (put it under 수업 일정 — required fields come first)
 *   fee.render()  re-render after st.type changes (기간반 → 클래스 수강료, 회차반 → 1회 수강료 + 수업 회차)
 *   fee.rules     [[ok, message, slot], …] in the same shape as each page's required-field rules → confirm modal when empty
 *   fee.value()   { fee, perFee, sessions } numbers to save (fee = total: 기간반 amount, or 1회 수강료 × 회차)
 * Requires ds/rallyz.browser.js + common/onboarding.js. Styles (.money, .tight-head) live in each page / onboarding.css.
 */
(function () {
  const R = window.Rallyz, { $, field } = window.Onb;
  const num = (v) => Number(String(v).replace(/[^0-9]/g, "")) || 0;

  // right-aligned digits with a unit suffix
  function money(st, key, unit, placeholder) {
    const box = $("label", "rz-input money");
    const input = $("input", "", [], { type: "text", inputmode: "numeric", placeholder, value: st[key] ? num(st[key]).toLocaleString("ko-KR") : null, "aria-label": unit === "원" ? "금액" : "회차" });
    input.addEventListener("input", () => { const n = num(input.value); st[key] = n ? String(n) : ""; input.value = n ? n.toLocaleString("ko-KR") : ""; });
    box.append(input, $("span", "", [unit]));
    return box;
  }

  function create(st) {
    const slot = $("div", "");
    // 클래스 유형 (필수) — no default: the teacher must pick 기간반/회차반; 클래스 수강료 is always shown below it (회차반 swaps it for 1회 수강료 + 수업 회차)
    const typeField = field("클래스 유형", { required: true }, $("div", "radios", ["기간반", "회차반"].map((t) => R.Radio({ label: t, name: "classType", value: t, checked: t === st.type, onChange: (v) => { st.type = v; render(); } }))));
    function render() {
      // 유형을 고르기 전에도 클래스 수강료 입력을 기본으로 보여준다(기간반 모양). 회차반을 고르면 1회 수강료 + 수업 회차로 바뀐다.
      if (st.type === "회차반") {
        slot.replaceChildren(
          field("1회 수강료", { required: true, sub: "수강료는 1회 수강료 X 회차로 자동 계산되며 추후 변경이 가능합니다." }, money(st, "perFee", "원", "0")),
          field("수업 회차", { required: true }, money(st, "sessions", "회", "0")),
        );
      } else {
        // 수강료 불러오기 funnel isn't built → no action
        const f = field("클래스 수강료", { required: true, sub: "설정된 수강료 기준으로 클래스 청구서가 발행되며 추후 변경 가능합니다.", trail: R.Button({ label: "수강료 불러오기", size: "t24", variant: "line", color: "grey" }) }, money(st, "fee", "원", "0"));
        f.classList.add("tight-head");
        slot.replaceChildren(f);
      }
    }
    const rules = [
      [() => st.type, "클래스 유형을 선택하세요.", typeField],
      [() => st.type === "회차반" || num(st.fee), "클래스 수강료를 입력하세요.", slot],
      [() => st.type !== "회차반" || num(st.perFee), "1회 수강료를 입력하세요.", slot],
      [() => st.type !== "회차반" || num(st.sessions), "수업 회차를 입력하세요.", slot],
    ];
    const value = () => ({
      fee: st.type === "회차반" ? num(st.perFee) * num(st.sessions) : num(st.fee),
      perFee: num(st.perFee), sessions: num(st.sessions),
    });
    return { slot, typeField, render, rules, value };
  }

  window.ClassFee = { create, num };
})();
