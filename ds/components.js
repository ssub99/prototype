/**
 * Rallyz DS components (vanilla DOM).
 * Figma: one master per state  →  code: one factory per family, states as props.
 * Every element carries data-figma="<master name>" so a screen can be traced back to the library.
 * Spelling `navagation` matches the library.
 */
import { Icon } from "./icons.js";

/* ------------------------------------------------------------------ */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "className") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value;
    else if (key === "style" && typeof value === "object") Object.assign(node.style, value);
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === "dataset") Object.assign(node.dataset, value);
    else node.setAttribute(key, value === true ? "" : String(value));
  }
  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}
const cx = (...c) => c.filter(Boolean).join(" ");
const figma = (node, name) => ((node.dataset.figma = name), node);
const ic = (name, size, color) => Icon(name, { size, color });
let uid = 0;
const nextId = (p) => `${p}-${++uid}`;

/* ================================================================== */
/* Button                                                              */
/* ================================================================== */
const SIZE_NAME = { 64: "64_large/Large", 56: "56_regular/Regular", 48: "48_small/Small", 40: "40_xsmall/XSmall", 32: "32_xxsmall/XXSmall", t32: "32_tiny/Tiny", t24: "24_tiny/Tiny", t16: "16_tiny/Tiny" };
const COLOR_NAME = { green: "Green", grey: "Grey", red: "Red", lightgrey: "LightGrey" };

/**
 * button/{solid|line}/{enable|disable}/{size}/…
 * @param {{label?:string, variant?:'solid'|'line', color?:'green'|'grey'|'red'|'lightgrey',
 *   size?:64|56|48|40|32|'t32'|'t24'|'t16', disabled?:boolean, count?:string|number,
 *   countIcon?:'member'|'classlist', arrow?:boolean, block?:boolean, onClick?:Function, type?:string}} p
 */
export function Button({
  label = "Button", variant = "solid", color = "green", size = 56, disabled = false,
  count, countIcon = "member", arrow = false, block, onClick, type = "button",
} = {}) {
  const sizeKey = String(size);
  const tiny = sizeKey.startsWith("t");
  const btn = el("button", {
    type,
    className: cx("rz-btn", `rz-btn--${variant}`, `rz-btn--${color}`, `rz-btn--${sizeKey}`,
      count != null && "rz-btn--count", arrow && "rz-btn--arrow", block && "rz-btn--block", disabled && "is-disabled"),
    disabled: disabled || undefined,
    onClick,
  });
  if (count != null) {
    const iconEl = ic(countIcon === "classlist" ? "line/16_classlist" : "line/my", 16, "currentColor");
    btn.append(iconEl, String(count)); // Figma draws the icon first for both iconAdd01/02
  } else {
    btn.append(label);
  }
  if (arrow) btn.append(ic("line/ic24_arrow-right", 12, "currentColor"));
  const kind = variant === "solid" && !tiny ? (disabled ? "solid" : color === "red" ? "solid" : "fill") : variant === "solid" ? "fill" : "line";
  figma(btn, `button/${variant}/${disabled ? "disable" : "enable"}/${SIZE_NAME[sizeKey] || sizeKey}_${kind}_button[${COLOR_NAME[color] || color}]`);
  return btn;
}

/** button/mix/enable/56_regular/{2Regular|3Regular}_mix_button[Green|Grey_Green] */
export function ButtonGroup({ primary = "Button", secondary = "Button", secondaryColor = "green", prev = false, onPrimary, onSecondary, onPrev } = {}) {
  const row = el("div", { className: "rz-btn-group" });
  if (prev) {
    row.append(el("button", { type: "button", className: "rz-btn-circle", "aria-label": "이전", onClick: onPrev }, [ic("glyph/chevron-left", 28, "var(--rz-gray-06)")]));
  }
  row.append(
    Button({ label: secondary, variant: "line", color: secondaryColor, size: 56, onClick: onSecondary }),
    Button({ label: primary, variant: "solid", color: "green", size: 56, onClick: onPrimary }),
  );
  return figma(row, `button/mix/enable/56_regular/${prev ? "3" : "2"}Regular_mix_button[${secondaryColor === "grey" ? "Grey_Green" : "Green"}]`);
}

/** button/solid/enable/56_regular/3Large_fill_button[Green] — full-bleed 375 bar */
export function ButtonBar({ labels = ["Button", "Button", "Button"], onClick } = {}) {
  const bar = el("div", { className: "rz-btn-bar" });
  labels.forEach((label, i) => bar.append(Button({ label, size: 56, onClick: () => onClick?.(i) })));
  return figma(bar, "button/solid/enable/56_regular/3Large_fill_button[Green]");
}

/** XSmall_line_accordian-button01 (접기) / 02 (펼치기) */
export function AccordionButton({ open = true, onToggle } = {}) {
  const btn = el("button", { type: "button", className: "rz-btn rz-btn--accordion", "aria-expanded": String(open) });
  const render = () => {
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    btn.replaceChildren(ic(isOpen ? "glyph/chevron-up" : "glyph/chevron-down-16", 16, "var(--rz-gray-04)"), isOpen ? "접기" : "펼치기");
    figma(btn, `button/line/enable/40_xsmall/XSmall_line_accordian-button0${isOpen ? 1 : 2}[Grey]`);
  };
  btn.addEventListener("click", () => {
    btn.setAttribute("aria-expanded", String(btn.getAttribute("aria-expanded") !== "true"));
    render();
    onToggle?.(btn.getAttribute("aria-expanded") === "true");
  });
  render();
  return btn;
}

/**
 * Attachments 32 · state: 'empty' (dashed "Attachments"), 'done' (file + close), 'feed' (file03 icon), 'days' (월, 수, 목 | 종일)
 */
export function Attachment({ state = "empty", name = "Filename.jpg", label = "Attachments", disabled = false, removable = true, days = "월, 수, 목", time = "종일", onClick, onRemove } = {}) {
  if (state === "empty") {
    const b = el("button", { type: "button", className: cx("rz-attach rz-attach--empty", disabled && "is-disabled"), disabled: disabled || undefined, onClick },
      [ic("line/16_file01", 16, disabled ? "var(--rz-gray-04)" : "var(--rz-gray-06)"), el("span", { text: label })]);
    return figma(b, `button/line/${disabled ? "disable" : "enable"}/32_xxsmall/XXSmall_line_attachments[Grey]`);
  }
  const root = el("div", { className: cx("rz-attach", `rz-attach--${state}`, disabled && "is-disabled") });
  if (state === "days") {
    root.append(el("div", { className: "rz-attach__days" }, [el("strong", { text: days }), el("span", { className: "rz-attach__bar" }), el("span", { text: time })]));
  } else {
    const color = disabled ? "var(--rz-gray-04)" : state === "done" ? "var(--rz-blue-03)" : undefined;
    root.append(el("div", { className: "rz-attach__file" }, [ic(state === "feed" ? "line/16_file03" : "line/16_file01", 16, color), el("span", { className: "rz-attach__name", text: name })]));
  }
  if (removable && state !== "empty") {
    const x = el("button", { type: "button", className: "rz-attach__close", "aria-label": "삭제", onClick: () => (onRemove ? onRemove() : root.remove()) }, [ic("line/ic24_close-type01", 16, "var(--rz-gray-04)")]);
    root.append(x);
  }
  const fname = state === "days" ? "XXSmall_line_close" : state === "feed" ? `XXSmall_line_attachmentsFeed-complete${removable ? "" : ""}` : "XXSmall_line_attachments-complete";
  return figma(root, `button/line/${disabled ? "disable" : "enable"}/32_xxsmall/${fname}[Grey]`);
}

