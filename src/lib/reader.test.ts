// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import { READER, resetReader, setReaderPref } from "./reader";

beforeEach(() => {
	resetReader();
	localStorage.clear();
});

describe("reader prefs", () => {
	it("stores non-defaults as attributes, and as numbers in storage", () => {
		setReaderPref("size", 16);
		setReaderPref("face", "mono");
		const dataset = document.documentElement.dataset;
		expect(dataset.size).toBe("16");
		expect(dataset.face).toBe("mono");
		// The index.html inline script compares numbers with ===.
		expect(JSON.parse(localStorage.reader)).toEqual({ size: 16, face: "mono" });
	});

	it("selecting the default removes the attribute and empties storage", () => {
		setReaderPref("measure", 58);
		setReaderPref("measure", READER.measure.fallback);
		expect(document.documentElement.dataset.measure).toBeUndefined();
		expect(localStorage.reader).toBeUndefined();
	});

	it("reset clears every attribute at once", () => {
		setReaderPref("size", 21);
		setReaderPref("face", "sans");
		setReaderPref("measure", 80);
		resetReader();
		const dataset = document.documentElement.dataset;
		expect([dataset.size, dataset.face, dataset.measure]).toEqual([
			undefined,
			undefined,
			undefined,
		]);
		expect(localStorage.reader).toBeUndefined();
	});
});
