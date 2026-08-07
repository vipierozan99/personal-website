/**
 * Reader preferences — measure, size, face — live as data attributes on
 * `<html>` plus one localStorage key, exactly like the theme: the inline
 * script in index.html restores them before first paint, CSS applies them
 * (`--reader-*` variables and the active-pill styling in index.css), and
 * React renders no pref-dependent markup. Defaults carry no attribute at all,
 * so a fresh visitor's DOM is untouched.
 */

export const READER = {
	measure: { fallback: 68, options: [58, 68, 80] },
	size: { fallback: 18, options: [16, 18, 21] },
	face: { fallback: "serif", options: ["serif", "sans", "mono"] },
} as const;

export type ReaderKey = keyof typeof READER;
export type ReaderValue<K extends ReaderKey> =
	(typeof READER)[K]["options"][number];

export function readerValue<K extends ReaderKey>(key: K): ReaderValue<K> {
	const raw = document.documentElement.dataset[key];
	const found = READER[key].options.find((option) => String(option) === raw);
	return (found ?? READER[key].fallback) as ReaderValue<K>;
}

export function setReaderPref<K extends ReaderKey>(
	key: K,
	value: ReaderValue<K>,
): void {
	const dataset = document.documentElement.dataset;
	if (value === READER[key].fallback) {
		delete dataset[key];
	} else {
		dataset[key] = String(value);
	}
	persist();
}

export function resetReader(): void {
	const dataset = document.documentElement.dataset;
	for (const key of Object.keys(READER)) delete dataset[key];
	persist();
}

/** Mirrors the attributes into the shape the index.html script restores. */
function persist(): void {
	const stored: Record<string, unknown> = {};
	for (const key of Object.keys(READER) as ReaderKey[]) {
		const raw = document.documentElement.dataset[key];
		if (raw === undefined) continue;
		// The inline script compares numbers with ===, so numeric prefs must be
		// stored as numbers, not the attribute strings.
		stored[key] = key === "face" ? raw : Number(raw);
	}
	try {
		if (Object.keys(stored).length === 0) {
			localStorage.removeItem("reader");
		} else {
			localStorage.reader = JSON.stringify(stored);
		}
	} catch {
		// Private mode without storage: prefs still apply for the session.
	}
}
