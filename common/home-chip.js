/* Prototype controls — 지문 패널(목업 왼쪽) 하단에 왼쪽 정렬로 배치, 위에서부터:
 *     ┌ [개선 전 ◯ 개선 후]  ┐   one grouped area
 *     └ [☑ 데이터 초기화]    ┘
 *       [↻ 처음으로] [메인으로] [이전페이지]   ← 한 줄
 *     맨 위의 어코디언 버튼(접기/펼치기)으로 위 컨트롤 전체를 접고 펼친다.
 *     (창이 좁아 지문 패널을 못 그릴 때는 같은 컨트롤을 화면 우하단에 띄운다.)
 *   · 개선 전/후 toggle: shows which version this screen belongs to. Flipping it switches immediately (no modal), switching to the other version's own data (never copied) — 학원이 있으면 그 버전의 홈 화면,
 *     학원이 아직 없으면 그 버전의 온보딩 첫 화면으로.
 *   · 이전페이지: browser back (falls back to the onboarding start when there's no history).
 *   · 메인으로: 데이터는 그대로 두고 이 버전의 메인(홈, home.html)으로 이동.
 *   · ↻ 처음으로: wipes the prototype data and goes to this version's first onboarding screen (index.html).
 *   · 개선 전/후 유형 행: 왼쪽 "유형" 텍스트, 오른쪽 [개선 전/후 토글] 한 행 · 어코디언 영역(한 행): [접기 ………… 설문(맨 오른쪽)], 접히는 버튼 줄: [처음으로 · 메인으로 · 이전페이지 · 데이터 초기화 · 컨벤션] — 지문 패널의 검정 박스 바로 아래. 어코디언과 무관하게 항상 보인다.
 *   · 지문 패널: 목업과 같은 크기(395×832)의 영역을 목업 왼쪽에 잡고, 둘을 한 묶음(.proto-stage)으로 화면 가운데에 정렬한다. 지문(common/scenario.js)은 박스 한 줄씩. 창이 좁으면 패널을 숨기고 목업만 가운데에 둔다.
 *   · 스톱워치: 지문 박스마다 오른쪽에 하나씩(지문별 독립, 개선 전/후 데이터는 따로 쌓인다). NN:NN · 재생 · 일시정지 · 정지(정지하면 그 지문의 버튼이 모두 비활성 + 시간 고정 + "저장됨" 표시). 상태는 sessionStorage(proto.sw.<번호>)에 시각으로 저장해 화면 이동에도 이어지고 처음으로·초기화 전환에서 리셋된다.
 * Mounted automatically as soon as a .rz-device is on the page — a screen only needs this script (after ds/rallyz.browser.js).
 * Self-contained: injects its own styles (some screens — index, onboarding-intro/academy — don't load onboarding.css). */