/* ================================================================== */
/* Chip                                                                */
/* ================================================================== */
/**
 * chip/{regular/R16|small/R12|tiny/R4}/{type}
 * regular: type01-solid · type02-solid · type03-solid · type02-line · type03-line · type04-line(+x) · type05-line(#) · type06-line(# +x)
 * small:   type01 · type02 · type03 · type04
 * tiny:    type01 … type06
 */
export function Chip({ label = "Text", size = "regular", type, onRemove, editable = false } = {}) {
  const t = type || (size === "regular" ? "type01-solid" : "type01");
  const hash = size === "regular" && (t === "type05-line" || t === "type06-line");
  const removable = size === "regular" && (t === "type04-line" || t === "type06-line");
  const chip = el("span", { className: cx("rz-chip", `rz-chip--${size}`, `rz-chip--${t}`, editable && "rz-chip--name") }, [hash ? `# ${label}` : label]);
  if (removable) {
    chip.append(el("button", { type: "button", className: "rz-chip__remove", "aria-label": `${label} 삭제`, onClick: () => (onRemove ? onRemove() : chip.remove()) }, [ic("glyph/chip-close", 14)]));
  }
  if (editable) chip.append(ic("line/16_edit", 12, "var(--rz-primary)"));
  const r = { regular: "R16", small: "R12", tiny: "R4" }[size];
  return figma(chip, `chip/${size}/${r}/${t}`);
}

/* ================================================================== */
/* Input                                                               */
/* ================================================================== */
const stateOf = ({ disabled, error, value }) => (disabled ? "disable" : error ? "error" : value ? "complete" : "default");

/**
 * input/line/{default|active|complete|disable|error}/{48_large|32_small}/…_inputbox
 * Active state is :focus-within (or state:'active' to force it for mockups).
 */
export function Input({ placeholder = "Text", value = "", size = 48, disabled = false, error = false, helper, state, required = false, actionLabel, onAction, onInput, name, type = "text" } = {}) {
  const box = el("label", { className: cx("rz-input", size !== 48 && `rz-input--${size}`, disabled && "is-disabled", error && "is-error", state === "active" && "is-active") });
  if (required) box.append(ic("line/16_asterisk", 16, "#33CC33"));
  const input = el("input", { type, placeholder, value: value || undefined, disabled: disabled || undefined, name, onInput: (e) => onInput?.(e.target.value, e) });
  box.append(input);
  if (actionLabel) box.append(Button({ label: actionLabel, variant: "line", color: "green", size: "t32", onClick: onAction }));
  const s = state || stateOf({ disabled, error, value });
  const sz = size === 32 ? "32_small/Small" : "48_large/Large";
  figma(box, `input/line/${s}/${sz}_line_inputbox${required ? "-iconadd" : ""}[${s === "active" ? "Green" : s === "error" ? "Red" : "Grey"}]`);
  if (!helper && !error) return box;
  const field = el("div", { className: "rz-field" }, [box]);
  if (helper || error) field.append(el("p", { className: "rz-input__help", text: helper || "*최대 25자까지 적어주세요." }));
  return field;
}

/** input/line/{state}/area/Area_line_textarea */
export function Textarea({ placeholder = "내용을 입력해주세요.", value = "", disabled = false, error = false, state, onInput } = {}) {
  const box = el("label", { className: cx("rz-input rz-input--area", disabled && "is-disabled", error && "is-error", state === "active" && "is-active") });
  const ta = el("textarea", { placeholder, disabled: disabled || undefined, onInput: (e) => onInput?.(e.target.value, e) });
  ta.value = value;
  box.append(ta);
  const s = state || stateOf({ disabled, error, value });
  return figma(box, `input/line/${s}/area/Area_line_textarea[${s === "active" ? "Green" : "Grey"}]`);
}

/** input/line/default/40_regular/Regular_line_search */
export function Search({ placeholder = "Text", value = "", onInput, onSubmit } = {}) {
  const box = el("label", { className: "rz-input rz-input--40 rz-input--search" });
  const input = el("input", { type: "search", placeholder, value: value || undefined, onInput: (e) => onInput?.(e.target.value, e), onKeydown: (e) => e.key === "Enter" && onSubmit?.(e.target.value) });
  box.append(input, el("span", { className: "rz-input__icon" }, [ic("glyph/search-16", 16, "var(--rz-gray-05)")]));
  return figma(box, "input/line/default/40_regular/Regular_line_search[Grey]");
}

/**
 * Select · input/line/{default|active|disable}/{40|48|32}_regular/Regular_line_select
 * Clicking opens a menu (Regular_line_selectbox open state: 122×96 list, shadow 0 3 3).
 */
export function Select({ value = "", placeholder = "Text", options = [], size = 40, disabled = false, open = false, onChange } = {}) {
  const wrap = el("div", { className: "rz-select-wrap" });
  const trigger = el("button", {
    type: "button",
    className: cx("rz-input rz-select", size === 32 ? "rz-select--32" : size === 48 ? "" : "rz-input--40", disabled && "is-disabled"),
    disabled: disabled || undefined,
    "aria-haspopup": "listbox",
  });
  const valueEl = el("span", { className: cx("rz-input__value", !value && "is-placeholder"), text: value || placeholder });
  const chevron = () => (size === 32 ? ic("line/ic24_arrow-down", 16, "var(--rz-gray-06)") : ic(isOpen ? "glyph/chevron-up" : "glyph/chevron-down", 24, "var(--rz-gray-05)"));
  let isOpen = open && !disabled;
  let menu;
  const render = () => {
    trigger.replaceChildren(valueEl, chevron());
    trigger.classList.toggle("is-active", isOpen);
    trigger.setAttribute("aria-expanded", String(isOpen));
    menu?.remove();
    if (isOpen && options.length) {
      menu = el("ul", { className: "rz-select__menu", role: "listbox", style: size === 32 ? { top: "36px" } : size === 40 ? { top: "48px" } : { top: "56px" } });
      for (const opt of options) {
        menu.append(el("li", { role: "option", text: opt, onClick: () => {
          valueEl.textContent = opt; valueEl.classList.remove("is-placeholder"); isOpen = false; render(); onChange?.(opt);
        } }));
      }
      wrap.append(menu);
    }
    const st = disabled ? "disable" : isOpen ? "active" : "default";
    figma(trigger, size === 32 ? `input/line/${st}/32_regular/Regular_line_select[Grey]` : `input/line/${st}/${size}_regular/Regular_line_select[${isOpen ? "Green" : "Grey"}]`);
  };
  trigger.addEventListener("click", () => { if (!disabled) { isOpen = !isOpen; render(); } });
  document.addEventListener("click", (e) => { if (isOpen && !wrap.contains(e.target)) { isOpen = false; render(); } });
  wrap.append(trigger);
  render();
  return wrap;
}

