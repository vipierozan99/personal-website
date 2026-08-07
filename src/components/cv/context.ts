import type { TFunction } from "i18next";
import { createContext, use } from "react";

/**
 * What a rendered CV component needs but neither the markdown nor its own
 * props can supply. Components inside the sheet are instantiated by the
 * Comark renderer from AST attributes alone, so there is nowhere to pass
 * these in: the clock a live role's duration is measured against, and the
 * UI strings, which are not content and so do not live in the document.
 */
export type CvRenderContext = {
	t: TFunction;
	now: Date;
};

export const CvContext = createContext<CvRenderContext | null>(null);

export function useCvContext(): CvRenderContext {
	const context = use(CvContext);
	if (!context) {
		throw new Error(
			"CV components must be rendered inside a CvContext provider",
		);
	}
	return context;
}
