/*
 * Onboarding data shared by the screens of one prototype version (before/ or after/).
 * Kept in sessionStorage per version, so 개선 전 and 개선 후 runs don't mix and a new tab starts clean.
 *
 *   academy  { name, size, targets[], address, addressDetail, phone }
 *   classes  [{ name, subjects[], features[], schedules[{ days, time }], teacher, type }]
 *   students [{ name, phone, klass, tuition }]
 *   bulk     [{ file, klass }]            (일괄 등록 — counted once 담당자 확인 is done, so not in 학생수)
 */
(function () {
  const version = location.pathname.split("/").slice(-2, -1)[0] || "default";
  // 시나리오: 시나리오1·2·3 은 서로 완전히 분리된 데이터 칸을 쓴다. 시나리오1 은 예전 키(rz.data.<버전>) 그대로, 시나리오2 는 <버전>-s2.
  const scenario = (() => { try { return ["1", "2", "3"].includes(sessionStorage.getItem("proto.scn")) ? sessionStorage.getItem("proto.scn") : "1"; } catch { return "1"; } })();
  const slot = version + (scenario === "1" ? "" : "-s" + scenario);
  const KEY = `rz.data.${slot}`;
  // 시나리오2 시작 상태: 학원만 생성되어 있다(고등학생 대상 수학학원). 클래스·학생은 없다. 개선 전/후 동일.
  const SEED2 = () => ({ academy: { name: "랠리즈 수학학원", size: "50~100명", targets: ["중등", "고등"], address: "서울 강남구 테헤란로 123", addressDetail: "4층", phone: "02-1234-5678" }, classes: [], students: [], bulk: [] });
  const seed2 = () => { try { ["before", "after"].forEach((v) => ["-s2", "-s3"].forEach((x) => { const k = `rz.data.${v}${x}`; const raw = sessionStorage.getItem(k);
        if (raw == null) sessionStorage.setItem(k, JSON.stringify(SEED2()));
        else if (raw.includes("랠리즈 종합학원")) sessionStorage.setItem(k, raw.replace("랠리즈 종합학원", "랠리즈 수학학원")); }));  /* 예전 시드로 저장된 학원명도 맞춘다 */ } catch { /* private mode */ } };
  if (scenario !== "1") seed2(); // 데이터 초기화로 비워진 칸도 다음 화면에서 다시 이 상태로 시작한다
  const empty = () => ({ academy: null, classes: [], students: [], bulk: [] });

  function load() {
    // thumbnails moved from radius-baked PNG exports to the original JPGs
    try { return { ...empty(), ...JSON.parse((sessionStorage.getItem(KEY) || "{}").replace(/(thumbs\/class_\d)\.png/g, "$1.jpg")) }; } catch { return empty(); }
  }
  function save(d) {
    try { sessionStorage.setItem(KEY, JSON.stringify(d)); } catch { /* private mode */ }
    return d;
  }
  const update = (fn) => { const d = load(); fn(d); return save(d); };

  /* 학생 삭제: 학생 배열에서 빼고, 인덱스(sid)로 이 학생을 가리키던 값들을 정리·당긴다
   *   invoices[].sid · adjusts["<ym>:<sid>"] · attendance[날짜][sid] · feeds[].targets/readers 의 s<sid>/g<sid> 키 */
  function removeStudent(d, sid) {
    d.students.splice(sid, 1);
    d.invoices = (d.invoices || []).filter((b) => b.sid !== sid).map((b) => (b.sid > sid ? { ...b, sid: b.sid - 1 } : b));
    if (d.adjusts) { const m = {}; Object.entries(d.adjusts).forEach(([k, v]) => { const [ym, n] = k.split(":"); const i = Number(n); if (i === sid) return; m[`${ym}:${i > sid ? i - 1 : i}`] = v; }); d.adjusts = m; }
    if (d.attendance) Object.keys(d.attendance).forEach((day) => { const m = {}; Object.entries(d.attendance[day]).forEach(([k, v]) => { const i = Number(k); if (i === sid) return; m[i > sid ? i - 1 : i] = v; }); d.attendance[day] = m; });
    const shiftKey = (k) => { const g = /^([sg])(\d+)$/.exec(k); if (!g) return k; const i = Number(g[2]); return i === sid ? null : `${g[1]}${i > sid ? i - 1 : i}`; };
    (d.feeds || []).forEach((f) => {
      f.targets = (f.targets || []).map((t) => ({ ...t, key: shiftKey(t.key) })).filter((t) => t.key);
      const r = {}; Object.entries(f.readers || {}).forEach(([k, v]) => { const nk = shiftKey(k); if (nk) r[nk] = v; }); f.readers = r;
    });
  }

  window.RzData = {
    version,
    seed2,
    scenario,
    slot,
    get: load,
    setAcademy: (academy) => update((d) => { d.academy = academy; }),
    addClass: (c) => update((d) => { d.classes.push(c); }),
    addStudent: (s) => update((d) => { d.students.push(s); }),
    removeStudent: (sid) => update((d) => removeStudent(d, sid)),
    addBulk: (b) => update((d) => { d.bulk.push(b); }),
    academyName: (fallback = "") => load().academy?.name || fallback,
    classNames: () => load().classes.map((c) => c.name),
    reset: () => save(empty()),
    update,
  };
})();