/** input/line/{default|active}/40_regular/Regular_line_selectbox — 122 select + input */
export function SelectBox({ select = {}, input = {} } = {}) {
  const row = el("div", { className: "rz-selectbox" }, [Select({ size: 40, ...select }), Input({ size: 40, ...input })]);
  row.lastChild.classList.add("rz-input--40");
  return figma(row, "input/line/default/40_regular/Regular_line_selectbox[Grey]");
}

/* ================================================================== */
/* Date / Time                                                         */
/* ================================================================== */
/**
 * One date or time box.  kind:'date'|'time'  width:'short'(127)|'long'(168)|'full'(343)|'time'(119)|'select'(119, 14px glyph)
 */
export function DateField({ kind = "date", value, width = "short", active = false, disabled = false, onClick } = {}) {
  const v = value ?? (kind === "date" ? "2021.12.00" : "08:20");
  const iconEl = kind === "time" ? ic("solid/ic24_time", 16, "var(--rz-gray-04)") : width === "select" ? ic("glyph/calendar-14", 14) : ic("line/ic24_nav_calendar", 16, "var(--rz-gray-04)");
  const b = el("button", { type: "button", className: cx("rz-date", `rz-date--${width}`, active && "is-active", disabled && "is-disabled"), disabled: disabled || undefined, onClick }, [iconEl, el("span", { text: v })]);
  return figma(b, `${kind}/${width === "long" || width === "full" ? "long" : "short"}/${disabled ? "disable" : active ? "active" : "default"}`);
}

/** date/{short|long}/{default|active|disable} — date + time pair */
export function DateTime({ date = "2021.12.00", time = "08:20", size = "short", state = "default", onDate, onTime } = {}) {
  const w = size === "long" ? "long" : "short";
  const row = el("div", { className: "rz-date-row" }, [
    DateField({ kind: "date", value: date, width: w, active: state === "active", disabled: state === "disable", onClick: onDate }),
    DateField({ kind: "time", value: time, width: w, disabled: state === "disable", onClick: onTime }),
  ]);
  if (size === "long") row.style.width = "343px";
  return figma(row, `date/${w}/${state}`);
}

/** time/short/{default|active|disable} — from — to */
export function TimeRange({ from = "오전 10:00", to = "오전 11:30", state = "default", onFrom, onTo } = {}) {
  const row = el("div", { className: "rz-date-row" }, [
    DateField({ kind: "time", value: from, width: "time", active: state === "active", disabled: state === "disable", onClick: onFrom }),
    el("span", { className: "rz-date-row__dash" }),
    DateField({ kind: "time", value: to, width: "time", disabled: state === "disable", onClick: onTo }),
  ]);
  row.style.gap = "8px";
  return figma(row, `time/short/${state}`);
}

/** calendar popup used by date/short/select (326×330) */
export function Calendar({ year = 2022, month = 2, selected = 10, onSelect } = {}) {
  let y = year, m = month, sel = selected;
  const root = el("div", { className: "rz-calendar", role: "dialog", "aria-label": "날짜 선택" });
  const render = () => {
    root.replaceChildren();
    const prev = el("button", { type: "button", className: "rz-calendar__nav", "aria-label": "이전 달", onClick: () => { m--; if (m < 1) { m = 12; y--; } render(); } }, [ic("line/ic24_arrow-left", 16, "var(--rz-gray-05)")]);
    const next = el("button", { type: "button", className: "rz-calendar__nav", "aria-label": "다음 달", onClick: () => { m++; if (m > 12) { m = 1; y++; } render(); } }, [ic("line/ic24_arrow-right", 16, "var(--rz-gray-05)")]);
    root.append(el("div", { className: "rz-calendar__head" }, [prev, el("strong", { className: "rz-calendar__title", text: `${y} 년 ${m} 월` }), next]));
    const grid = el("div", { className: "rz-calendar__grid" });
    for (const d of ["일", "월", "화", "수", "목", "금", "토"]) grid.append(el("div", { className: "rz-calendar__dow", text: d }));
    root.append(grid, el("div", { className: "rz-calendar__divider" }));
    const days = el("div", { className: "rz-calendar__grid", style: { marginTop: "8px" } });
    const first = new Date(y, m - 1, 1).getDay();
    const len = new Date(y, m, 0).getDate();
    const prevLen = new Date(y, m - 1, 0).getDate();
    const cells = Math.ceil((first + len) / 7) * 7;
    for (let i = 0; i < cells; i++) {
      const d = i - first + 1;
      const inMonth = d >= 1 && d <= len;
      const label = inMonth ? d : d < 1 ? prevLen + d : d - len;
      const cell = el("button", { type: "button", className: cx("rz-calendar__cell", !inMonth && "is-muted", inMonth && d === sel && "is-selected"), disabled: !inMonth || undefined }, [el("span", { text: label })]);
      if (inMonth) cell.addEventListener("click", () => { sel = d; render(); onSelect?.({ year: y, month: m, day: d }); });
      days.append(cell);
    }
    root.append(days);
  };
  render();
  return figma(root, "calendar");
}

/* ================================================================== */
/* Header                                                              */
/* ================================================================== */
const MAIN_TITLE = { home: "홈", feed: "전체 피드", chat: "채팅방", calendar: "일정", more: "더보기" };

/**
 * header/{home|feed|chat|calendar|more} — gradient app header.
 * Legacy: Header({kind:'flow', title}) → FlowHeader.
 */
