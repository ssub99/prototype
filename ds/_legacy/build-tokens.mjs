#!/usr/bin/env node
/**
 * Build CSS + JS token modules from ds/tokens/*.json (SSOT).
 * Usage: node ds/build-tokens.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = dirname(fileURLToPath(import.meta.url));
const load = (name) => JSON.parse(readFileSync(join(root, "tokens", name), "utf8"));

const foundation = load("foundation.json");
const typography = load("typography.json");
const layout = load("layout.json");
const component = load("component.json");

const weight = (fontStyle) =>
  ({ Bold: 700, Medium: 500, Regular: 400, Light: 300 }[fontStyle] ?? 400);

const cssLines = [];
cssLines.push("/* AUTO-GENERATED from ds/tokens/*.json — do not edit by hand. Run: node ds/build-tokens.mjs */");
cssLines.push(":root {");
cssLines.push(`  ${foundation.fontFamily.sans.css}: ${foundation.fontFamily.sans.value};`);
cssLines.push("");
cssLines.push("  /* Foundation color */");
for (const [key, token] of Object.entries(foundation.color)) {
  const comment = token.paintStyleName ? ` /* ${token.paintStyleName} */` : "";
  cssLines.push(`  ${token.css}: ${token.value};${comment}`);
}
cssLines.push("");
cssLines.push("  /* Semantic color (refs foundation) */");
for (const [key, token] of Object.entries(foundation.semantic)) {
  const refKey = token.ref.replace("color.", "");
  const ref = foundation.color[refKey];
  if (!ref) throw new Error(`Missing semantic ref ${token.ref}`);
  cssLines.push(`  ${token.css}: var(${ref.css}); /* → ${token.ref} */`);
}
cssLines.push("");
cssLines.push("  /* Layout size / space / radius */");
for (const group of ["size", "radius", "space"]) {
  for (const token of Object.values(layout[group])) {
    cssLines.push(`  ${token.css}: ${token.value}${token.unit};`);
  }
}
cssLines.push("");
cssLines.push("  /* Typography primitive vars */");
for (const [name, style] of Object.entries(typography.styles)) {
  const base = style.css;
  cssLines.push(`  ${base}-size: ${style.fontSize}px;`);
  cssLines.push(`  ${base}-line: ${style.lineHeight}px;`);
  cssLines.push(`  ${base}-weight: ${style.fontWeight ?? weight(style.fontStyle)};`);
}
cssLines.push("");
cssLines.push("  /* Component size tokens */");
for (const [size, token] of Object.entries(component.button.heights)) {
  cssLines.push(`  ${token.css}: ${token.value}px;`);
}
cssLines.push(`  --rz-input-height-48: ${component.input.heights["48_large"]}px;`);
cssLines.push(`  --rz-input-height-40: ${component.input.heights["40_regular"]}px;`);
cssLines.push(`  --rz-input-height-32: ${component.input.heights["32_small"]}px;`);
cssLines.push(`  --rz-toast-height: ${component.toast.height}px;`);
cssLines.push(`  --rz-chip-height-regular: ${component.chip.regular.height}px;`);
cssLines.push(`  --rz-chip-height-small: ${component.chip.small.height}px;`);
cssLines.push(`  --rz-chip-height-tiny: ${component.chip.tiny.height}px;`);
cssLines.push(`  --rz-control-check: ${component.control.checkSize}px;`);
cssLines.push(`  --rz-control-toggle-width: ${component.control.toggleWidth}px;`);
cssLines.push(`  --rz-control-toggle-height: ${component.control.toggleHeight}px;`);
cssLines.push(`  --rz-alarm-icon: ${component.alarm.icon}px;`);
cssLines.push(`  --rz-alarm-copy-width: ${component.alarm.copyWidth}px;`);
cssLines.push("}");
cssLines.push("");

/* Utility type classes */
cssLines.push("/* Typography utilities — apply text styles by token name */");
cssLines.push(".rz-font { font-family: var(--rz-font-sans); color: var(--rz-color-ink); }");
for (const [name, style] of Object.entries(typography.styles)) {
  const cls = `rz-type-${name.replace(".", "-")}`;
  const base = style.css;
  cssLines.push(
    `.${cls} { font-family: var(--rz-font-sans); font-size: var(${base}-size); line-height: var(${base}-line); font-weight: var(${base}-weight); letter-spacing: 0; }`,
  );
}
cssLines.push("");
cssLines.push("/* Role aliases */");
for (const [role, styleName] of Object.entries(typography.roles)) {
  cssLines.push(`.rz-role-${role} { composes: none; } /* use .rz-type-${styleName.replace(".", "-")} */`);
}

/* Fix role aliases properly */
const roleBlock = Object.entries(typography.roles)
  .map(([role, styleName]) => {
    const cls = `rz-type-${styleName.replace(".", "-")}`;
    return `.rz-role-${role} { font-family: var(--rz-font-sans); font-size: var(--rz-type-${styleName.replace(".", "-")}-size); line-height: var(--rz-type-${styleName.replace(".", "-")}-line); font-weight: var(--rz-type-${styleName.replace(".", "-")}-weight); letter-spacing: 0; }`;
  })
  .join("\n");

// Remove broken role lines and append good ones
const cssWithoutBrokenRoles = cssLines.filter((l) => !l.includes("composes: none")).join("\n");
const css = `${cssWithoutBrokenRoles}\n${roleBlock}\n`;

writeFileSync(join(root, "tokens.css"), css);

const js = `/* AUTO-GENERATED from ds/tokens/*.json — do not edit by hand. Run: node ds/build-tokens.mjs */
export const foundation = ${JSON.stringify(foundation, null, 2)};
export const typography = ${JSON.stringify(typography, null, 2)};
export const layout = ${JSON.stringify(layout, null, 2)};
export const component = ${JSON.stringify(component, null, 2)};

export function color(path) {
  if (foundation.color[path]) return foundation.color[path].value;
  const semantic = foundation.semantic[path];
  if (semantic) {
    const key = semantic.ref.replace("color.", "");
    return foundation.color[key]?.value;
  }
  return undefined;
}

export function typeStyle(name) {
  return typography.styles[name] || typography.styles[typography.roles[name]];
}

export function typeClass(name) {
  const style = typeStyle(name);
  if (!style) return "";
  const key = Object.entries(typography.styles).find(([, v]) => v === style)?.[0] || name;
  return \`rz-type-\${key.replace(".", "-")}\`;
}

export const tokens = { foundation, typography, layout, component, color, typeStyle, typeClass };
export default tokens;
`;

writeFileSync(join(root, "tokens.js"), js);
console.log("built ds/tokens.css + ds/tokens.js");
console.log(
  `  colors ${Object.keys(foundation.color).length} · semantic ${Object.keys(foundation.semantic).length} · type ${Object.keys(typography.styles).length}`,
);
