import { describe, expect, it } from "vitest";
import { byYear } from "../../src/lib/sort";

describe("byYear", () => {
	const projects = [
		{ id: "a", year: 2024 },
		{ id: "b", year: 2026 },
		{ id: "c", year: 2024 },
		{ id: "d", year: 2022 },
	];

	it("sorts newest first", () => {
		expect([...projects].sort(byYear(true)).map((p) => p.id)).toEqual([
			"b",
			"a",
			"c",
			"d",
		]);
	});

	it("sorts oldest first, keeping ties stable", () => {
		expect([...projects].sort(byYear(false)).map((p) => p.id)).toEqual([
			"d",
			"a",
			"c",
			"b",
		]);
	});
});