export function Header({ kind = "home", title, logoSrc, actionLabel, onAction, onSearch, onNotify, onProfile, showActions = true } = {}) {
  if (kind === "flow") return FlowHeader({ title, lead: "close" });
  const header = el("header", { className: cx("rz-header rz-header--main", `rz-header--${kind}`) });
  const logo = el("span", { className: "rz-header__logo", role: "img", "aria-label": "랠리즈" });
  logo.append(logoSrc ? el("img", { src: logoSrc, alt: "" }) : ic("glyph/logo", undefined, "var(--rz-white)"));
  header.append(logo, el("span", { className: "rz-header__tab", text: title ?? MAIN_TITLE[kind] ?? "" }));
  const actions = el("div", { className: "rz-header__actions" });
  if (kind === "feed" || kind === "chat") {
    actions.append(Button({ label: actionLabel ?? (kind === "feed" ? "글쓰기" : "Btn"), size: "t32", variant: "solid", color: "green", onClick: onAction }));
  } else if (showActions && (kind === "home" || kind === "more")) {
    actions.append(
      el("button", { type: "button", className: "rz-header__icon-btn", "aria-label": "검색", onClick: onSearch }, [ic("line/search", 24, "var(--rz-white)")]),
      el("button", { type: "button", className: "rz-header__icon-btn", "aria-label": "알림", onClick: onNotify }, [ic("line/notification", 24, "var(--rz-white)")]),
      el("button", { type: "button", className: "rz-header__icon-btn", "aria-label": "프로필", onClick: onProfile }, [ic("solid/profile", 24)]),
    );
  }
  header.append(actions);
  return figma(header, `header/${kind}`);
}

/**
 * Flow header (bg Gray_02) — header/{1 title|2 title|none}/{normal|emphasis}/{close|prev}[/btn[Green|Grey]]
 * @param {{title?:string, subtitle?:string, lead?:'close'|'prev'|null, trail?:'calendar'|null,
 *   buttonLabel?:string, buttonColor?:'green'|'grey', onLead?:Function, onTrail?:Function}} p
 */
export function FlowHeader({ title, subtitle, lead = "prev", trail = null, trailText, buttonLabel, buttonColor = "green", onLead, onTrail } = {}) {
  const header = el("header", { className: "rz-header rz-header--flow" });
  if (lead) {
    header.append(el("div", { className: "rz-header__lead" }, [
      el("button", { type: "button", className: "rz-header__icon-btn", "aria-label": lead === "close" ? "닫기" : "이전", onClick: onLead },
        [ic(lead === "close" ? "line/ic24_close-type01" : "line/ic24_arrow-left", 20, "var(--rz-gray-07)")]),
    ]));
  }
  if (title) {
    const center = el("div", { className: "rz-header__center" }, [el("strong", { className: "rz-header__title", text: title })]);
    if (subtitle) center.append(el("span", { className: "rz-header__subtitle", text: subtitle }));
    header.append(center);
  }
  if (buttonLabel || trail || trailText) {
    const t = el("div", { className: "rz-header__trail" });
    if (trailText) t.append(el("span", { className: "rz-header__step", text: trailText }));
    else if (buttonLabel) t.append(Button({ label: buttonLabel, size: "t32", variant: "solid", color: buttonColor, onClick: onTrail }));
    else if (trail === "calendar") t.append(el("button", { type: "button", className: "rz-header__icon-btn", "aria-label": "일정", onClick: onTrail }, [ic("line/ic24_nav_calendar", 20, "var(--rz-gray-07)")]));
    else if (trail === "more") t.append(el("button", { type: "button", className: "rz-header__icon-btn", "aria-label": "더보기", onClick: onTrail }, [ic("line/ic24_more", 24, "var(--rz-gray-07)")]));
    header.append(t);
  }
  const lines = !title ? "none" : subtitle ? "2 title" : "1 title";
  const tone = buttonLabel ? "emphasis" : "normal";
  const name = !title ? `header/none/${lead}` : `header/${lines}/${tone}/${lead}${trail === "calendar" || trail === "more" ? "+icon" : ""}${buttonLabel ? `/btn[${buttonColor === "grey" ? "Grey" : "Green"}]` : ""}`;
  return figma(header, name);
}

/** header/none/close · header/none/2 btn[Grey] — transparent, close-type03 + optional two tiny buttons */
export function PlainHeader({ buttons = [], onClose } = {}) {
  const header = el("header", { className: "rz-header rz-header--plain" }, [
    el("button", { type: "button", className: "rz-header__icon-btn", "aria-label": "닫기", onClick: onClose }, [ic("solid/ic24_close-type03", 24)]),
  ]);
  if (buttons.length) {
    const t = el("div", { className: "rz-header__trail" });
    buttons.forEach((b) => t.append(Button({ size: "t24", variant: "solid", color: "grey", ...(typeof b === "string" ? { label: b } : b) })));
    header.append(t);
  }
  return figma(header, buttons.length ? "header/none/2 btn[Grey]" : "header/none/close");
}

/* ================================================================== */
/* Navagation                                                          */
/* ================================================================== */
const NAV = [["home", "홈"], ["feed", "피드"], ["chat", "채팅"], ["calendar", "일정"], ["more", "더보기"]];
/** navagation/{home|feed|chat|calendar|more} */
/** interactive:false keeps the active tab fixed (for tabs whose screens aren't built). */
export function Navagation({ active = "home", onChange, interactive = true } = {}) {
  const nav = el("nav", { className: "rz-nav", "aria-label": "하단 내비게이션" });
  const render = () => {
    nav.replaceChildren();
    for (const [id, label] of NAV) {
      const on = id === active;
      nav.append(el("button", { type: "button", className: cx("rz-nav__tab", on && "is-active"), "aria-label": label, "aria-current": on ? "page" : undefined,
        onClick: () => { if (!interactive) return; active = id; render(); onChange?.(id); } }, [ic(`line/ic24_nav_${id}`, 24, "currentColor")]));
    }
    figma(nav, `navagation/${active}`);
  };
  render();
  return nav;
}

/* ================================================================== */
/* Tabs                                                                */
/* ================================================================== */
/**
 * type: 'tap01' (underline 375, 2 or 3 tabs) · 'tap02' (segmented 343×48) · 'tap02-tiny' (88×20)
 *       'segment' (tiny_solid_*Segmented 119×24) · 'tap03' (text tabs with ticks)
 */
export function Tabs({ type = "tap01", items = ["Text", "Text"], selected = 0, onChange } = {}) {
  const cfg = {
    tap01: ["rz-tab01", "rz-tab01__item"],
    tap02: ["rz-tab02", "rz-tab02__item"],
    "tap02-tiny": ["rz-tab02 rz-tab02--tiny", "rz-tab02__item"],
    segment: ["rz-segment", "rz-segment__item"],
    tap03: ["rz-tab03", "rz-tab03__item"],
  }[type];
  const root = el("div", { className: cfg[0], role: "tablist" });
  const render = () => {
    root.replaceChildren();
    items.forEach((label, i) => {
      if (type === "tap03" && i > 0) root.append(el("span", { className: "rz-tab03__sep", "aria-hidden": "true" }));
      root.append(el("button", { type: "button", role: "tab", className: cx(cfg[1], i === selected && "is-active"), "aria-selected": String(i === selected), text: label,
        onClick: () => { selected = i; render(); onChange?.(i); } }));
    });
    const pos = items.length === 3 ? ["left", "senter", "right"][selected] : selected === 0 ? "left" : "right";
    const names = {
      tap01: items.length === 3 ? `tap01/line/active/48_large/Large_line_3tap_${pos}[Green]` : `tap01/line/active/48_large/Large_line_${pos}tap[Green]`,
      tap02: `tap02/line/active/48_large/Large_line_${pos}tap[Green]`,
      "tap02-tiny": `tap02/solid/active/tiny/tiny_solid_${pos}tap[Green]`,
      segment: `tap02/solid/active/tiny/tiny_solid_${pos}Segmented`,
      tap03: `tap03/line/active/Small_${pos === "left" ? "lefttap" : pos}[Green]`,
    };
    figma(root, names[type]);
  };
  render();
  return root;
}
/** legacy alias */
export const Tap = ({ items, selected, family = "tap01" } = {}) => Tabs({ type: family, items, selected });

