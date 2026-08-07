import { MarkdownDocument } from "@comark/react";
import {
	attrsOf,
	type CvDocument,
	dissect,
	fragment,
} from "../../content/cv-model";
import type { Fragment } from "../../content/model";
import type { Block } from "./AutoPaginate";
import {
	Academia,
	Closing,
	DocumentLink,
	Entry,
	Heading,
	Role,
	Skills,
	Summary,
} from "./Blocks";
import { SectionRule } from "./Sheet";

/**
 * What each tag in the document renders as. The keys are Comark component
 * names for the first five and plain HTML tags for the last two — the
 * renderer resolves both through the same map.
 */
const components = {
	summary: Summary,
	role: Role,
	academia: Academia,
	entry: Entry,
	skills: Skills,
	h3: Heading,
	a: DocumentLink,
};

/**
 * Renders one slice of the document. `display: contents` removes the
 * renderer's own wrapper from the layout, so the paginator still measures the
 * same boxes — and margins still collapse between the same elements — as if
 * these components were called directly.
 */
function Doc({ value }: { value: Fragment }) {
	return (
		<MarkdownDocument
			value={value}
			components={components}
			className="contents"
		/>
	);
}

/**
 * One top-level AST node is one block: the parser emits a flat list of
 * siblings, which is already the granularity the paginator needs. A section's
 * opening rule belongs to that section's first block rather than standing
 * alone, which is what stops a heading being stranded at the foot of a sheet.
 */
export function buildBlocks(cv: CvDocument): Block[] {
	const { preamble, sections } = dissect(cv);
	const blocks: Block[] = [];

	if (preamble.length > 0) {
		blocks.push({ id: "summary", node: <Doc value={fragment(preamble)} /> });
	}

	sections
		.filter((section) => !section.closing)
		.forEach((section, order) => {
			for (const [index, node] of section.nodes.entries()) {
				const attrs = attrsOf<{ id?: string; break?: boolean }>(node, cv);
				blocks.push({
					id: attrs.id ?? `${section.id}-${index}`,
					section: section.label,
					opensSection: index === 0,
					breakBefore: attrs.break,
					node: (
						<>
							{index === 0 && (
								<SectionRule
									label={section.label}
									// The first section follows the summary and needs the wider
									// gap; later ones follow a row that already carries padding.
									className={order === 0 ? "mt-7 mb-1" : "mt-5"}
								/>
							)}
							<Doc value={fragment([node])} />
						</>
					),
				});
			}
		});

	// Everything marked `{.closing}` is one block, so the paginator cannot
	// break the two-column layout across a sheet.
	const closing = sections.filter((section) => section.closing);
	if (closing.length > 0) {
		blocks.push({
			id: "closing",
			node: (
				<Closing
					sections={closing.map((section) => ({
						id: section.id,
						label: section.label,
						body: <Doc value={fragment(section.nodes)} />,
					}))}
				/>
			),
		});
	}

	return blocks;
}