(function () {
  const R = window.Rallyz;
  const version = location.pathname.split("/").slice(-2, -1)[0] === "before" ? "before" : "after";
  const other = version === "before" ? "after" : "before";
  // 시나리오(1|2): 데이터·스톱워치·컨벤션 회차를 시나리오마다 완전히 따로 쓴다 — 칸 이름(slot) = 버전 (+ "-s2")
  const SCN = (() => { try { return ["1", "2", "3"].includes(sessionStorage.getItem("proto.scn")) ? sessionStorage.getItem("proto.scn") : "1"; } catch { return "1"; } })();
  const slotOf = (v) => v + (SCN === "1" ? "" : "-s" + SCN);
  const slot = slotOf(version), otherSlot = slotOf(other);
  const entryOf = (v) => (SCN !== "1" ? new URL(`../${v}/home.html`, location.href).href : startOf(v)); // 시나리오2 는 학원이 이미 있는 상태로 시작 → 홈
  const startOf = (v) => new URL(`../${v}/index.html`, location.href).href;
  const SWKEY = "proto.sw"; // 지문별 스톱워치 상태 proto.sw.<버전>.<번호> — 개선 전/후가 따로 쌓인다 (rz.* 가 아니라 화면 이동에도 유지, 처음으로·초기화 전환에서만 리셋)
  // 한 칸(버전×시나리오)의 데이터·임시 값·스톱워치·회차 키를 지운다 — 다른 칸은 건드리지 않는다.
  const wipeSlots = (slots) => { try { Object.keys(sessionStorage).filter((k) => slots.some((s) => k === `rz.data.${s}` || k.startsWith(`rz.${s}.`) || k.startsWith(`${SWKEY}.${s}.`) || k === `proto.sess.${s}`)).forEach((k) => sessionStorage.removeItem(k)); } catch { /* private mode */ } };
  const wipe = () => wipeSlots([slot, otherSlot]); // 처음으로: 지금 시나리오의 개선 전/후 둘 다(다른 시나리오는 그대로)

  const SELF = document.currentScript && document.currentScript.src;
  const CSS = `
.proto-stage { display: flex; align-items: flex-start; gap: 32px; }
.proto-left { flex: none; display: flex; align-items: flex-start; gap: 12px; height: 832px; }
.proto-left[hidden] { display: none; }
.proto-sw { flex: none; width: 148px; align-self: center; box-sizing: border-box; padding-left: 14px; border-left: 1px solid var(--rz-gray-02); display: flex; flex-direction: column; align-items: center; gap: 8px; font-family: var(--rz-font-sans); }
.proto-sw__time { font: 700 24px/28px var(--rz-font-sans); font-variant-numeric: tabular-nums; color: var(--rz-black); letter-spacing: 0; }
.proto-sw.is-stopped .proto-sw__time { color: var(--rz-gray-05); }
.proto-sw__saved { display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 8px; border-radius: 10px; background: var(--rz-green-01); color: var(--rz-primary); font: var(--rz-type-small01-bold); visibility: hidden; }
.proto-sw.is-stopped .proto-sw__saved { visibility: visible; }
.proto-sw__pad { height: 20px; flex: none; visibility: hidden; } /* "저장됨" 배지와 같은 높이의 위쪽 여백 — 시간·버튼이 행 세로 가운데에 오도록 균형을 맞춘다 */
.proto-sw__btns { display: flex; flex-wrap: nowrap; gap: 6px; }
.proto-sw__btn { width: 24px; height: 24px; border: 0; border-radius: 50%; background: var(--rz-gray-02); padding: 0; display: grid; place-items: center; cursor: pointer; }
.proto-sw__btn--play { background: var(--rz-primary); }
.proto-sw__btn--stop { background: #FF3434; }
.proto-sw__btn--reset { background: var(--rz-white); box-shadow: inset 0 0 0 1px var(--rz-gray-04); }
.proto-sw__btn:disabled { opacity: 0.35; cursor: not-allowed; }
.proto-sw__btn:focus-visible { outline: 2px solid var(--rz-primary); outline-offset: 2px; }
.proto-scn { flex: none; width: 800px; height: 832px; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; scrollbar-width: none; font-family: var(--rz-font-sans); }
.proto-scn::-webkit-scrollbar { display: none; }
.proto-scn > :first-child { margin-top: auto; } /* 지문 영역 안의 내용 묶음을 세로 가운데에 둔다(내용이 넘치면 위에서부터 스크롤) */
.proto-scn > :last-child { margin-bottom: auto; }
.proto-scn[hidden] { display: none; }
.proto-scn__intro { flex: none; border-radius: 16px; background: var(--rz-gray-07); padding: 20px 24px; color: var(--rz-white); font: var(--rz-type-body01-regular); line-height: 24px; }
.proto-scn__intro p { margin: 0; white-space: pre-line; } /* 지문의 \n 줄바꿈 반영 */
.proto-scn__intro p.is-item { white-space: nowrap; } /* 1~3번 지령은 줄바꿈 없이 한 줄 */
.proto-scn__intro p:nth-child(2) { margin-bottom: 24px; } /* 상황 설명과 "아래의 지령…" 사이 한 줄 띄움 */
.proto-scn__intro p:first-child { font: var(--rz-type-headline-bold); margin-bottom: 8px; }
.proto-scn__list { flex: none; margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
.proto-scn__row { display: flex; gap: 12px; align-items: center; border-radius: 12px; background: var(--rz-white); box-shadow: inset 0 0 0 1px var(--rz-gray-03); padding: 16px 18px; font: var(--rz-type-headline-bold); color: var(--rz-black); line-height: 30px; }
.proto-scn__no { flex: none; min-width: 26px; font: var(--rz-type-headline-bold); color: var(--rz-black); }
.proto-ctl { margin-top: 0; flex: none; display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
.proto-ctl--float { position: fixed; right: 32px; bottom: 32px; z-index: 200; margin-top: 0; align-items: flex-end; }
.proto-ctl.is-collapsed > .proto-ctl__btns { display: none; } /* 접히는 건 버튼 줄뿐 — 유형 행은 어코디언의 영향을 받지 않는다 */
.proto-accrow { display: flex; gap: 8px; align-items: center; flex: none; }
.proto-conv { display: inline-flex; align-items: center; gap: 4px; height: 32px; padding: 0 14px; border-radius: 16px; background: var(--rz-white); box-shadow: inset 0 0 0 1px var(--rz-gray-03); color: var(--rz-gray-06); text-decoration: none; font: var(--rz-type-small01-medium); white-space: nowrap; }
.proto-refresh { display: inline-flex; align-items: center; gap: 4px; height: 32px; padding: 0 14px 0 10px; border: 0; border-radius: 16px; background: var(--rz-white); box-shadow: inset 0 0 0 1px var(--rz-gray-03); cursor: pointer; font: var(--rz-type-small01-medium); color: var(--rz-gray-06); white-space: nowrap; }
.proto-refresh:focus-visible { outline: 2px solid var(--rz-primary); outline-offset: 2px; }
.proto-survey { margin-left: auto; display: inline-flex; align-items: center; gap: 4px; height: 32px; padding: 0 14px; border-radius: 16px; background: var(--rz-gray-07); color: var(--rz-white); text-decoration: none; font: var(--rz-type-small01-bold); white-space: nowrap; } /* 설문: 상단 검정 박스와 같은 배경 + 흰 글자, 어코디언 행의 맨 오른쪽 */
.proto-survey:focus-visible { outline: 2px solid var(--rz-primary); outline-offset: 2px; }
.proto-conv:focus-visible { outline: 2px solid var(--rz-primary); outline-offset: 2px; }
.proto-acc { display: inline-flex; align-items: center; justify-content: center; gap: 4px; height: 32px; padding: 0 14px 0 10px; border: 0; border-radius: 16px; background: var(--rz-white); box-shadow: inset 0 0 0 1px var(--rz-gray-03); cursor: pointer; font: var(--rz-type-small01-medium); color: var(--rz-gray-06); }
.proto-acc:focus-visible { outline: 2px solid var(--rz-primary); outline-offset: 2px; }
.proto-ctl__group { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 10px 16px; border-radius: 12px; background: var(--rz-white); box-shadow: inset 0 0 0 1px var(--rz-gray-03); font-family: var(--rz-font-sans); }
.proto-ctl__scn { flex: none; width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 10px 16px; border-radius: 12px; background: var(--rz-white); box-shadow: inset 0 0 0 1px var(--rz-gray-03); font-family: var(--rz-font-sans); } /* 시나리오 행: 유형 행 바로 아래, 칩으로 시나리오 선택(지금은 시나리오1 하나) */
.proto-ctl__scn-chips { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.proto-roster { position: fixed; z-index: 300; box-sizing: border-box; max-width: calc(100vw - 16px); max-height: calc(100vh - 120px); overflow: auto; border-radius: 16px; background: var(--rz-white); box-shadow: 0 8px 32px rgba(0,0,0,0.18), inset 0 0 0 1px var(--rz-gray-03); font-family: var(--rz-font-sans); } /* 툴팁: 학생명단 버튼 바로 위에 뜬다 */
.proto-roster[hidden] { display: none; }
.proto-roster__head { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 16px 12px 20px; }
.proto-roster__title { margin: 0; font: var(--rz-type-body01-bold); color: var(--rz-black); }
.proto-roster__x { width: 32px; height: 32px; border: 0; border-radius: 50%; background: transparent; padding: 0; display: grid; place-items: center; cursor: pointer; }
.proto-roster__x:focus-visible { outline: 2px solid var(--rz-primary); outline-offset: 2px; }
.proto-roster__body { padding: 0 20px 20px; }
.proto-roster table { border-collapse: collapse; white-space: nowrap; font: var(--rz-type-small01-regular); color: var(--rz-black); }
.proto-roster th, .proto-roster td { border: 1px solid var(--rz-gray-03); padding: 8px 12px; text-align: left; }
.proto-roster th { background: var(--rz-gray-01); font: var(--rz-type-small01-bold); }
.proto-ctl__label { font: var(--rz-type-body02-bold); color: var(--rz-gray-07); }
.proto-ctl__right { display: flex; align-items: center; gap: 16px; }
.proto-ctl__ver { display: flex; align-items: center; gap: 8px; font: var(--rz-type-small01-regular); color: var(--rz-gray-05); }
.proto-ctl__ver .is-on { font: var(--rz-type-small01-bold); color: var(--rz-black); }
.proto-ctl__btns { display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 8px; }
.proto-ctl__chip { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; white-space: nowrap; }
.proto-ctl__chip:focus-visible { outline: 2px solid var(--rz-primary); outline-offset: 2px; }
`;
  function injectStyle() {
    if (document.getElementById("proto-ctl-style")) return;
    const st = document.createElement("style"); st.id = "proto-ctl-style"; st.textContent = CSS; document.head.append(st);
  }

  function mount() {
    injectStyle();
    if (document.querySelector(".proto-ctl")) return;
    const asButton = (chip, fn) => {
      chip.classList.add("proto-ctl__chip");
      chip.setAttribute("role", "button"); chip.tabIndex = 0;
      chip.addEventListener("click", fn);
      chip.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } });
      return chip;
    };
    const mk = (tag, cls, kids = []) => { const n = document.createElement(tag); n.className = cls; n.append(...kids); return n; };

    // 개선 전/후 toggle: off = 개선 전, on = 개선 후
    //  · 전환은 확인창 없이 바로: 지금 데이터를 전환할 버전으로 그대로 가져가 홈 화면으로 이동한다(학원이 아직 없으면 온보딩 첫 화면으로).
    const goKeep = () => {
      // 개선 전/후 데이터는 서로 섞이지 않는다 — 전환해도 복사하지 않고, 전환할 버전이 가진 자기 데이터를 그대로 쓴다.
      // 그 버전에 학원이 이미 있으면 홈 화면으로, 아직 없으면 온보딩 첫 화면으로 이동한다.
      let hasAcademy = false;
      try { const raw = sessionStorage.getItem(`rz.data.${otherSlot}`); hasAcademy = !!(raw && JSON.parse(raw).academy); } catch { /* private mode */ }
      location.href = hasAcademy ? new URL(`../${other}/home.html`, location.href).href : entryOf(other);
    };
    // 시나리오 칩: 시나리오를 바꾸면 그 시나리오·같은 유형(개선 전/후)의 자기 데이터로 간다(학원이 있으면 홈, 없으면 온보딩 첫 화면).
    const switchScn = (k) => {
      if (k === SCN) return;
      try { sessionStorage.setItem("proto.scn", k); } catch { /* private mode */ }
      if (k !== "1" && window.RzData) window.RzData.seed2(); // 시나리오2 는 학원만 있는 상태로 시작
      const target = version + (k === "1" ? "" : "-s" + k);
      let has = false;
      try { const raw = sessionStorage.getItem(`rz.data.${target}`); has = !!(raw && JSON.parse(raw).academy); } catch { /* private mode */ }
      location.href = has ? new URL(`../${version}/home.html`, location.href).href : startOf(version);
    };
    const toggle = R.Toggle({ on: version === "after", label: "개선 전/후", onChange: goKeep });
    const ver = mk("div", "proto-ctl__ver", [mk("span", version === "before" ? "is-on" : "", ["개선 전"]), toggle, mk("span", version === "after" ? "is-on" : "", ["개선 후"])]);
    // 데이터 초기화: 지금 보고 있는 버전(개선 전/후)의 입력 데이터·스톱워치만 지우고 그 버전의 온보딩부터 다시 시작한다(다른 버전의 데이터는 그대로). 처음으로는 두 버전 모두 지운다.
    const resetBtn = asButton(R.Chip({ label: "데이터 초기화", size: "regular", type: "type02-line" }), () => {
      R.showAlert(document.querySelector(".rz-device__screen"), {
        message: "데이터를 초기화 하시겠어요?", // 시나리오1·2, 개선 전/후 문구 동일
        cancelLabel: "아니오", confirmLabel: "예",
        onConfirm: () => {
          wipeSlots([slot]); // 지금 시나리오·지금 유형(버전)만 — 같은 시나리오의 다른 유형이나 다른 시나리오는 그대로
          location.href = entryOf(version);
        },
      });
    });

    // 시나리오 행: 유형 행 하단. 지금 적용된 지문 세트가 시나리오1이다 — 시나리오가 늘면 칩만 추가한다.
    const scnRow = mk("div", "proto-ctl__scn", [mk("div", "proto-ctl__scn-chips", [["1", "시나리오1"], ["2", "시나리오2"], ["3", "시나리오3"]].map(([k, l]) => asButton(R.Chip({ label: l, size: "regular", type: k === SCN ? "type01-solid" : "type02-line" }), () => switchScn(k)))), ver]) // 왼쪽 시나리오 칩, 오른쪽 개선 전/후 토글(흰 박스 + 여백);
    // 학생명단: 누르면 표 팝업이 뜬다. 마우스가 표를 벗어나도 닫히지 않고, 버튼을 다시 누르거나 팝업의 X를 눌러야만 닫힌다.
    let roster = null;
    const place2 = () => { // 툴팁 위치: 버튼 위쪽에 붙이고, 화면 밖으로 나가지 않게 가로만 보정
      if (!roster || roster.hidden) return;
      const b = rosterBtn.getBoundingClientRect(), pane = document.querySelector(".proto-scn");
      const pr = pane && !pane.closest("[hidden]") ? pane.getBoundingClientRect() : null; // 지문 영역에 딱 맞춘다(목업을 가리지 않게)
      if (pr && pr.width) { roster.style.left = pr.left + "px"; roster.style.width = pr.width + "px"; roster.style.maxWidth = pr.width + "px"; }
      else { roster.style.width = ""; roster.style.maxWidth = ""; roster.style.left = Math.max(8, Math.min(b.left, window.innerWidth - roster.offsetWidth - 8)) + "px"; }
      roster.style.bottom = (window.innerHeight - b.top + 8) + "px";
    };
    window.addEventListener("resize", place2);
    const setRoster = (o) => { if (roster) { roster.hidden = !o; place2(); } rosterBtn.setAttribute("aria-pressed", String(o)); };
    const rosterBtn = asButton(R.Chip({ label: "학생명단", size: "regular", type: "type02-line" }), () => {
      const rosterData = window.RZ_ROSTER; // 지문 스크립트(scenario.js)가 나중에 불러와지므로 누를 때 읽는다
      if (!rosterData) return;
      if (!roster) {
        const tbl = document.createElement("table");
        const thead = tbl.createTHead().insertRow(); rosterData.head.forEach((h) => { const th = document.createElement("th"); th.textContent = h; thead.append(th); });
        const tb = tbl.createTBody(); rosterData.rows.forEach((r) => { const tr = tb.insertRow(); r.forEach((c) => { tr.insertCell().textContent = c; }); });
        const x = mk("button", "proto-roster__x", []); x.type = "button"; x.setAttribute("aria-label", "닫기"); x.append(R.Icon("line/ic24_close-type01", { size: 20, color: "var(--rz-gray-07)" }));
        x.addEventListener("click", () => setRoster(false));
        roster = mk("div", "proto-roster", [mk("div", "proto-roster__head", [mk("h2", "proto-roster__title", ["학생명단"]), x]), mk("div", "proto-roster__body", [tbl])]);
        roster.setAttribute("role", "region"); roster.setAttribute("aria-label", "학생명단");
        document.body.append(roster); setRoster(true); return;
      }
      setRoster(roster.hidden);
    });
    rosterBtn.setAttribute("aria-pressed", "false");
    const back = asButton(R.Chip({ label: "이전페이지", size: "regular", type: "type02-line" }), () => (history.length > 1 ? history.back() : (location.href = entryOf(version))));
    const main = asButton(R.Chip({ label: "메인으로", size: "regular", type: "type02-line" }), () => { location.href = new URL("./home.html", location.href).href; });
    const first = R.Chip({ label: "처음으로", size: "regular", type: "type02-line" });
        asButton(first, () => { wipe(); location.href = entryOf(version); });

    // 지문 패널 하단 왼쪽 정렬: [개선 전/후 + 데이터 초기화] 위, 그 아래 한 줄로 [처음으로 · 메인으로 · 이전페이지]. 패널을 못 그릴 때(좁은 창)는 우하단에 띄운다.
    // 어코디언: 접으면 아래 컨트롤(개선 전/후·데이터 초기화·버튼 줄)을 숨기고, 펼치면 보인다. 상태는 새로고침·화면 이동에도 유지(데이터 초기화와 무관한 키).
    const KEY = "proto.ctl.open";
    let open = true;
    try { open = sessionStorage.getItem(KEY) !== "0"; } catch { /* private mode */ }
    const ctl = mk("div", "proto-ctl proto-ctl--float" + (open ? "" : " is-collapsed"), []);
    const acc = mk("button", "proto-acc", []);
    acc.type = "button";
    const paintAcc = () => { const o = !ctl.classList.contains("is-collapsed"); acc.setAttribute("aria-expanded", String(o)); acc.replaceChildren(R.Icon(o ? "glyph/chevron-up" : "glyph/chevron-down", { size: 16, color: "var(--rz-gray-05)" }), o ? "접기" : "펼치기"); };
    acc.addEventListener("click", () => { const o = ctl.classList.contains("is-collapsed"); ctl.classList.toggle("is-collapsed", !o); document.querySelector(".proto-scn")?.classList.toggle("is-collapsed", !o); paintAcc(); try { sessionStorage.setItem(KEY, o ? "1" : "0"); } catch { /* private mode */ } });
    paintAcc();
    // 어코디언 옆 "컨벤션" 버튼: 컨벤션 메인(루트 index.html)을 새 창으로 연다.
    const conv = document.createElement("a");
    conv.className = "proto-conv"; conv.textContent = "컨벤션 ↗"; conv.target = "_blank"; conv.rel = "noopener";
    const convBase = new URL("../index.html", location.href).href; // 컨벤션 메인 = 루트 index(디자인 시스템 링크가 있는 첫 화면)
    conv.href = convBase;
    // 열기 직전에 지금까지 저장된 기록(localStorage + 이 탭 사본)을 주소(#conv=…)에 실어 보낸다 — 컨벤션 창과 저장소가 공유되지 않는 환경에서도 기록이 보이게 한다.
    const carry = () => {
      try {
        const sessions = mergeSessions(readConv(localStorage, CONV), readConv(sessionStorage, CONVS));
        conv.href = sessions.length ? `${convBase}#conv=${encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(sessions)))))}` : convBase;
      } catch { conv.href = convBase; }
    };
    ["pointerdown", "keydown", "focus", "mouseenter", "click"].forEach((ev) => conv.addEventListener(ev, carry));
    // 설문: 구글 폼을 새 창으로 연다. 어코디언 행의 맨 오른쪽.
    const survey = document.createElement("a");
    survey.className = "proto-survey"; survey.textContent = "설문 ↗"; survey.target = "_blank"; survey.rel = "noopener";
    survey.href = "https://docs.google.com/forms/d/e/1FAIpQLScjuuVUFlRsiGIU6R6Gzyr2xedUqhm8d0yOV-hbNvhBz-JQ1w/viewform";
    // 새로고침: 접히는 영역(버튼 줄)의 가장 왼쪽. 지금 화면을 다시 불러온다.
    const refresh = mk("button", "proto-refresh", ["새로고침"]);
    refresh.type = "button";
    refresh.prepend(R.Icon("line/ic24_initialization01", { size: 16, color: "var(--rz-gray-06)" })); // 새로고침: 순환(초기화) 아이콘
    refresh.addEventListener("click", () => location.reload());
    const accRow = mk("div", "proto-accrow", [acc, rosterBtn, survey]); // 접기 ………… 설문 (어코디언 영역, 한 행)
    ctl.append(accRow, scnRow, mk("div", "proto-ctl__btns", [refresh, first, main, back, resetBtn, conv])); // 접히는 영역(버튼 줄): 새로고침이 가장 왼쪽
    ctl._acc = accRow;
    ctl._group = scnRow; // 유형 행은 없애고 개선 전/후 토글은 시나리오 행으로 옮겼다
    document.body.append(ctl);
  }
  /* ---------- 지문 패널 ---------- */
  const LEFT_W = 800; // 지문 영역 너비(지문 박스마다 오른쪽에 스톱워치가 붙어 목업(395)보다 넓다)
  /* 스톱워치: NN:NN(분:초) · 재생 · 일시정지 · 정지. 정지하면 모든 버튼이 비활성화되고 시간이 멈춘다(처음으로로만 리셋). 시각 기반이라 화면 이동에도 이어진다. */
  function stopwatch(idx) {
    const KEY = `${SWKEY}.${slot}.${idx}`; // 버전별 분리
    const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || "null") || { st: "idle", acc: 0, t0: 0 }; } catch { return { st: "idle", acc: 0, t0: 0 }; } };
    const save = (o) => { try { sessionStorage.setItem(KEY, JSON.stringify(o)); } catch { /* private mode */ } };
    const ms = (o) => o.acc + (o.st === "running" ? Date.now() - o.t0 : 0);
    const fmt = (n) => { const t = Math.floor(n / 1000), m = Math.floor(t / 60), sec = t % 60; return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`; };
    const NS = "http://www.w3.org/2000/svg";
    const ico = (kind) => {
      const svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "0 0 16 16"); svg.setAttribute("width", "11"); svg.setAttribute("height", "11"); svg.setAttribute("aria-hidden", "true");
      const f = (el) => { el.setAttribute("fill", "#fff"); svg.append(el); };
      const mk = (tag, attrs) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); return e; };
      if (kind === "play") f(mk("path", { d: "M4.5 2.5v11l9-5.5z" }));
      if (kind === "pause") { f(mk("rect", { x: 3.5, y: 2.5, width: 3, height: 11, rx: 0.8 })); f(mk("rect", { x: 9.5, y: 2.5, width: 3, height: 11, rx: 0.8 })); }
      if (kind === "stop") f(mk("rect", { x: 3, y: 3, width: 10, height: 10, rx: 1.6 }));
      if (kind === "reset") { const g = mk("path", { d: "M13 8a5 5 0 1 1-1.6-3.7M13 2.5v3h-3", fill: "none", stroke: "#646976", "stroke-width": "1.6", "stroke-linecap": "round", "stroke-linejoin": "round" }); svg.append(g); }
      return svg;
    };
    const box = document.createElement("div"); box.className = "proto-sw"; box.setAttribute("role", "timer"); box.setAttribute("aria-label", `지문 ${idx + 1} 스톱워치`);
    const time = document.createElement("span"); time.className = "proto-sw__time";
    const btn = (kind, name) => { const b = document.createElement("button"); b.type = "button"; b.className = `proto-sw__btn proto-sw__btn--${kind}`; b.setAttribute("aria-label", name); b.title = name; b.append(ico(kind)); return b; };
    const play = btn("play", "재생"), pause = btn("pause", "일시정지"), stop = btn("stop", "정지"), reset = btn("reset", "초기화");
    const row = document.createElement("div"); row.className = "proto-sw__btns"; row.append(play, pause, stop, reset);
    const saved = document.createElement("span"); saved.className = "proto-sw__saved"; saved.textContent = "✓ 저장됨"; // 정지하면 그 지문의 시간이 저장된다
    const pad = document.createElement("span"); pad.className = "proto-sw__pad"; pad.setAttribute("aria-hidden", "true");
    box.append(pad, time, row, saved);
    pause.style.background = "var(--rz-gray-06)";
    const paint = () => {
      const o = load();
      time.textContent = fmt(ms(o));
      box.classList.toggle("is-running", o.st === "running"); box.classList.toggle("is-stopped", o.st === "stopped");
      play.disabled = o.st === "running" || o.st === "stopped";
      pause.disabled = o.st !== "running";
      stop.disabled = o.st === "idle" || o.st === "stopped";
      reset.disabled = o.st === "idle"; // 초기화: 시작한 뒤(진행·일시정지·정지)에는 언제든 가능
    };
    play.addEventListener("click", () => { const o = load(); save({ st: "running", acc: o.acc, t0: Date.now() }); paint(); });
    pause.addEventListener("click", () => { const o = load(); save({ st: "paused", acc: ms(o), t0: 0 }); paint(); });
    stop.addEventListener("click", () => { const o = load(), total = ms(o); save({ st: "stopped", acc: total, t0: 0 }); record(idx, total); paint(); }); // 정지: 시간 고정 + 전 버튼 비활성
    reset.addEventListener("click", () => { save({ st: "idle", acc: 0, t0: 0 }); unrecord(idx); paint(); }); // 00:00 으로 되돌리고 저장된 시간도 지운다
    paint();
    setInterval(paint, 250);
    return box;
  }
  /* 컨벤션 기록: 정지로 저장된 지문별 시간을 localStorage("proto.conv")에 쌓는다(새 창으로 여는 컨벤션 페이지에서 표로 조회). 회차 = "처음으로" 사이의 한 번의 진행. */
  const CONV = "proto.conv", CONVS = "proto.convs"; // CONV = localStorage(컨벤션 창과 공유), CONVS = sessionStorage 사본(저장소가 창마다 분리되는 환경에서 URL로 넘기기 위한 예비)
  const readConv = (store, key) => { try { return JSON.parse(store.getItem(key) || '{"sessions":[]}').sessions || []; } catch { return []; } };
  const writeConv = (store, key, sessions) => { try { store.setItem(key, JSON.stringify({ sessions })); } catch { /* storage blocked */ } };
  function mergeSessions(a, b) { const m = new Map(); [...a, ...b].forEach((x) => { const o = m.get(x.id); if (!o) m.set(x.id, { ...x, times: { ...x.times } }); else { o.times = { ...o.times, ...x.times }; o.at = Math.max(o.at || 0, x.at || 0); } }); return [...m.values()]; }
  function record(idx, msVal) {
    let id; const SK = `proto.sess.${slot}`; // 컨벤션 회차도 버전별로 따로 쌓는다
    try { id = sessionStorage.getItem(SK); if (!id) { id = String(Date.now()); sessionStorage.setItem(SK, id); } } catch { id = "tab"; }
    [[localStorage, CONV], [sessionStorage, CONVS]].forEach(([store, key]) => {
      try {
        const sessions = readConv(store, key);
        let sess = sessions.find((x) => x.id === id);
        if (!sess) { sess = { id, version, scenario: SCN, times: {} }; sessions.push(sess); }
        sess.times[idx + 1] = msVal; sess.at = Date.now();
        writeConv(store, key, sessions);
      } catch { /* storage blocked */ }
    });
  }
  function unrecord(idx) { // 초기화하면 그 지문의 저장된 컨벤션 기록도 지운다
    let id; try { id = sessionStorage.getItem(`proto.sess.${slot}`); } catch { return; }
    [[localStorage, CONV], [sessionStorage, CONVS]].forEach(([store, key]) => {
      try {
        let sessions = readConv(store, key);
        const sess = sessions.find((x) => x.id === id);
        if (!sess) return;
        delete sess.times[idx + 1];
        if (!Object.keys(sess.times).length) sessions = sessions.filter((x) => x !== sess);
        writeConv(store, key, sessions);
      } catch { /* storage blocked */ }
    });
  }
  let scnStarted = false;
  function mountScenario() {
    const dev = document.querySelector(".rz-device");
    if (!dev || scnStarted || document.querySelector(".proto-scn")) return;
    scnStarted = true; // 한 번만 시작(스크립트 로딩 중 MutationObserver가 다시 부르지 않게)
    const draw = () => {
      const sc = window.RZ_SCENARIO;
      if (!sc || document.querySelector(".proto-scn")) return;
      const el = document.createElement("aside");
      el.className = "proto-scn"; el.setAttribute("aria-label", "지문");
      const intro = document.createElement("div"); intro.className = "proto-scn__intro";
      (sc.intro || []).forEach((t) => { const p = document.createElement("p"); p.textContent = t; if (/^\d\.\s/.test(t)) p.className = "is-item"; intro.append(p); });
      const list = document.createElement("ol"); list.className = "proto-scn__list";
      (sc.steps || []).forEach((t, i) => {
        const li = document.createElement("li"); li.className = "proto-scn__row";
        const no = document.createElement("span"); no.className = "proto-scn__no"; no.textContent = `${i + 1}.`;
        const tx = document.createElement("span"); tx.textContent = t;
        const txw = document.createElement("div"); txw.style.cssText = "flex:1;min-width:0;display:flex;gap:12px;align-items:center"; txw.append(no, tx);
        li.append(txw, stopwatch(i)); list.append(li);
      });
      el.append(intro, list);
      const ctl = document.querySelector(".proto-ctl");
      const acc = ctl && ctl._acc, group = ctl && ctl._group;
      el.classList.toggle("is-collapsed", !!ctl && ctl.classList.contains("is-collapsed"));
      // 지문 패널 + 목업을 한 묶음(.proto-stage)으로 가운데 정렬. 폭이 모자라면 패널을 숨기고 목업만 가운데에 둔다.
      const stage = dev.parentElement;
      // 브라우저 크기에 맞춰 (지문 영역 + 목업) 묶음을 같은 비율로 줄인다: 높이 832px + 위아래 여백 80px 기준, 지문이 보일 때는 폭(395×2+32)도 본다. 확대는 하지 않는다(최대 1).
      const fit = (room) => {
        const z = Math.min(1, (window.innerHeight - 80) / 832, (window.innerWidth - 32) / (room ? LEFT_W + 32 + 395 : 395));
        stage.style.zoom = z < 1 ? String(Math.max(0.4, z)) : "";
      };
      stage.classList.add("proto-stage");
      // 지문 영역(560px): 지문 박스마다 오른쪽에 스톱워치. 스톱워치만큼 목업보다 넓다.
      const left = document.createElement("div");
      left.className = "proto-left";
      left.append(el);
      stage.insertBefore(left, dev);
      const place = () => {
        const room = window.innerWidth >= LEFT_W + 32 + 395 + 32;
        left.hidden = !room;
        stage.classList.toggle("proto-stage", room);
        // 어코디언은 지문 바로 아래, 접고 펼치는 컨트롤은 패널 하단. 패널이 없으면 컨트롤을 우하단에 띄우고 어코디언은 그 맨 위에 둔다.
        if (ctl) {
          const btns = ctl.querySelector(".proto-ctl__btns");
          if (room) { // 구분·토글·데이터 초기화 한 행은 검정 박스 바로 아래(지문 위), 어코디언과 버튼 줄은 지문 아래
            el.insertBefore(group, list); el.append(acc || "", ctl); ctl.classList.remove("proto-ctl--float");
          } else { document.body.append(ctl); ctl.classList.add("proto-ctl--float"); ctl.insertBefore(group, btns); if (acc) ctl.prepend(acc); }
        }
        fit(room);
      };
      place(); window.addEventListener("resize", place); window.addEventListener("load", place);
    };
    if (window.RZ_SCENARIO) draw();
    else if (SELF) { const sc = document.createElement("script"); sc.src = new URL("scenario.js?v=26", SELF).href; sc.onload = draw; document.head.append(sc); }
  }
  /* "Tokens & Components" 링크: 시나리오1은 시작 화면(index)에 있다. 시나리오2·3 은 홈에서 시작하므로 홈에도 같은 링크를 띄운다. */
  function mountDsLink() {
    if (!/\/home\.html$/.test(location.pathname) || document.querySelector(".ds-link") || !document.body) return;
    const a = document.createElement("a");
    a.className = "ds-link"; a.href = "../ds/showcase.html"; a.textContent = "Tokens & Components";
    a.style.cssText = "position:fixed;top:16px;right:16px;z-index:50;padding:8px 12px;border-radius:999px;font:var(--rz-type-small01-regular);color:var(--rz-gray-06);text-decoration:none;background:color-mix(in srgb, var(--rz-white) 85%, transparent)";
    document.body.append(a);
  }
  const scan = () => { mountDsLink(); if (document.querySelector(".rz-device")) { mount(); mountScenario(); } };
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", scan);
})();