/* ================================================================== */
/* Controls                                                            */
/* ================================================================== */
/**
 * Checkbox · control/check/type02 (16) + control/checkbox-label/{state}/{labelStyle}
 *            control/check/type01 (12) + control/check-label/type01 when size:12
 * labelStyle: body02_bold|body02_medium|body02_regular|small01_regular|small01_medium
 */
export function Checkbox({ label = "", checked = false, disabled = false, size = 16, labelStyle = "body02_regular", name, onChange } = {}) {
  const root = el("label", { className: cx("rz-check", size === 12 && "rz-check--12", label && size !== 12 && `rz-label--${labelStyle.replace("_", "-")}`) });
  const input = el("input", { type: "checkbox", checked: checked || undefined, disabled: disabled || undefined, name, onChange: (e) => { stamp(); onChange?.(e.target.checked, e); } });
  root.append(input, el("span", { className: "rz-check__box", "aria-hidden": "true" }, [ic(size === 12 ? "glyph/check-mark-12" : "glyph/check-mark-16", size === 12 ? undefined : undefined, "currentColor")]));
  if (label) root.append(el("span", { text: label }));
  const stamp = () => {
    const st = input.disabled ? "disable" : input.checked ? "checked" : "default";
    figma(root, size === 12 ? (label ? `control/check-label/type01/${st}` : `control/check/type01/${st}`) : label ? `control/checkbox-label/${st}/${labelStyle}` : `control/check/type02/${st}`);
  };
  stamp();
  return root;
}
/** legacy: Check({label, checked, variant:'type01'}) → 12px checkbox */
export const Check = ({ label = "", checked = false, variant = "type01", name, onChange } = {}) =>
  Checkbox({ label, checked, name, onChange, size: variant === "type01" ? 12 : 16 });

/** control/radio/{default|selected|disable_type01|disable_type02} + radio-label/{body02_regular|body02_bold} */
export function Radio({ label = "", checked = false, disabled = false, name = nextId("rz-radio"), value, labelStyle = "body02_regular", onChange } = {}) {
  const root = el("label", { className: cx("rz-radio", label && `rz-label--${labelStyle.replace("_", "-")}`) });
  const input = el("input", { type: "radio", name, value, checked: checked || undefined, disabled: disabled || undefined, onChange: (e) => onChange?.(value ?? true, e) });
  root.append(input, el("span", { className: "rz-radio__dot", "aria-hidden": "true" }));
  if (label) root.append(el("span", { text: label }));
  const st = disabled ? (checked ? "disable_type02" : "disable_type01") : checked ? "selected" : "default";
  return figma(root, label ? `control/radio-label/${labelStyle}/${st}` : `control/radio/${st}`);
}

/** control/check/type03 (circle 24) · type05 (star 24) */
export function CheckIcon({ type = "circle", checked = false, label = "선택", onChange } = {}) {
  const root = el("label", { className: "rz-check-icon", title: label });
  root.append(
    el("input", { type: "checkbox", checked: checked || undefined, "aria-label": label, style: { position: "absolute", opacity: 0 }, onChange: (e) => onChange?.(e.target.checked) }),
    ic(`glyph/check-${type}-default`, 24), ic(`glyph/check-${type}-checked`, 24),
  );
  root.children[1].classList.add("is-off");
  root.children[2].classList.add("is-on");
  return figma(root, `control/check/${type === "star" ? "type05" : "type03"}/${checked ? "checked" : "default"}`);
}

/** control/check/type04 — 42 day circle (요일 선택) */
export function DayCheck({ label = "월", checked = false, onChange } = {}) {
  const root = el("label", { className: "rz-day" }, [
    el("input", { type: "checkbox", checked: checked || undefined, onChange: (e) => onChange?.(e.target.checked) }),
    el("span", { text: label }),
  ]);
  return figma(root, `control/check/type04/${checked ? "checked" : "default"}`);
}

/**
 * Choice chip-button · control/check/type06 (32, r8) · type07 (48, r10)
 * NOTE: in Figma, type07 'checked' and 'default' look swapped (default is the green one). Code follows the visuals: checked = green.
 */
export function Choice({ label = "텍스트", checked = false, disabled = false, size = 32, type = "checkbox", name, onChange } = {}) {
  const root = el("label", { className: cx("rz-choice", size === 48 && "rz-choice--48") }, [
    el("input", { type, name, checked: checked || undefined, disabled: disabled || undefined, onChange: (e) => onChange?.(e.target.checked, e) }),
    el("span", { text: label }),
  ]);
  const t = size === 48 ? "type07" : "type06";
  return figma(root, `control/check/${t}/${disabled ? "disable" : checked ? (t === "type07" ? "default" : "checked") : t === "type07" ? "checked" : "default"}`);
}

/** control/toggle/{on|off|disable_on|disable_off} */
export function Toggle({ on = false, disabled = false, label = "토글", onChange } = {}) {
  const root = el("label", { className: "rz-toggle" });
  const input = el("input", { type: "checkbox", role: "switch", checked: on || undefined, disabled: disabled || undefined, "aria-label": label,
    onChange: (e) => { stamp(); onChange?.(e.target.checked); } });
  root.append(input, el("span", { className: "rz-toggle__track" }), el("span", { className: "rz-toggle__knob" }, [ic("glyph/toggle-check", undefined, "var(--rz-white)")]));
  const stamp = () => figma(root, `control/toggle/${input.disabled ? "disable_" : ""}${input.checked ? "on" : "off"}`);
  stamp();
  return root;
}

/* ================================================================== */
/* Feedback                                                            */
/* ================================================================== */
/** toast/solid/feedback/343_regular/{type01|type02}/Regular_fill_toast[Grey] — type02 adds "닫기" */
export function Toast({ text = "Text", type, action, onAction } = {}) {
  const withAction = action || type === "type02";
  const t = el("div", { className: "rz-toast", role: "status" }, [el("span", { text })]);
  if (withAction) t.append(el("button", { type: "button", className: "rz-toast__action", text: action || "닫기", onClick: () => (onAction ? onAction() : t.remove()) }));
  return figma(t, `toast/solid/feedback/343_regular/${withAction ? "type02" : "type01"}/Regular_fill_toast[Grey]`);
}

