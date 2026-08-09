import { MarkdownDocument } from "@comark/react";
import type { Fragment } from "../../content/model";
import {
	Academia,
	DocumentLink,
	Entry,
	Heading,
	Role,
	Skills,
	Summary,
} from "./Blocks";

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
 *
 * Its own module because blocks-builder.tsx exports `buildBlocks`, and a
 * component declared beside a non-component export costs that file its React
 * Fast Refresh boundary.
 */
export function Doc({ value }: { value: Fragment }) {
	return (
		<MarkdownDocument
			value={value}
			components={components}
			className="contents"
		/>
	);
}
