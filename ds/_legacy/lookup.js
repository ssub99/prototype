/**
 * Rallyz DS lookup — maps code props to Figma component masters.
 * Source: Fluid catalogs/rallyz (446 separate-component-per-state masters).
 */

let registryPromise;

export async function loadRegistry(url = new URL('./registry.json', import.meta.url)) {
  if (!registryPromise) {
    registryPromise = fetch(url).then((r) => r.json());
  }
  return registryPromise;
}

function matches(item, query) {
  return Object.entries(query).every(([key, value]) => {
    if (value === undefined || value === null) return true;
    return item[key] === value;
  });
}

/**
 * @param {string} family registry family key (button, chip, navagation, …)
 * @param {Record<string, string|number>} query
 */
export async function findComponent(family, query = {}) {
  const registry = await loadRegistry();
  const list = registry.families[family] || [];
  return list.find((item) => matches(item, query)) || null;
}

export async function listFamily(family) {
  const registry = await loadRegistry();
  return registry.families[family] || [];
}

export async function getPrimitive(name) {
  const registry = await loadRegistry();
  return registry.primitives?.[name] || null;
}
