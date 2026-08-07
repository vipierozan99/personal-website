/**
 * Facts about the person that no rendered page shows, and that are the same
 * in every language. Everything the structured data can derive from
 * `cv.md`/`site.md` is derived — what lands here is only what the content
 * genuinely cannot yield: name tokenization, the portrait's pixel size,
 * institution legal names behind the abbreviations `::academia` displays,
 * country names behind demonyms.
 *
 * Not frontmatter: every field is locale-invariant, so frontmatter would
 * duplicate it across locales — and the parity check compares directives,
 * never frontmatter, so that drift would be silent.
 *
 * Import this only from `src/build/*`. It is data, so a client-reachable
 * import would be retained in the app bundle rather than tree-shaken.
 */

export const SITE_URL = "https://victor.pierozan.com";

type Institution = { name: string; url: string };

export type Identity = {
	givenName: string;
	additionalName: string;
	familyName: string;
	address: { locality: string; region: string; country: string };
	image: { path: string; width: number; height: number };
	/** BCP 47, most fluent first. */
	knowsLanguage: readonly string[];
	/** Country names, for `schema.org/nationality`. */
	nationality: readonly string[];
	/** Profiles not on the printed sheet, merged into `sameAs`. */
	sameAs: readonly string[];
	repository: string;
	/** Keyed by the abbreviation `::academia` displays. */
	institutions: Record<string, Institution>;
	/**
	 * Broad topics a recruiter searches for. The concrete stack is derived
	 * from `::skills`; these are the terms no skills row would ever list.
	 */
	topics: readonly string[];
};

export const IDENTITY = {
	givenName: "Victor",
	additionalName: "Elízio",
	familyName: "Pierozan",
	address: { locality: "Berlin", region: "Berlin", country: "DE" },
	image: { path: "/profile.jpeg", width: 544, height: 726 },
	knowsLanguage: ["pt-BR", "en"],
	nationality: ["Brazil", "Italy"],
	sameAs: ["https://gitlab.com/vipierozan99"],
	repository: "https://gitlab.com/vipierozan99",
	institutions: {
		UFSC: {
			name: "Universidade Federal de Santa Catarina",
			url: "https://ufsc.br/",
		},
		RWTH: {
			name: "RWTH Aachen University",
			url: "https://www.rwth-aachen.de/",
		},
	},
	topics: [
		"Software Architecture",
		"Web Development",
		"Backend Development",
		"Frontend Development",
		"Embedded Systems",
		"Medical Device Software",
	],
} as const satisfies Identity;