/** Toast that appears for `ms` then removes itself, centred above `bottom` px of `container`. */
export function showToast(container, opts = {}, { ms = 2000, bottom = 88 } = {}) {
  const t = Toast(opts);
  Object.assign(t.style, { position: "absolute", left: "16px", right: "16px", bottom: bottom + "px", width: "auto", zIndex: 50 });
  container.append(t);
  setTimeout(() => t.remove(), ms);
  return t;
}

/**
 * Alert (confirm modal) — 343 card, r8, shadow 0 5 12, message Body02/Regular + full-width 40 button, dim black 30%.
 * Returns the overlay element; it removes itself on confirm.
 */
export function Alert({ title, message = "메시지를 입력하세요.", confirmLabel = "확인", cancelLabel, cancelColor = "grey", messageSize = "body", onConfirm, onCancel } = {}) {
  const dim = el("div", { className: "rz-dim", role: "presentation" });
  const card = el("div", { className: "rz-alert", role: "alertdialog", "aria-modal": "true" }, [el("p", { className: cx("rz-alert__message", messageSize === "small" && "rz-alert__message--small"), text: message })]);
  if (title) card.prepend(el("strong", { className: "rz-alert__title", text: title }));
  const actions = el("div", { className: "rz-alert__actions" });
  const close = () => dim.remove();
  // Figma: single action = XSmall 40 button · two actions = Small 48 line(grey) + fill(green)
  const size = cancelLabel ? 48 : 40;
  if (cancelLabel) actions.append(Button({ label: cancelLabel, variant: "line", color: cancelColor, size, onClick: () => { close(); onCancel?.(); } }));
  const ok = Button({ label: confirmLabel, size, onClick: () => { close(); onConfirm?.(); } });
  actions.append(ok);
  card.append(actions);
  dim.append(card);
  dim.addEventListener("keydown", (e) => e.key === "Escape" && (close(), onCancel?.()));
  setTimeout(() => ok.focus(), 0);
  return figma(dim, "alert");
}

/** Mount an Alert over `container` (e.g. the device screen). */
export function showAlert(container, opts = {}) {
  const a = Alert(opts);
  container.append(a);
  return a;
}

/** tooltip {type01: arrow down · type02: arrow up} */
export function Tooltip({ title = "Title", text = "Lorem ipsum dolor sit amet consectetur. Nibh.", arrow = "down", onClose } = {}) {
  const root = el("div", { className: cx("rz-tooltip", arrow === "up" && "rz-tooltip--up"), role: "tooltip" });
  const box = el("div", { className: "rz-tooltip__box" }, [
    el("div", { className: "rz-tooltip__head" }, [
      el("strong", { className: "rz-tooltip__title", text: title }),
      el("button", { type: "button", className: "rz-tooltip__close", "aria-label": "닫기", onClick: () => (onClose ? onClose() : root.remove()) }, [ic("line/ic24_close-type01", 20, "var(--rz-white)")]),
    ]),
    el("p", { className: "rz-tooltip__body", text }),
  ]);
  root.append(box, el("span", { className: "rz-tooltip__arrow" }));
  return figma(root, `tooltip{Property 3=${arrow === "up" ? "type02" : "type01"}}`);
}

/**
 * alarm/message_notification — icon 40 + copy (bold first line) + chevron, footer with "오늘 하루 보지 않기" / 닫기
 * Legacy: message with "\n" is still accepted; iconSrc overrides the SVG icon.
 */
export function Alarm({ title, message = "초기셋팅이 완료되지 않았습니다.\n계속 진행하시겠습니까?", icon = "solid/ic40_alarm-orange", iconSrc, hideTodayLabel = "오늘 하루 보지 않기", onOpen, onClose, onHideToday } = {}) {
  const card = el("article", { className: "rz-alarm" });
  const copy = el("p", { className: "rz-alarm__copy" });
  if (title) copy.append(el("strong", { text: title }));
  copy.append(message);
  card.append(el("div", { className: "rz-alarm__top" }, [
    iconSrc ? el("img", { src: iconSrc, alt: "", width: 40, height: 40 }) : ic(icon, 40),
    copy,
    el("button", { type: "button", className: "rz-alarm__more", "aria-label": "자세히", onClick: onOpen }, [ic("glyph/chevron-right", 24, "var(--rz-gray-04)")]),
  ]));
  card.append(el("div", { className: "rz-alarm__bottom" }, [
    Checkbox({ label: hideTodayLabel, size: 12, onChange: onHideToday }),
    el("button", { type: "button", className: "rz-alarm__close", text: "닫기", onClick: () => { card.remove(); onClose?.(); } }),
  ]));
  return figma(card, "alarm/message_notification");
}

/** alarm/message_fill — sub + bold title + close, full-width green 40 button */
export function AlarmFill({ sub = "랠리스 미술학원 / 월수금 초1B", title = "2022년 7월 청구서가 도착했어요!", icon = "flat/ic40_message", action = "납부하기", onAction, onClose } = {}) {
  const card = el("article", { className: "rz-alarm rz-alarm--fill" });
  card.append(
    el("div", { className: "rz-alarm__top" }, [
      ic(icon, 40),
      el("div", { className: "rz-alarm__text" }, [el("span", { className: "rz-alarm__sub", text: sub }), el("strong", { className: "rz-alarm__title", text: title })]),
      el("button", { type: "button", className: "rz-alarm__x", "aria-label": "닫기", onClick: () => { card.remove(); onClose?.(); } }, [ic("glyph/close-type03", 24)]),
    ]),
    Button({ label: action, size: 40, onClick: onAction }),
  );
  return figma(card, "alarm/message_fill");
}

/* ================================================================== */
/* Lists                                                               */
/* ================================================================== */
function trailOf(trail) {
  if (!trail) return null;
  const t = el("div", { className: "rz-row__trail" });
  for (const item of [].concat(trail)) {
    if (item === "arrow") t.append(ic("line/ic24_arrow-right", 24, "var(--rz-gray-04)"));
    else if (item === "more") t.append(el("button", { type: "button", className: "rz-header__icon-btn", "aria-label": "더보기" }, [ic("line/ic24_more", 24, "var(--rz-gray-04)")]));
    else if (item?.nodeType) t.append(item);
    else if (item && typeof item === "object") t.append(Button({ size: "t32", variant: "line", color: "green", ...item }));
  }
  return t;
}

/**
 * Member-style row · list/member, employee, employee_add, member-feed, employee-authorization, member-rating,
 * student_default|selected, member_default|checked|invite|connect, attend-list
 * @param {{name?:string, type?:string, tag?:string, meta?:string|Node, aside?:string, height?:48|56|80,
 *   trail?:'arrow'|'more'|Node|object|Array, select?:'radio'|'check', selected?:boolean, divider?:boolean, onClick?:Function}} p
 */
