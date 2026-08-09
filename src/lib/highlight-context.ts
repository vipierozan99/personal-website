import { createContext, useContext } from "react";

/**
 * The context and its reader, split from the provider so that highlight.tsx
 * exports a component and nothing else — the condition React Fast Refresh
 * needs to hot-update a module instead of reloading the page.
 */
export type Hover =
	| { kind: "topic"; id: string }
	| { kind: "project"; id: string }
	| null;

export type Highlight = {
	hover: Hover;
	setHover: (hover: Hover) => void;
	/** False dims the element; everything is lit when nothing is hovered. */
	topicLit: (id: string) => boolean;
	projectLit: (id: string) => boolean;
};

export const HighlightContext = createContext<Highlight | null>(null);

export function useHighlight(): Highlight {
	const context = useContext(HighlightContext);
	if (!context) throw new Error("useHighlight outside HighlightProvider");
	return context;
}
