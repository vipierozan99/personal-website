import type { ElementNode } from "comark";
import { attrsOf, type CvDocument, dissect } from "../content/cv-model";
import type {
	AcademiaAttrs,
	CvFrontmatter,
	RoleAttrs,
	SkillsAttrs,
} from "../content/cv-schema";
import { children, isTag, plainText } from "./inline";

/**
 * The CV reduced to plain data, for the consumers that want facts rather than
 * prose: the structured data and the `llms.txt` index.
 */
export type CvModel = {
	locale: string;
	person: CvFrontmatter["person"];
	/** The `::summary` paragraph, as one line. */
	summary: string;
	/** Newest first, in document order. */
	roles: {
		id: string;
		title: string;
		org: string;
		from: string;
		to?: string;
	}[];
	/** The abbreviations `::academia` displays, e.g. `["UFSC", "RWTH"]`. */
	institutions: string[];
	skills: { key: string; value: string; keywords: string[] }[];
};

/** How `::skills` values and `#stack` slots separate their entries. */
const SEPARATOR = " · ";

export function cvModel(cv: CvDocument): CvModel {
	const { preamble, sections } = dissect(cv);
	// Section grouping is irrelevant here — every block is wanted, in the
	// order it was authored, so a role's position still means "how recent".
	const nodes = [...preamble, ...sections.flatMap((section) => section.nodes)];

	const summary = nodes.find(isTag("summary"));
	const academia = nodes.find(isTag("academia"));
	const skills = nodes.find(isTag("skills"));

	if (!summary || !academia || !skills) {
		throw new Error(
			`${cv.frontmatter.locale}/cv.md is missing a ::summary, ::academia or ::skills block — the structured data is derived from all three`,
		);
	}

	return {
		locale: cv.frontmatter.locale,
		person: cv.frontmatter.person,
		summary: plainText(summary),
		roles: nodes.filter(isTag("role")).map((node) => {
			const { id, org, from, to } = attrsOf<RoleAttrs>(node, cv);
			return { id, org, from, to, title: title(node, org) };
		}),
		institutions: attrsOf<AcademiaAttrs>(academia, cv)
			.org.split("/")
			.map((name) => name.trim())
			.filter(Boolean),
		skills: attrsOf<SkillsAttrs>(skills, cv).items.map((item) => ({
			...item,
			keywords: item.value
				.split(SEPARATOR)
				.map((keyword) => keyword.trim())
				.filter(Boolean),
		})),
	};
}

/**
 * A block's own heading. Roles state their title as an `h3` inside
 * themselves rather than as an attribute, so it comes out of the tree.
 */
const title = (node: ElementNode, fallback: string): string => {
	const heading = children(node).find(isTag("h3"));
	return heading ? plainText(heading) : fallback;
};
