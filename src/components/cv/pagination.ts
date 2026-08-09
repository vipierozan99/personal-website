import type { ReactNode } from "react";

/**
 * The paginator's own vocabulary, kept out of AutoPaginate.tsx so that file
 * exports nothing but its component: React Fast Refresh only treats a module as
 * a hot-update boundary when every export is a component, and one plain
 * function alongside costs a full reload on every edit.
 */
export type Block = {
	id: string;
	node: ReactNode;
	/** Section the block sits in, named on the continuation rule of later sheets. */
	section?: string;
	/** Set when the block opens its section, so it needs no continuation label. */
	opensSection?: boolean;
	/** Escape hatch: force this block to start a sheet regardless of the fit. */
	breakBefore?: boolean;
};

/**
 * A sheet that starts part-way through a section says so; one that happens to
 * start on a section's own rule would only repeat it, and gets the bare rule.
 */
export function continuationFor(
	block: Block | undefined,
	continuedLabel: string,
) {
	if (!block?.section || block.opensSection) return {};
	return { label: block.section, suffix: continuedLabel };
}

/**
 * Whether a captured pagination still describes the document in hand: every
 * sheet holding something, and the indices running from nothing to the last
 * block without a gap. A capture taken before the content changed describes
 * some other document — so it is checked rather than trusted, and a stale one
 * simply costs the measurement it was there to save.
 */
export function describes(
	captured: number[][] | undefined,
	count: number,
): captured is number[][] {
	if (!captured?.length) return false;

	let expected = 0;
	for (const sheet of captured) {
		if (sheet.length === 0) return false;
		for (const index of sheet) {
			if (index !== expected) return false;
			expected += 1;
		}
	}
	return expected === count;
}

/**
 * Whether two packings break in the same places. Both are runs of consecutive
 * indices over the same blocks, so how many land on each sheet says it all.
 */
export function samePages(current: number[][] | null, packed: number[][]) {
	return (
		current?.length === packed.length &&
		current.every((sheet, page) => sheet.length === packed[page].length)
	);
}