export function MemberRow({ name = "이름", type, tag, meta = "010-1234-1234", aside, height = 48, trail, select, selected = false, divider = false, avatar, onClick, figmaName = "list/member" } = {}) {
  const row = el(onClick ? "button" : "div", { type: onClick ? "button" : undefined, className: cx("rz-row", height !== 48 && `rz-row--${height}`, divider && "rz-row--line"), onClick, style: onClick ? { border: 0, cursor: "pointer" } : undefined });
  if (divider) row.style.borderBottom = "1px solid var(--rz-gray-02)";
  row.append(avatar?.nodeType ? avatar : avatar ? el("img", { className: "rz-row__avatar", src: avatar, alt: "", style: { borderRadius: "50%" } }) : ic("solid/profile", 32));
  const body = el("div", { className: "rz-row__body" });
  if (tag) body.append(el("span", { className: "rz-row__tag", text: tag }));
  const titleLine = el("div", { className: "rz-row__title-line" }, [el("span", { className: "rz-row__title", text: name })]);
  if (type) titleLine.append(el("span", { className: "rz-row__type", text: type }));
  body.append(titleLine);
  if (meta) body.append(meta.nodeType ? meta : el("span", { className: "rz-row__meta", text: meta }));
  row.append(body);
  if (aside) row.append(el("span", { className: "rz-row__aside", text: aside }));
  if (select === "radio") row.append(Radio({ checked: selected }));
  else if (select === "check") row.append(Checkbox({ checked: selected }));
  const t = trailOf(trail);
  if (t) row.append(t);
  return figma(row, figmaName);
}

/** list/report-{attendance|grade|rating} */
export function ReportRow({ kind = "attendance", title, desc, arrow, onClick } = {}) {
  const d = {
    attendance: ["출결", "출석, 조퇴, 결석 현황을 확인해 보세요.", "flat/ic32_attendance"],
    grade: ["성적", "시험 유형별 성적을 확인해 보세요.", "flat/ic32_grade"],
    rating: ["학습평가", "이번 달 학습에 대한 종합적인 평가에요.", "flat/ic32_rating"],
  }[kind];
  const row = el("div", { className: "rz-row", onClick, style: { cursor: onClick ? "pointer" : undefined, gap: "8px" } }, [
    el("span", { className: "rz-row__report" }, [ic(d[2], 32)]),
    el("div", { className: "rz-row__body" }, [el("span", { className: "rz-row__title", text: title ?? d[0] }), el("span", { className: "rz-row__desc", text: desc ?? d[1] })]),
  ]);
  if (arrow ?? kind === "attendance") row.append(trailOf("arrow"));
  return figma(row, `list/report-${kind}`);
}

/** list/grade_management */
export function GradeRow({ badge = "성취", title = "성적명", date = "2022.01.22", count = "17명" } = {}) {
  const row = el("div", { className: "rz-row", style: { gap: "6px" } }, [
    el("span", { className: "rz-row__badge", text: badge }),
    el("div", { className: "rz-row__body" }, [
      el("span", { className: "rz-row__title", text: title }),
      el("span", { className: "rz-row__meta" }, [el("span", { className: "is-strong", text: date }), el("span", { className: "is-accent", text: count })]),
    ]),
    trailOf("more"),
  ]);
  return figma(row, "list/grade_management");
}

/** generic text row: list/chat, edit-authorization01|02, edit-tuition, live-class, reference-list */
export function TextRow({ title = "Title", titleWeight = "bold", meta = [], trail, divider = false, figmaName = "list/chat" } = {}) {
  const body = el("div", { className: "rz-row__body" }, [el("span", { className: cx("rz-row__title", titleWeight === "medium" && "rz-row__title--medium"), text: title })]);
  if (meta.length) {
    const m = el("span", { className: "rz-row__meta" });
    meta.forEach((item, i) => {
      if (item === "|") { m.append(el("span", { className: "rz-row__meta-sep" })); return; }
      const [text, tone] = Array.isArray(item) ? item : [item];
      if (i > 0 && meta[i - 1] !== "|") m.append(" ");
      m.append(el("span", { className: tone ? `is-${tone}` : undefined, text }));
    });
    body.append(m);
  }
  const row = el("div", { className: cx("rz-row", divider && "rz-row--line") }, [body]);
  const t = trailOf(trail);
  if (t) row.append(t);
  return figma(row, figmaName);
}

export const ChatRow = ({ title = "김랠리, 송랠리, 권랠리", members = "참여인원 3명", date = "2022.01.03  09:15:00", action = "수정", onAction } = {}) =>
  TextRow({ title, meta: [[members, "accent"], date], trail: [{ label: action, onClick: onAction }], figmaName: "list/chat" });

export const AuthRow = ({ title = "강사", count = 999, editable = true, onCount, onAction } = {}) =>
  TextRow({ title, trail: [{ count, onClick: onCount }, editable ? { label: "수정", onClick: onAction } : { label: "상세", color: "grey", onClick: onAction }], figmaName: `list/edit-authorization0${editable ? 2 : 1}` });

export const TuitionRow = ({ title = "기본 학원비", kind = "수강료 구분", price = "120,000원", count = 999, onCount, onAction } = {}) =>
  TextRow({ title, meta: [[kind, "accent"], price], trail: [{ count, countIcon: "classlist", onClick: onCount }, { label: "수정", onClick: onAction }], figmaName: "list/edit-tuition" });

export function LiveRow({ title = "생성된 라이브이름", members = "참여인원 N명", date = "2022.01.01", onLink, onEnd, onEnter } = {}) {
  const link = el("button", { type: "button", className: "rz-row__link", "aria-label": "링크 복사", onClick: onLink }, [ic("line/ic24_link", 20, "var(--rz-gray-06)")]);
  return TextRow({ title, meta: [members, date], divider: true, trail: [link, { label: "종료", color: "grey", onClick: onEnd }, { label: "입장", onClick: onEnter }], figmaName: "list/live-class" });
}

export const ReferenceRow = ({ name = "20220509_0315_학원관련자료.pdf", size = "75.2KB", date = "2022.05.10." } = {}) => {
  const row = TextRow({ title: name, titleWeight: "medium", meta: [size, "|", date], divider: true, figmaName: "list/reference-list" });
  row.style.minHeight = "56px";
  return row;
};

/** list/attend-list — 결석(red line) + 수정 + more */
export function AttendRow({ name = "이름", type = "구분", phone = "010-1234-1234", onAbsent, onEdit } = {}) {
  const absent = Button({ label: "결석", size: "t32", variant: "line", color: "red", onClick: onAbsent });
  absent.style.setProperty("--bd", "var(--rz-error)");
  absent.style.setProperty("--fg", "var(--rz-error)");
  absent.style.background = "transparent";
  return MemberRow({ name, type, meta: phone, height: 56, divider: true, trail: [absent, { label: "수정", onClick: onEdit }, "more"], figmaName: "list/attend-list" });
}

