import { CARDS } from './data';

/**
 * The collection is a string of 0/1 digits, one per card in cards.json order.
 * This is the same format gwentcards.github.io uses after the "#", so old links can be imported.
 */
const KEY = 'gwent-collection:v1';
const BACKUP_KEY = 'gwent-collection:v1:previous';
const PREFS_KEY = 'gwent-collection:prefs';

export type Collection = boolean[];

export function emptyCollection(): Collection {
  return CARDS.map(() => false);
}

export function encode(collection: Collection): string {
  return collection.map((v) => (v ? '1' : '0')).join('');
}

/** Returns null when the text isn't a save code. Accepts a bare code, "#code" or a whole link ending in "#code". */
export function decode(text: string): Collection | null {
  const match = text.trim().match(/#?([01]+)$/);
  if (!match || match[1].length > CARDS.length + 64) {
    return null;
  }
  const code = match[1];
  return CARDS.map((_, i) => code.charAt(i) === '1');
}

export function count(collection: Collection): number {
  return collection.reduce((n, v) => n + (v ? 1 : 0), 0);
}

export function load(): Collection | null {
  try {
    const code = localStorage.getItem(KEY);
    return code ? decode(code) : null;
  } catch {
    return null;
  }
}

export function save(collection: Collection): boolean {
  try {
    const code = encode(collection);
    const previous = localStorage.getItem(KEY);
    if (previous && previous !== code) {
      localStorage.setItem(BACKUP_KEY, previous);
    }
    localStorage.setItem(KEY, code);
    return true;
  } catch {
    return false;
  }
}

/** Ask the browser not to evict our storage under pressure (no prompt in most browsers). */
export async function requestPersistence(): Promise<void> {
  try {
    await navigator.storage?.persist?.();
  } catch {
    // Not supported; localStorage still works
  }
}

export interface Prefs {
  sound: boolean;
  view: 'grid' | 'ledger';
}

const DEFAULT_PREFS: Prefs = { sound: true, view: 'grid' };

export function loadPrefs(): Prefs {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: Prefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Preferences are a convenience only
  }
}

/** Collection code found in the page link, e.g. a link copied from gwentcards.github.io. */
export function codeFromLink(): Collection | null {
  const hash = window.location.hash;
  return /^#[01]{10,}$/.test(hash) ? decode(hash) : null;
}

export function clearLink(): void {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}
