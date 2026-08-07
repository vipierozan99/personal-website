import { describe, expect, it } from "vitest";
import { packBlocks } from "./paginate";

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
});
