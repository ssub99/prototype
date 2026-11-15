/* Rallyz DS showcase — every Figma master on the Components page mapped to a code call. */
(function () {
  const R = window.Rallyz;
  const $ = (t, a = {}, c = []) => {
    const n = document.createElement(t);
    for (const [k, v] of Object.entries(a)) {
      if (k === "class") n.className = v; else if (k === "text") n.textContent = v; else if (k === "html") n.innerHTML = v; else n.setAttribute(k, v);
    }
    [].concat(c).forEach((x) => x != null && n.append(x));
    return n;
  };
  const wrap = (w, ...nodes) => { const d = $("div", { style: `width:${w}px;position:relative` }); nodes.forEach((n) => d.append(n)); return d; };

  /* ---------- Button masters parsed from name ---------- */
  const btnSize = { "64_large": 64, "56_regular": 56, "48_small": 48, "40_xsmall": 40, "32_xxsmall": 32, "32_tiny": "t32", "24_tiny": "t24", "16_tiny": "t16" };
  function buttonFromName(name) {
    const m = /^button\/(solid|line)\/(enable|disable)\/(\w+)\/.*\[(\w+)\]$/.exec(name);
    if (!m) return null;
    const [, variant, st, size, color] = m;
    const s = btnSize[size];
    const label = typeof s === "string" ? (s === "t32" ? (variant === "line" ? "상세" : "Btn") : "Text") : "Button";
    const b = R.Button({ label, variant, color: color.toLowerCase(), size: s, disabled: st === "disable" });
    return typeof s === "number" ? wrap(343, b) : b;
  }
  function controlFromName(name) {
    const m = /^control\/checkbox-label\/(checked|default|disable)\/(\w+?)\//.exec(name);
    if (!m) return null;
    return R.Checkbox({ label: "Text", checked: m[1] === "checked", disabled: m[1] === "disable", labelStyle: m[2] });
  }

  /* ---------- explicit masters ---------- */
  const M = {
    "1230:12695": () => { const d = R.Device({ children: [R.StatusBar(), R.Header({ kind: "home" })] }); d.style.transform = "scale(.5)"; d.style.transformOrigin = "0 0"; return wrap(198, d); },
    "221:3599": () => wrap(375, R.StatusBar()),
    "221:2386": () => wrap(343, R.AlarmFill()),
    "221:2344": () => wrap(343, R.Alarm({ title: "랠리즈 피아노", message: "학원에 등록된 클래스가 없습니다.\n클래스 등록 후 이용해주세요!" })),
    "221:1244": () => R.Button({ variant: "line", color: "green", size: "t32", count: 999 }),
    "221:1249": () => R.Button({ variant: "line", color: "green", size: "t32", count: 999, countIcon: "classlist" }),
    "221:1242": () => R.Button({ label: "수정", variant: "line", color: "green", size: "t32" }),
    "221:1240": () => R.Button({ label: "상세", variant: "line", color: "grey", size: "t32" }),
    "950:1288": () => R.Button({ label: "상세", variant: "line", color: "lightgrey", size: "t32" }),
    "221:2459": () => R.Button({ label: "Text", size: "t24", color: "grey", arrow: true }),
    "221:1608": () => wrap(343, R.Attachment({ state: "empty" })),
    "221:1619": () => wrap(343, R.Attachment({ state: "empty", disabled: true })),
    "221:1612": () => wrap(343, R.Attachment({ state: "done" })),
    "221:1623": () => wrap(343, R.Attachment({ state: "done", disabled: true })),
    "221:1630": () => wrap(343, R.Attachment({ state: "done", disabled: true, name: "랠리즈+일괄+등록.xlsx (59.34 KB)" })),
    "221:2466": () => wrap(343, R.Attachment({ state: "done", name: "랠리즈+일괄+등록.xlsx (59.34 KB)" })),
    "221:2473": () => wrap(343, R.Attachment({ state: "feed", removable: false })),
    "221:2478": () => wrap(343, R.Attachment({ state: "feed" })),
    "221:2485": () => wrap(343, R.Attachment({ state: "days" })),
    "221:1724": () => wrap(343, R.AccordionButton({ open: true })),
    "221:1727": () => wrap(343, R.AccordionButton({ open: false })),
    "221:1457": () => wrap(343, R.ButtonGroup()),
    "221:1470": () => wrap(343, R.ButtonGroup({ secondaryColor: "grey" })),
    "221:1462": () => wrap(343, R.ButtonGroup({ prev: true })),
    "221:1450": () => wrap(375, R.ButtonBar()),
    /* chips */
    "221:1478": () => R.Chip({ type: "type01-solid" }),
    "346:1250": () => R.Chip({ type: "type02-solid" }),
    "349:1258": () => R.Chip({ type: "type03-solid" }),
    "221:1480": () => R.Chip({ type: "type02-line" }),
    "221:1352": () => R.Chip({ type: "type03-line" }),
    "221:1338": () => R.Chip({ type: "type04-line" }),
    "221:1355": () => R.Chip({ type: "type05-line" }),
    "221:1345": () => R.Chip({ type: "type06-line" }),
    "221:1361": () => R.Chip({ size: "small", type: "type01" }),
    "221:1358": () => R.Chip({ size: "small", type: "type02" }),
    "528:1208": () => R.Chip({ size: "small", type: "type03" }),
    "528:1209": () => R.Chip({ size: "small", type: "type04" }),
    "221:1594": () => R.Chip({ size: "tiny", type: "type01" }),
    "221:1600": () => R.Chip({ size: "tiny", type: "type02" }),
    "221:1602": () => R.Chip({ size: "tiny", type: "type03" }),
    "221:1596": () => R.Chip({ size: "tiny", type: "type04" }),
    "221:1598": () => R.Chip({ size: "tiny", type: "type05" }),
    "3718:10287": () => R.Chip({ size: "tiny", type: "type06" }),
    /* checks */
    "221:2236": () => R.Checkbox({ label: "Text", size: 12, checked: true }),
    "221:2241": () => R.Checkbox({ label: "Text", size: 12 }),
    "221:2245": () => R.Checkbox({ label: "Text", size: 12, disabled: true }),
    "221:2233": () => R.Checkbox({ size: 12, checked: true }),
    "221:2249": () => R.Checkbox({ size: 12 }),
    "221:2251": () => R.Checkbox({ size: 12, disabled: true }),
    "911:1203": () => R.Checkbox({ size: 12, disabled: true, checked: true }),
    "221:2253": () => R.Checkbox({ checked: true }),
    "221:2289": () => R.Checkbox({}),
    "221:2307": () => R.Checkbox({ disabled: true }),
    "911:1204": () => R.Checkbox({ disabled: true, checked: true }),
    "221:2328": () => R.CheckIcon({ type: "circle", checked: true }),
    "221:2325": () => R.CheckIcon({ type: "circle" }),
    "221:2341": () => R.CheckIcon({ type: "star", checked: true }),
    "221:2337": () => R.CheckIcon({ type: "star" }),
    "221:2334": () => R.DayCheck({ label: "토", checked: true }),
    "221:2331": () => R.DayCheck({ label: "금" }),
    "221:1677": () => R.Choice({ checked: true }),
    "221:1675": () => R.Choice({}),
    "1568:3491": () => R.Choice({ disabled: true }),
    "221:1673": () => wrap(109, R.Choice({ size: 48, checked: true })),
    "221:1671": () => wrap(109, R.Choice({ size: 48 })),
    "1568:3501": () => wrap(109, R.Choice({ size: 48, disabled: true })),
    "2389:5765": () => R.Radio({ label: "Text", labelStyle: "body02_bold" }),
    "2389:5766": () => R.Radio({ label: "Text", labelStyle: "body02_bold", disabled: true }),
    "2389:5767": () => R.Radio({ label: "Text", labelStyle: "body02_bold", disabled: true, checked: true }),
    "2389:5764": () => R.Radio({ label: "Text", labelStyle: "body02_bold", checked: true }),
    "221:1648": () => R.Radio({ label: "Text" }),
    "221:1665": () => R.Radio({ label: "Text", disabled: true }),
    "221:1668": () => R.Radio({ label: "Text", disabled: true, checked: true }),
    "221:1655": () => R.Radio({ label: "Text", checked: true }),
    "221:1646": () => R.Radio({}),
    "221:1660": () => R.Radio({ disabled: true }),
    "221:1662": () => R.Radio({ disabled: true, checked: true }),
    "221:1652": () => R.Radio({ checked: true }),
    "3693:4293": () => R.Toggle({ disabled: true }),
    "3693:4292": () => R.Toggle({ disabled: true, on: true }),
    "221:1683": () => R.Toggle({}),
    "221:1679": () => R.Toggle({ on: true }),
    /* date */
    "221:1981": () => R.DateTime({ size: "long", state: "active" }),
    "221:1963": () => R.DateTime({ size: "long" }),
    "221:2035": () => wrap(343, R.DateField({ width: "full", value: "2021.12.3" })),
    "221:1999": () => R.DateTime({ size: "long", state: "disable" }),
    "221:1972": () => R.DateTime({ state: "active" }),
    "221:1954": () => R.DateTime({}),
    "221:1990": () => R.DateTime({ state: "disable" }),
    "221:1759": () => wrap(326, R.DateField({ width: "select" }), $("div", { style: "height:16px" }), R.Calendar()),
    "221:2017": () => R.TimeRange({ state: "active" }),
    "221:2008": () => R.TimeRange({}),
    "221:2026": () => R.TimeRange({ state: "disable" }),
    /* headers */
    "221:1111": () => wrap(375, R.Header({ kind: "home" })),
    "221:1134": () => wrap(375, R.Header({ kind: "feed" })),
    "221:1162": () => wrap(375, R.Header({ kind: "chat" })),
    "221:1190": () => wrap(375, R.Header({ kind: "calendar" })),
    "221:1217": () => wrap(375, R.Header({ kind: "more" })),
    "221:2082": () => wrap(375, R.FlowHeader({ title: "Title", lead: "close" })),
    "221:2153": () => wrap(375, R.FlowHeader({ title: "Title", lead: "close", trail: "calendar" })),
    "221:2143": () => wrap(375, R.FlowHeader({ title: "Title", lead: "prev" })),
    "221:2060": () => wrap(375, R.FlowHeader({ title: "Title", subtitle: "Subtitle", lead: "close", buttonLabel: "Btn" })),
    "221:2071": () => wrap(375, R.FlowHeader({ title: "Title", subtitle: "Subtitle", lead: "close", buttonLabel: "Btn", buttonColor: "grey" })),
    "221:2104": () => wrap(375, R.FlowHeader({ title: "Title", subtitle: "Subtitle", lead: "prev", buttonLabel: "Btn" })),
    "221:2115": () => wrap(375, R.FlowHeader({ title: "Title", subtitle: "Subtitle", lead: "prev", buttonLabel: "Btn", buttonColor: "grey" })),
    "221:2134": () => wrap(375, R.FlowHeader({ title: "Title", subtitle: "Subtitle", lead: "close" })),
    "221:2125": () => wrap(375, R.FlowHeader({ title: "Title", subtitle: "Subtitle", lead: "prev" })),
    "221:2088": () => wrap(375, R.FlowHeader({ lead: "close" })),
    "221:2151": () => wrap(375, R.FlowHeader({ lead: "prev" })),
    "221:2090": () => wrap(375, R.PlainHeader({ buttons: ["Text", "Text"] })),
    "221:2097": () => wrap(375, R.PlainHeader()),
    /* inputs */
    "221:1511": () => wrap(343, R.Input({ size: 32, value: "Text", state: "active" })),
    "221:1490": () => wrap(343, R.Input({ value: "Text", state: "active" })),
    "221:1516": () => wrap(343, R.Input({ size: 32, value: "Text" })),
    "221:1488": () => wrap(343, R.Input({ value: "Text" })),
    "221:1508": () => wrap(343, R.Input({ size: 32 })),
    "221:1495": () => wrap(343, R.Input({})),
    "491:1199": () => wrap(343, R.Input({ required: true, actionLabel: "Text" })),
    "221:1519": () => wrap(343, R.Input({ size: 32, disabled: true })),
    "221:1486": () => wrap(343, R.Input({ disabled: true })),
    "221:1522": () => wrap(343, R.Input({ size: 32, value: "Text", error: true })),
    "221:1482": () => wrap(343, R.Input({ value: "Text", error: true, helper: "*최대 25자까지 적어주세요." })),
    "221:1536": () => wrap(343, R.Textarea({ value: LOREM, state: "active" })),
    "221:1505": () => wrap(343, R.Textarea({ value: LOREM })),
    "221:1533": () => wrap(343, R.Textarea({ placeholder: LOREM })),
    "221:1525": () => wrap(343, R.Textarea({ value: LOREM, disabled: true })),
    "221:1529": () => wrap(343, R.Textarea({ value: LOREM, error: true })),
    "221:1562": () => wrap(343, R.Search({})),
    "221:1570": () => wrap(343, R.Select({ value: "Text" })),
    "221:1576": () => wrap(343, R.Select({ value: "Text", size: 48 })),
    "221:1582": () => wrap(343, R.Select({ placeholder: "Text", disabled: true })),
    "221:1588": () => wrap(343, R.Select({ placeholder: "Text", size: 48, disabled: true })),
    "3287:4511": () => wrap(106, R.Select({ value: "수강신청 승인", size: 32 })),
    "3287:4512": () => wrap(106, R.Select({ placeholder: "수강신청 승인", size: 32, disabled: true })),
    "221:1539": () => wrap(343, R.SelectBox({ select: { value: "Text", options: ["TEXT", "TEXT", "TEXT"] }, input: { placeholder: "Text" } })),
    "221:1548": () => wrap(343, R.SelectBox({ select: { value: "Text", options: ["TEXT", "TEXT", "TEXT"], open: true }, input: { placeholder: "Text" } })),
    /* lists */
    "433:1531": () => wrap(343, R.AttendRow()),
    "221:1864": () => wrap(343, R.ChatRow()),
    "221:1932": () => wrap(343, R.List({ items: Array.from({ length: 6 }, () => R.ChatRow()) })),
    "221:2497": () => wrap(343, R.ClassRow({ thumb: "../assets/ds/thumb-class-list.png" })),
    "221:2508": () => wrap(343, R.ClassRow({ state: "selected", thumb: "../assets/ds/thumb-class-list.png" })),
    "2370:5767": () => wrap(343, R.ClassRow({ state: "disable", teacher: "김랠리", thumb: "../assets/ds/thumb-class-list.png" })),
    "221:2439": () => wrap(343, R.ClassCard({ variant: "detail", title: "월수금 중1A", days: "월/수/금", thumb: "../assets/ds/thumb-class-detail.png" })),
    "221:2182": () => wrap(343, R.ClassCard({ variant: "main01", title: "월수금 중A2", days: "월/수/금", thumb: "../assets/ds/thumb-class-study.png" })),
    "221:2161": () => wrap(343, R.ClassCard({ variant: "main02", thumb: "../assets/ds/thumb-class-art.png" })),
    "1705:3542": () => wrap(343, R.ClassCard({ variant: "main03", thumb: "../assets/ds/thumb-class-art2.png" })),
    "221:1880": () => wrap(343, R.AuthRow({ editable: false })),
    "221:1872": () => wrap(343, R.AuthRow({})),
    "221:1888": () => wrap(343, R.List({ items: [R.AuthRow({ title: "권한1" }), R.AuthRow({ title: "권한2" }), R.AuthRow({ title: "권한2" }), R.AuthRow({ title: "학원장", editable: false }), R.AuthRow({ title: "직원", editable: false }), R.AuthRow({ title: "강사", editable: false })] })),
    "221:1900": () => wrap(343, R.TuitionRow()),
    "221:1920": () => wrap(343, R.List({ items: [1, 2, 3, 4, 5, 6].map((n) => R.TuitionRow({ title: `과목0${n}` })) })),
    "221:1826": () => wrap(343, R.MemberRow({ type: "구분", trail: "arrow", figmaName: "list/employee" })),
    "221:1854": () => wrap(343, R.MemberRow({ type: "구분", trail: [{ label: "상세", color: "grey" }], figmaName: "list/employee-authorization" })),
    "221:1835": () => wrap(343, R.MemberRow({ type: "구분", height: 56, trail: "arrow", figmaName: "list/employee_add" })),
    "221:1766": () => wrap(343, R.GradeRow()),
    "221:2200": () => wrap(343, R.InstituteCard({ variant: "lecture", thumb: "../assets/ds/thumb-academy-english.png" })),
    "221:2212": () => wrap(343, R.InstituteCard({ variant: "manage", thumb: "../assets/ds/thumb-academy-taekwondo.png" })),
    "377:1176": () => wrap(343, R.LiveRow()),
    "221:1818": () => wrap(343, R.MemberRow({ type: "구분", meta: "2022.02.22 오전 11:04", aside: "등록일자 yyyy.mm.dd" })),
    "221:1845": () => wrap(343, R.MemberRow({ type: "구분", meta: "2022.02.22 오전 11:04", trail: "more", figmaName: "list/member-feed" })),
    "221:1944": () => wrap(343, R.MemberRow({ type: "구분", meta: "2022.02.22 오전 11:04", aside: "2022.01.21 16:40 발송완료", trail: "arrow", figmaName: "list/member-rating" })),
    "221:2416": () => wrap(343, R.MemberRow({ name: "이름(관리용 이름)", select: "check", selected: true, figmaName: "list/member_checked" })),
    "221:2431": () => wrap(343, R.MemberRow({ name: "이름(프로필명)", tag: "구분", height: 80, trail: [{ label: "상세", color: "grey" }, { label: "수정" }], figmaName: "list/member_connect" })),
    "221:2403": () => wrap(343, R.MemberRow({ name: "이름(관리용 이름)", height: 56, select: "check", figmaName: "list/member_default" })),
    "221:2423": () => wrap(343, R.MemberRow({ name: "이름(관리용 이름)", height: 56, trail: "arrow", figmaName: "list/member_invite" })),
    "378:1230": () => wrap(343, R.ReferenceRow()),
    "221:1790": () => wrap(343, R.ReportRow({ kind: "attendance" })),
    "221:1800": () => wrap(343, R.ReportRow({ kind: "grade" })),
    "221:1809": () => wrap(343, R.ReportRow({ kind: "rating" })),
    "221:2397": () => wrap(343, R.MemberRow({ select: "radio", figmaName: "list/student_default" })),
    "221:2410": () => wrap(343, R.MemberRow({ select: "radio", selected: true, figmaName: "list/student_selected" })),
    /* nav / tabs */
    "221:1259": () => wrap(375, R.Navagation({ active: "home" })),
    "221:1278": () => wrap(375, R.Navagation({ active: "feed" })),
    "221:1295": () => wrap(375, R.Navagation({ active: "chat" })),
    "221:1304": () => wrap(375, R.Navagation({ active: "calendar" })),
    "221:1321": () => wrap(375, R.Navagation({ active: "more" })),
    "221:2039": () => wrap(375, R.Tabs({ items: ["Text", "Text", "Text"], selected: 0 })),
    "221:2046": () => wrap(375, R.Tabs({ items: ["Text", "Text", "Text"], selected: 1 })),
    "221:2053": () => wrap(375, R.Tabs({ items: ["Text", "Text", "Text"], selected: 2 })),
    "221:1712": () => wrap(375, R.Tabs({ selected: 0 })),
    "221:1718": () => wrap(375, R.Tabs({ selected: 1 })),
    "221:1692": () => wrap(343, R.Tabs({ type: "tap02", selected: 0 })),
    "221:1686": () => wrap(343, R.Tabs({ type: "tap02", selected: 1 })),
    "221:1705": () => R.Tabs({ type: "tap02-tiny", selected: 0 }),
    "221:1699": () => R.Tabs({ type: "tap02-tiny", selected: 1 }),
    "3119:4255": () => R.Tabs({ type: "segment", items: ["기간 모집", "상시 모집"], selected: 0 }),
    "3119:4256": () => R.Tabs({ type: "segment", items: ["기간 모집", "상시 모집"], selected: 1 }),
    "2900:4485": () => R.Tabs({ type: "tap03", items: ["Text", "Text", "Text"], selected: 0 }),
    "2900:4521": () => R.Tabs({ type: "tap03", items: ["Text", "Text", "Text"], selected: 1 }),
    "2900:4522": () => R.Tabs({ type: "tap03", items: ["Text", "Text", "Text"], selected: 2 }),
    /* feedback */
    "221:1606": () => wrap(343, R.Toast({ text: "Text" })),
    "331:1194": () => wrap(343, R.Toast({ text: "Text", type: "type02" })),
    "1320:3457": () => $("div", { style: "display:flex;flex-direction:column;gap:16px" }, [R.Tooltip({ arrow: "down" }), R.Tooltip({ arrow: "up" })]),
  };
  const LOREM = "The pain itself sitmet, enhanced by the elite. The jaws of mourning are a mass of laughter. In the urn any ugly but the most flattering vengeful earth a at. Mattis the kids who are the earth of life long, the wise a lot of sad sadness. The various planning should not, and the very thing, to decorate the sad part of the kitchen.";

  const CODE = {}; // filled lazily from function source for display
  for (const [id, fn] of Object.entries(M)) CODE[id] = fn.toString().replace(/^\(\) => /, "").replace(/wrap\(\d+, /, "").replace(/\)$/, "").replace(/\bR\./g, "");

  const SECTIONS = [
    ["Button", (n) => n.startsWith("button/")],
    ["Chip", (n) => n.startsWith("chip/")],
    ["Input · Select", (n) => n.startsWith("input/")],
    ["Date · Time", (n) => n.startsWith("date/") || n.startsWith("time/")],
    ["Control", (n) => n.startsWith("control/")],
    ["Header", (n) => n.startsWith("header/")],
    ["Navagation · Tabs", (n) => n.startsWith("navagation/") || n.startsWith("tap")],
    ["Toast · Tooltip · Alarm", (n) => n.startsWith("toast/") || n.startsWith("tooltip") || n.startsWith("alarm/")],
    ["List · Card", (n) => n.startsWith("list/")],
    ["Chrome", (n) => n.startsWith("Status") || n.startsWith("Device")],
  ];

  function renderComponents(registry, root) {
    const all = [...registry.components, { id: "1320:3457", name: "tooltip", png: "figma/png/1320_3457.png" }].filter((c, i, a) => a.findIndex((x) => x.id === c.id) === i && !["2500:4460", "2503:7435"].includes(c.id));
    let mapped = 0;
    for (const [title, test] of SECTIONS) {
      const items = all.filter((c) => test(c.name)).sort((a, b) => a.name.localeCompare(b.name));
      if (!items.length) continue;
      const sec = $("section", { class: "sc-section", id: "c-" + title.split(" ")[0].toLowerCase() }, [$("h2", { text: `${title} · ${items.length}` })]);
      const grid = $("div", { class: "sc-grid" });
      for (const c of items) {
        let node = null;
        try { node = M[c.id] ? M[c.id]() : buttonFromName(c.name) || controlFromName(c.name); } catch (e) { node = $("pre", { class: "sc-err", text: String(e) }); }
        if (node) mapped++;
        const png = c.png || `figma/png/${c.id.replace(":", "_")}.png`;
        const img = $("img", { src: png, alt: "", loading: "lazy" });
        img.addEventListener("load", () => { img.style.width = img.naturalWidth / 2 + "px"; });
        const cmp = $("div", { class: "sc-compare" }, [$("div", { class: "sc-pane" }, [$("span", { class: "sc-tag", text: "Figma" }), img]), $("div", { class: "sc-pane sc-code" }, [$("span", { class: "sc-tag", text: "Code" }), node || $("em", { text: "— not mapped" })])]);
        const ov = $("div", { class: "sc-overlay" });
        const card = $("article", { class: "sc-card" + (node ? "" : " is-missing"), "data-id": c.id }, [
          $("header", {}, [$("strong", { text: c.name }), $("code", { text: c.id })]),
          cmp, ov,
          M[c.id] || node ? $("pre", { class: "sc-snippet", text: "Rallyz." + (CODE[c.id] || `Button(${JSON.stringify(nodeProps(c.name))})`) }) : null,
        ]);
        // overlay: figma png on top of code with opacity slider
        const slider = $("input", { type: "range", min: "0", max: "100", value: "0", "aria-label": "overlay" });
        slider.addEventListener("input", () => {
          card.classList.toggle("is-overlay", slider.value > 0);
          img.style.opacity = slider.value / 100;
        });
        card.querySelector("header").append(slider);
        grid.append(card);
      }
      sec.append(grid);
      root.append(sec);
    }
    return { mapped, total: all.length };
  }
  function nodeProps(name) {
    const m = /^button\/(solid|line)\/(enable|disable)\/(\w+)\/.*\[(\w+)\]$/.exec(name);
    return m ? { variant: m[1], color: m[4].toLowerCase(), size: btnSize[m[3]], disabled: m[2] === "disable" || undefined } : {};
  }

  /* ---------- tokens ---------- */
  function renderTokens(root) {
    const css = getComputedStyle(document.documentElement);
    const colors = $("div", { class: "sc-swatches" });
    const groups = [["Green", ["green-g", "green-01", "green-02", "green-03", "green-04", "primary", "green-05", "green-06"]], ["Blue", ["blue-g", "blue-01", "blue-02", "blue-03", "blue-04", "secondary", "blue-05", "blue-06"]], ["Gray", ["white", "gray-01", "gray-02", "gray-03", "gray-04", "gray-05", "gray-06", "gray-07", "black"]], ["Etc", ["red", "error", "control-line", "red-g", "device"]]];
    for (const [g, names] of groups) {
      const row = $("div", { class: "sc-swatch-row" }, [$("h3", { text: g })]);
      for (const n of names) row.append($("div", { class: "sc-swatch" }, [$("i", { style: `background:var(--rz-${n})` }), $("b", { text: `--rz-${n}` }), $("span", { text: css.getPropertyValue(`--rz-${n}`).trim() })]));
      colors.append(row);
    }
    colors.append($("div", { class: "sc-swatch-row" }, [$("h3", { text: "Signature_Color" }), $("div", { class: "sc-signature" }), $("code", { text: "--rz-signature" })]));
    const type = $("div", { class: "sc-type" });
    for (const s of ["headline", "body01", "body02", "small01", "button01", "button02"]) {
      for (const w of ["bold", "medium", "regular"]) {
        const k = `${s}-${w}`;
        type.append($("div", { class: "sc-type-row" }, [$("code", { text: `.rz-t-${k}` }), $("span", { class: `rz-t-${k}`, text: "랠리즈 학원 생활 Rallyz 0123" }), $("small", { text: css.getPropertyValue(`--rz-type-${k}`).replace("var(--rz-font-sans)", "").trim() })]));
      }
    }
    root.append($("section", { class: "sc-section", id: "c-foundation" }, [$("h2", { text: "Color · Paint styles 28" }), colors, $("h2", { text: "Typography · Text styles 18" }), type]));
  }

  function renderIcons(root) {
    const grid = $("div", { class: "sc-icons" });
    const filter = $("input", { type: "search", placeholder: "아이콘 검색 (예: arrow, ic40, flat)", class: "sc-icon-filter" });
    const colorSel = $("select", { class: "sc-icon-color" }, ["default", "var(--rz-primary)", "var(--rz-gray-04)", "var(--rz-red)"].map((v) => $("option", { value: v, text: v === "default" ? "기본색" : v })));
    const draw = () => {
      grid.replaceChildren();
      const q = filter.value.trim().toLowerCase();
      for (const name of R.iconNames().filter((n) => !q || n.toLowerCase().includes(q))) {
        const meta = R.iconMeta[name];
        const icon = R.Icon(name, { color: colorSel.value === "default" ? undefined : colorSel.value });
        const max = Math.max(meta.w, meta.h);
        if (max > 48) { icon.style.width = (meta.w * 48) / max + "px"; icon.style.height = (meta.h * 48) / max + "px"; }
        const cell = $("button", { class: "sc-icon", title: `Rallyz.Icon("${name}")  ${meta.w}×${meta.h}${meta.mono ? " · currentColor" : " · multi-colour"}` }, [$("div", { class: "sc-icon-box" }, [icon]), $("span", { text: name })]);
        cell.addEventListener("click", () => navigator.clipboard?.writeText(`Rallyz.Icon("${name}")`));
        grid.append(cell);
      }
    };
    filter.addEventListener("input", draw);
    colorSel.addEventListener("change", draw);
    draw();
    root.append($("section", { class: "sc-section", id: "c-icons" }, [$("h2", { text: `Icons · ${R.iconNames().length} (SVG)` }), $("div", { class: "sc-icon-tools" }, [filter, colorSel, $("small", { text: "클릭하면 코드가 복사돼요. 단색 아이콘은 currentColor로 색을 바꿀 수 있어요." })]), grid]));
  }

  async function main() {
    const registry = window.RallyzRegistry || (await fetch("registry.json").then((r) => r.json()).catch(() => null));
    const root = document.getElementById("sc-root");
    renderTokens(root);
    renderIcons(root);
    if (registry) {
      const { mapped, total } = renderComponents(registry, root);
      document.getElementById("sc-count").textContent = `Components ${mapped}/${total} mapped`;
    } else {
      root.append($("p", { class: "sc-err", text: "registry.js를 불러오지 못했어요. node ds/build-figma.mjs 를 실행해주세요." }));
    }
  }
  main();
})();
