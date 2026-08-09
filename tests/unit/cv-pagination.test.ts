import { describe, expect, it } from "vitest";
import {
	continuationFor,
	describes,
	samePages,
} from "../../src/components/cv/pagination";

/**
 * These three decide whether the committed capture in pagination.generated.ts
 * is trusted for the first paint. A capture that survives `describes` but no
 * longer matches the content ships in the prerendered HTML and the PDFs, so
 * the rejection cases matter more than the acceptance one.
 */
describe("describes", () => {
	it("accepts a capture covering every block in order", () => {
		expect(describes([[0, 1], [2]], 3)).toBe(true);
	});

	it("rejects a capture that is missing the tail", () => {
		expect(describes([[0, 1]], 3)).toBe(false);
	});

	it("rejects a capture claiming more blocks than exist", () => {
		expect(
			describes(
				[
					[0, 1],
					[2, 3],
				],
				3,
			),
		).toBe(false);
	});

	it("rejects a gap in the indices", () => {
		expect(describes([[0, 1], [3]], 3)).toBe(false);
	});

	it("rejects an empty sheet", () => {
		expect(describes([[0], [], [1]], 2)).toBe(false);
	});

	it("rejects a missing or empty capture", () => {
		expect(describes(undefined, 0)).toBe(false);
		expect(describes([], 0)).toBe(false);
	});
});

describe("samePages", () => {
	/**
	 * Comparing run lengths is sufficient, not a shortcut: both sides are runs
	 * of consecutive indices over the same blocks, so the lengths determine the
	 * partition. This pins that premise — if either side ever stops being
	 * consecutive, these stop being equivalent.
	 */
	it("treats equal run lengths as the same breaks", () => {
		expect(samePages([[0, 1], [2]], [[0, 1], [2]])).toBe(true);
	});

	it("detects a block moving across a break", () => {
		expect(samePages([[0, 1], [2]], [[0], [1, 2]])).toBe(false);
	});

	it("detects a change in sheet count", () => {
		expect(samePages([[0, 1, 2]], [[0, 1], [2]])).toBe(false);
	});

	it("treats no current packing as different", () => {
		expect(samePages(null, [[0]])).toBe(false);
	});
});

describe("continuationFor", () => {
	const block = (
		over: Partial<{ section: string; opensSection: boolean }>,
	) => ({
		id: "b",
		node: null,
		...over,
	});

	it("labels a sheet that starts mid-section", () => {
		expect(continuationFor(block({ section: "Roles" }), "cont.")).toEqual({
			label: "Roles",
			suffix: "cont.",
		});
	});

	it("leaves a sheet that opens its own section bare", () => {
		expect(
			continuationFor(block({ section: "Roles", opensSection: true }), "cont."),
		).toEqual({});
	});

	it("leaves a sectionless or missing block bare", () => {
		expect(continuationFor(block({}), "cont.")).toEqual({});
		expect(continuationFor(undefined, "cont.")).toEqual({});
	});
});
