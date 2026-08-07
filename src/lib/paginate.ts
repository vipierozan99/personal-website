export type PackableBlock = { height: number; breakBefore?: boolean };

/**
 * Greedily assigns measured blocks to pages. `breakBefore` forces a block to
 * open a new page even when it would still fit on the current one; on the
 * first block it is ignored, since there is no preceding page to break from.
 *
 * A block taller than a full page is placed alone and allowed to overflow:
 * splitting it would defeat the point of treating a block as atomic, and
 * there is no better placement.
 */
export function packBlocks(
	blocks: readonly PackableBlock[],
	capacity: number,
	firstCapacity: number = capacity,
): number[][] {
	const pages: number[][] = [[]];
	let used = 0;
	let cap = firstCapacity;

	for (const [index, { height, breakBefore }] of blocks.entries()) {
		const current = pages[pages.length - 1];
		const started = current.length > 0;
		if (started && (breakBefore || used + height > cap)) {
			pages.push([index]);
			used = height;
			cap = capacity;
		} else {
			current.push(index);
			used += height;
		}
	}

	return pages;
}
