import { describe, expect, it } from "vitest";
import { packBlocks } from "../../src/lib/paginate";

const heights = (...values: number[]) => values.map((height) => ({ height }));

describe("packBlocks", () => {
	it("fills pages greedily against the capacity", () => {
		expect(packBlocks(heights(40, 40, 40, 40, 40), 100)).toEqual([
			[0, 1],
			[2, 3],
			[4],
		]);
	});

	it("gives the first page its own capacity", () => {
		// First page fits one block (header space), later pages fit two.
		expect(packBlocks(heights(40, 40, 40, 40, 40), 100, 50)).toEqual([
			[0],
			[1, 2],
			[3, 4],
		]);
	});

	it("honors breakBefore except on the first block", () => {
		const blocks = [
			{ height: 10, breakBefore: true },
			{ height: 10 },
			{ height: 10, breakBefore: true },
		];
		expect(packBlocks(blocks, 100)).toEqual([[0, 1], [2]]);
	});

	it("places an oversized block alone and lets it overflow", () => {
		expect(packBlocks(heights(10, 500, 10), 100)).toEqual([[0], [1], [2]]);
	});

	it("keeps a block that exactly fills the capacity", () => {
		// The `>` in the break test: at equality the block still belongs here.
		expect(packBlocks(heights(60, 40, 10), 100)).toEqual([[0, 1], [2]]);
	});

	it("returns a single empty page for no blocks", () => {
		// AutoPaginate indexes pages[0] unconditionally, so this may not be [].
		expect(packBlocks([], 100)).toEqual([[]]);
	});

	it("places the first block even when the first page has no room", () => {
		// firstCapacity goes non-positive when the header outgrows the flow.
		expect(packBlocks(heights(10, 10), 100, 0)).toEqual([[0], [1]]);
	});

	it("accumulates fractional heights without drifting past the capacity", () => {
		// Measured heights are getBoundingClientRect deltas; the capacity is an
		// integer clientHeight. Three of these sum to exactly 100.
		expect(packBlocks(heights(33.3, 33.3, 33.4, 1), 100)).toEqual([
			[0, 1, 2],
			[3],
		]);
	});
});
