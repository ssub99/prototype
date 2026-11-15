/*
 * 청구서 (invoice) data + math shared by invoice-create / invoice-adjust (개선 전·후 공통).
 *   Stored in RzData (sessionStorage per version):
 *     adjusts  { "<yyyy-mm>:<학생 인덱스>": { due?("yy-mm-dd" 납부기한 변경), noFee, unit:"won"|"pct", discount, months, reason, scope, extras:[{name, amount}] } }
 *     invoices [{ id, sid, ym, kind:"main"|"extra", createdAt:"yy-mm-dd", paidAt:null, due:"yy-mm-dd", calc, period?:{start,end}, notify?:bool }]   (calc = frozen result of Invoice.calc)
 *   납부 관리: unpaid() → [{b, s}], markSent(ids) (b.sentAt = 오늘), cancel(ids), sendable(s)
 *   create(s, sid, ym, kind, { adj?, period?, notify? }) — adj 를 주면 그 조정값으로 청구서를 만든다(추가청구서)
 *   Invoice.calc(student, adj) → { base, disc, tuition, extrasTotal, total, suffix, line, months, kind }
 *     기간 클래스: (클래스 수강료 − 할인) × 청구 개월 분 · 회차 클래스: 클래스 수강료(= 1회 수강료 × 회차) − 할인, 표기 "(N회)".
 *   할인 "계속 적용": 이후 달에도 그 학생의 할인(단위·금액·사유)이 기본값으로 이어진다. "이번만 적용"은 해당 달만.
 * Requires common/data.js.
 */
(function () {
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (n) => Number(n || 0).toLocaleString("ko-KR");
  const num = (v) => Number(String(v).replace(/[^0-9]/g, "")) || 0;
  const ymKey = (y, m) => `${y}-${pad(m)}`;
  const ymParts = (ym) => ym.split("-").map(Number);
  const ymLabel = (ym) => { const [y, m] = ymParts(ym); return `${y}년 ${m}월`; };
  const shiftYm = (ym, d) => { const [y, m] = ymParts(ym); const t = y * 12 + (m - 1) + d; return ymKey(Math.floor(t / 12), (t % 12) + 1); };
  const short = (d) => `${String(d.getFullYear()).slice(2)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => short(new Date());
  const dueOf = (ym) => { const [y, m] = ymParts(ym); return short(new Date(y, m, 0)); }; // 납부기한 = 청구월 말일
  const dueLong = (ym) => { const [y, m] = ymParts(ym); return `${y}년 ${pad(m)}월 ${pad(new Date(y, m, 0).getDate())}일`; };
  const nowYm = () => { const n = new Date(); return ymKey(n.getFullYear(), n.getMonth() + 1); };

  const klassOf = (s) => RzData.get().classes.find((c) => c.name === s.klass);
  const kindOf = (c) => (c?.type === "회차반" ? "회차" : "기간");

  const DEFAULT = () => ({ due: "", noFee: false, unit: "won", discount: 0, months: 1, reason: "", scope: "계속 적용", extras: [] });
  function adjustOf(sid, ym) {
    const all = RzData.get().adjusts || {};
    if (all[`${ym}:${sid}`]) return { ...DEFAULT(), ...all[`${ym}:${sid}`] };
    // 가장 가까운 이전 달의 "계속 적용" 할인을 이어받는다
    const prev = Object.keys(all).filter((k) => k.endsWith(`:${sid}`) && k.split(":")[0] < ym && all[k].scope === "계속 적용").sort().pop();
    if (prev) { const a = all[prev]; return { ...DEFAULT(), unit: a.unit, discount: a.discount, reason: a.reason, scope: a.scope }; }
    return DEFAULT();
  }
  const dueFor = (sid, ym) => adjustOf(sid, ym).due || dueOf(ym); // 조정 화면에서 납부기한을 바꿨으면 그 값
  const saveAdjust = (sid, ym, adj) => RzData.update((d) => { d.adjusts = d.adjusts || {}; d.adjusts[`${ym}:${sid}`] = adj; });

  function calc(s, adj = DEFAULT()) {
    const c = klassOf(s), kind = kindOf(c);
    const base = num(c?.fee);
    const sessions = num(c?.sessions);
    const months = kind === "기간" ? Math.max(1, num(adj.months) || 1) : 1;
    const raw = adj.unit === "pct" ? Math.round((base * Math.min(100, num(adj.discount))) / 100) : Math.min(base, num(adj.discount));
    const disc = adj.noFee ? 0 : raw;
    const per = adj.noFee ? 0 : base - disc;
    const tuition = per * months;
    const extras = (adj.extras || []).filter((e) => e.name || num(e.amount));
    const extrasTotal = extras.reduce((a, e) => a + num(e.amount), 0);
    return {
      base, disc, pct: adj.unit === "pct" ? Math.min(100, num(adj.discount)) : 0, tuition, extras, extrasTotal, total: tuition + extrasTotal, kind, months, sessions,
      suffix: kind === "기간" ? `(${months}개월)` : sessions ? `(${sessions}회)` : "",
      line: kind === "기간" ? `${fmt(per)}원 x ${months}개월` : `${fmt(per)}원`,
    };
  }

  const billsOf = (sid, ym) => {
    const all = (RzData.get().invoices || []).filter((b) => b.sid === sid && b.ym === ym);
    return { main: all.find((b) => b.kind === "main") || null, extras: all.filter((b) => b.kind === "extra") };
  };
  function create(s, sid, ym, kind = "main", metaIn = {}) {
    const { adj: adjIn, ...meta } = metaIn;
    const adj = adjIn || (kind === "main" ? adjustOf(sid, ym) : DEFAULT()); // 추가청구서: 추가 생성 화면에서 작성한 내용(adj), 없으면 기본 청구
    RzData.update((d) => {
      d.invoices = d.invoices || [];
      d.invoices.push({ id: `${ym}:${sid}:${kind}:${d.invoices.length}`, sid, ym, kind, createdAt: today(), paidAt: null, due: adj.due || dueOf(ym), calc: calc(s, adj), ...meta });
    });
  }

  /* ---- 납부 관리 ---- */
  const longOf = (yymmdd) => { const [y, m, d] = yymmdd.split("-"); return `20${y}년 ${m}월 ${d}일`; };
  const unpaid = () => (RzData.get().invoices || []).map((b) => ({ b, s: RzData.get().students[b.sid] })).filter(({ b, s }) => !b.paidAt && s);
  const markSent = (ids) => RzData.update((d) => { (d.invoices || []).forEach((b) => { if (ids.includes(b.id)) b.sentAt = today(); }); });
  // 생성취소: 선택한 청구서를 삭제(다시 생성 가능). 본 청구서를 취소하면 같은 학생·청구월의 추가청구서도 함께 취소한다.
  const cancel = (ids) => RzData.update((d) => {
    const mains = (d.invoices || []).filter((b) => ids.includes(b.id) && b.kind === "main").map((b) => `${b.sid}:${b.ym}`);
    d.invoices = (d.invoices || []).filter((b) => !ids.includes(b.id) && !(b.kind === "extra" && mains.includes(`${b.sid}:${b.ym}`)));
  });
  const sendable = (s) => !!(s.phone || s.guardian); // 학생/학부모 연락처가 하나도 없으면 발송 실패

  window.Invoice = { longOf, unpaid, markSent, cancel, sendable, fmt, num, ymKey, ymParts, ymLabel, shiftYm, nowYm, today, dueOf, dueFor, dueLong, klassOf, kindOf, DEFAULT, adjustOf, saveAdjust, calc, billsOf, create };
})();
