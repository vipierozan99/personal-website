import { describe, expect, it } from "vitest";
// Lives here rather than next to the route: a *.test.ts inside src/routes
// would be picked up by the router plugin's file-based route scan.
import { Route } from "../../src/routes/__root";

const validate = Route.options.validateSearch as (
	search: Record<string, unknown>,
) => { lang?: string };

describe("?lang validation", () => {
	it("keeps the extra languages", () => {
		expect(validate({ lang: "de" })).toEqual({ lang: "de" });
		expect(validate({ lang: "pt" })).toEqual({ lang: "pt" });
	});

	it("normalizes English and junk to absence", () => {
		expect(validate({ lang: "en" })).toEqual({});
		expect(validate({ lang: "fr" })).toEqual({});
		expect(validate({ lang: 5 })).toEqual({});
		expect(validate({})).toEqual({});
	});
});
