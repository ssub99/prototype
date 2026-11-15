/*
 * 피드 데이터 + 공용 조각 (feed.html · feed-write.html · feed-detail.html). Requires ds/rallyz.browser.js + common/data.js.
 *   RzData.feeds = [{ id, klass, content, tags[], at, author:{name,role}, targets:[{key,name,role}], readers:{ key: ts },
 *                     reactions:[{ key, name, role, emoji(1~5) }], comments:[{ id, parent, name, role, text, secret, at, deleted, mine }] }]
 *   읽은 사람: 프로토타입에는 학생·보호자 쪽 사용자가 없어, 글을 등록할 때 조회 대상(그 클래스 학생 + 보호자) 중 일부가 "읽은" 것으로 모의 데이터를 만든다.
 *   Feed.me() = 학원장(학원명에서 "학원"을 뺀 이름 + 원장). 이미지·파일·조회 대상 선택은 구현하지 않는다(글만).
 */
(function () {
  const R = window.Rallyz;
  const pad = (n) => String(n).padStart(2, "0");
  const el = (tag, cls, kids = [], attrs = {}) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
    n.append(...[].concat(kids).filter((k) => k != null));
    return n;
  };
  const fmtDate = (ts) => { const d = new Date(ts), h = d.getHours(); return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${h < 12 ? "오전" : "오후"} ${pad(h % 12 || 12)}:${pad(d.getMinutes())}`; };
  const all = () => (RzData.get().feeds || []).slice().sort((a, b) => b.at - a.at);
  const get = (id) => (RzData.get().feeds || []).find((f) => String(f.id) === String(id));
  const update = (id, fn) => RzData.update((d) => { const f = (d.feeds || []).find((x) => String(x.id) === String(id)); if (f) fn(f); });
  const me = () => ({ name: `${(RzData.get().academy?.name || "").replace(/\s*학원$/, "")}원장`, role: "학원장" });
  const academy = () => RzData.get().academy?.name || "";

  function targetsFor(klass) {
    const out = [];
    RzData.get().students.forEach((s, sid) => {
      if (klass && s.klass !== klass) return;
      out.push({ key: `s${sid}`, name: s.name, role: "학생" });
      if (s.guardian && s.guardian !== s.phone) out.push({ key: `g${sid}`, name: s.name, role: "보호자" }); // 보호자 이름 데이터가 없어 학생 이름 + 역할(보호자)로 표시
    });
    return out;
  }
  function add({ klass, content, tags }) {
    const at = Date.now(), targets = targetsFor(klass), readers = {};
    targets.forEach((t, i) => { if (i % 2 === 0) readers[t.key] = at + (i + 1) * 47000; }); // 모의 읽음
    const id = String(at);
    RzData.update((d) => { d.feeds = d.feeds || []; d.feeds.push({ id, klass: klass || "", content, tags, at, author: me(), targets, readers, reactions: [], comments: [] }); });
    return id;
  }
  const readCount = (f) => Object.keys(f.readers || {}).length;
  const commentCount = (f) => (f.comments || []).filter((c) => !c.deleted).length;
  const emojiImg = (n, size = 32) => el("img", "fd-emoji", [], { src: `../assets/feed/emoji-${n}.svg`, alt: "", width: size, height: size });
  const profile = (size = 32) => R.Icon("solid/profile", { size });

  /* bottom sheet over the device screen */
  function sheet({ title, body, foot }) {
    const x = el("button", "fd-sheet__close", [R.Icon("line/ic24_close-type01", { size: 20, color: "var(--rz-gray-06)" })], { type: "button", "aria-label": "닫기" });
    const sh = el("div", "fd-sheet", [el("div", "fd-sheet__head", [title, x]), el("div", "fd-sheet__body", [body]), foot ? el("div", "fd-sheet__foot", [foot]) : null], { role: "dialog", "aria-modal": "true", "aria-label": title });
    const dim = el("div", "guide-dim", [sh]);
    const close = () => dim.remove();
    x.addEventListener("click", close);
    dim.addEventListener("click", (e) => e.target === dim && close());
    document.querySelector(".rz-device__screen").append(dim);
    return { close, dim };
  }

  /* 읽은 사람 (N) — 피드 리스트의 "N명 읽음" (360:152415) */
  function openReaders(f) {
    const rows = (f.targets || []).filter((t) => f.readers && f.readers[t.key]).sort((a, b) => f.readers[b.key] - f.readers[a.key]);
    const body = rows.length ? el("div", "", rows.map((t) => el("div", "fd-row", [profile(32), el("div", "fd-row__txt", [t.name, el("small", "", [t.role])]), el("span", "fd-row__time", [fmtDate(f.readers[t.key])])])))
      : el("p", "fd-none", ["아직 읽은 사람이 없습니다."]);
    sheet({ title: `읽은 사람 (${rows.length})`, body });
  }

  window.Feed = { all, get, update, add, me, academy, targetsFor, fmtDate, readCount, commentCount, emojiImg, profile, sheet, openReaders, el };
})();