/** list/class_{default|selected|disable} — thumbnail row with radio */
export function ClassRow({ title = "월수금 중A2", teacher = "미배정", thumb = "assets/ds/thumb-class-list.png", state = "default", name = "rz-class", onSelect } = {}) {
  const row = el("label", { className: "rz-row rz-row--74 rz-row--class", style: { cursor: state === "disable" ? "default" : "pointer" } }, [
    el("span", { className: "rz-row__thumb" }, [el("img", { src: thumb, alt: "" })]),
    el("div", { className: "rz-row__body" }, [
      el("span", { className: "rz-row__title", text: title }),
      el("span", { className: "rz-row__meta" }, ["담당 강사 ", el("b", { text: teacher })]),
    ]),
  ]);
  const r = Radio({ checked: state === "selected", disabled: state === "disable", name, onChange: onSelect });
  r.style.marginLeft = "auto";
  row.append(r);
  return figma(row, `list/class_${state}`);
}

/**
 * Class card · list/class_mainpage01 (no chips) · 02 (chips) · 03 (name chip with edit) · class_detailpage (subject chips)
 */
/** daysIcon: "arrow" (expand) · "info" (opens 수업일시 정보 — 홈 006.04) */
export function ClassCard({ variant = "main02", org = "랠리즈 미술학원", title = "월수금 초1B", days = "월/화/수/목/금/토/일", chips, thumb = "assets/ds/thumb-class-art.png", daysIcon = "arrow", onDays } = {}) {
  const info = el("div", { className: "rz-card__info" });
  if (variant === "main02") {
    info.append(el("div", { className: "rz-card__chips" }, (chips ?? ["자녀클래스", "김랠리1"]).map((c, i) => Chip({ label: c, size: "tiny", type: i === 0 ? "type01" : "type02" }))));
  } else if (variant === "main03") {
    info.append(el("div", { className: "rz-card__chips" }, [Chip({ label: (chips ?? ["김랠리1"])[0], size: "tiny", type: "type02", editable: true })]));
  } else if (variant === "detail") {
    info.append(el("div", { className: "rz-card__chips" }, (chips ?? ["국어", "수학"]).map((c) => Chip({ label: c, size: "small", type: "type02" }))));
  }
  if (variant !== "detail") info.append(el("span", { className: "rz-card__org", text: org }));
  info.append(el("strong", { className: "rz-card__title", text: title }));
  const card = el("article", { className: cx("rz-card", (variant === "main01" || variant === "detail") && "rz-card--tight") }, [
    el("div", { className: cx("rz-card__main", variant !== "detail" && "rz-card__main--64") }, [el("span", { className: "rz-row__thumb" }, [el("img", { src: thumb, alt: "" })]), info]),
    el("button", { type: "button", className: "rz-card__days", onClick: onDays }, [el("span", {}, [el("span", { text: "수업요일" }), el("span", { text: days })]), daysIcon === "info" ? ic("glyph/info-16", 16) : ic("line/ic24_arrow-down", 16, "var(--rz-gray-07)")]),
  ]);
  return figma(card, variant === "detail" ? "list/class_detailpage" : `list/class_mainpage0${variant.slice(-1)}`);
}

/** list/institute_lecture (title + arrow) · list/institute_manage (actions + stats) */
export function InstituteCard({ variant = "lecture", title, thumb, stats = [["현재 학생수", "160명"], ["신규 문의", "5건"], ["미수납", "₩5,345,310"]], actions = ["학원관리", "학원현황"], onClick, onAction } = {}) {
  const manage = variant === "manage";
  const info = el("div", { className: "rz-card__info" }, [el("strong", { className: "rz-card__title", text: title ?? (manage ? "랠리즈 태권도" : "랠리즈 영어") })]);
  if (manage) info.append(el("div", { className: "rz-card__actions" }, actions.map((a, i) => Button({ label: a, size: "t24", color: "grey", arrow: true, onClick: (e) => { e.stopPropagation(); onAction?.(i); } }))));
  const main = el("div", { className: "rz-card__main", onClick, style: { cursor: onClick ? "pointer" : undefined } }, [
    el("span", { className: "rz-row__thumb" }, [el("img", { src: thumb ?? (manage ? "assets/ds/thumb-academy-taekwondo.png" : "assets/ds/thumb-academy-english.png"), alt: "" })]),
    info, ic("line/ic24_arrow-right", 24, "var(--rz-gray-04)"),
  ]);
  const card = el("article", { className: cx("rz-card", !manage && "rz-card--tight") }, [main]);
  if (manage) {
    const dl = el("dl", { className: "rz-card__stats" }, [el("h4", { text: "학원현황" })]);
    stats.forEach(([k, v]) => dl.append(el("dt", { text: k }), el("dd", { text: v })));
    card.append(dl);
  }
  return figma(card, `list/institute_${manage ? "manage" : "lecture"}`);
}

/** Stack rows with Gray_03 dividers (…_listup masters). */
export function List({ items = [], divided = true } = {}) {
  const list = el("div", { className: cx("rz-list", divided && "rz-list--divided") });
  items.forEach((i) => list.append(i));
  return list;
}

/* ================================================================== */
/* Chrome                                                              */
/* ================================================================== */
export function StatusBar({ time = "9:41" } = {}) {
  const bar = el("div", { className: "rz-status-bar", "aria-hidden": "true" }, [el("span", { className: "rz-status-bar__time", text: time }), ic("glyph/status-icons", undefined, "#000")]);
  return figma(bar, "Status Bar");
}

export function Device({ children } = {}) {
  const device = el("div", { className: "rz-device rz", "aria-label": "Device / Large 395" });
  const screen = el("div", { className: "rz-device__screen" });
  for (const child of [].concat(children || [])) if (child) screen.append(child);
  device.append(screen);
  return figma(device, "Device / Large 395");
}

export { Icon };

export const Rallyz = {
  Icon, Button, ButtonGroup, ButtonBar, AccordionButton, Attachment, Chip,
  Input, Textarea, Search, Select, SelectBox, DateField, DateTime, TimeRange, Calendar,
  Header, FlowHeader, PlainHeader, Navagation, Tabs, Tap,
  Checkbox, Check, Radio, CheckIcon, DayCheck, Choice, Toggle,
  Toast, showToast, Alert, showAlert, Tooltip, Alarm, AlarmFill,
  MemberRow, ReportRow, GradeRow, TextRow, ChatRow, AuthRow, TuitionRow, LiveRow, ReferenceRow, AttendRow, ClassRow, ClassCard, InstituteCard, List,
  StatusBar, Device,
};
