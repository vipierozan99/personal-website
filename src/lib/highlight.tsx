import { type ReactNode, useMemo, useState } from "react";
import {
	type Highlight,
	HighlightContext,
	type Hover,
} from "./highlight-context";
import { useLanguage } from "./lang-context";

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
