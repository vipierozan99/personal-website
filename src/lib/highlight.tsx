import {
	createContext,
	type ReactNode,
	useContext,
	useMemo,
	useState,
} from "react";
import { useLanguage } from "./lang";

export type Hover =
	| { kind: "topic"; id: string }
	| { kind: "project"; id: string }
	| null;

type Highlight = {
	hover: Hover;
	setHover: (hover: Hover) => void;
	/** False dims the element; everything is lit when nothing is hovered. */
	topicLit: (id: string) => boolean;
	projectLit: (id: string) => boolean;
};

const HighlightContext = createContext<Highlight | null>(null);

export function useHighlight(): Highlight {
	const context = useContext(HighlightContext);
	if (!context) throw new Error("useHighlight outside HighlightProvider");
	return context;
}

/**
 * The topic↔project cross-light: hovering one side dims the unrelated entries
 * on the other, from the topics' `projects` attributes and their inversion.
 */
export function HighlightProvider({ children }: { children: ReactNode }) {
	const { content } = useLanguage();
	const [hover, setHover] = useState<Hover>(null);

	const value = useMemo<Highlight>(() => {
		const projectsOf = new Map<string, ReadonlySet<string>>(
			content.topics.map((topic) => [topic.id, new Set(topic.projects)]),
		);
		return {
			hover,
			setHover,
			topicLit: (id) => {
				if (!hover) return true;
				if (hover.kind === "topic") return hover.id === id;
				return projectsOf.get(id)?.has(hover.id) ?? false;
			},
			projectLit: (id) => {
				if (!hover) return true;
				if (hover.kind === "project") return hover.id === id;
				return projectsOf.get(hover.id)?.has(id) ?? false;
			},
		};
	}, [hover, content]);

	return (
		<HighlightContext.Provider value={value}>
			{children}
		</HighlightContext.Provider>
	);
}
