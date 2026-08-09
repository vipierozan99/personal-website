import type { TFunction } from "i18next";
import { createContext, useContext } from "react";
import type { SiteContent } from "../content/model";

/**
 * The context and its readers, split from the provider so that lang.tsx exports
 * a component and nothing else — the condition React Fast Refresh needs to hot
 * update a module instead of reloading the page.
 */
export type Language = {
	/** The selected language. UI strings follow it immediately. */
	lang: string;
	/** The content on screen — trails the selection while a chunk loads. */
	content: SiteContent;
	t: TFunction;
	pending: boolean;
	prefetch: (locale: string) => void;
};

export const LanguageContext = createContext<Language | null>(null);

export function useLanguage(): Language {
	const context = useContext(LanguageContext);
	if (!context) throw new Error("useLanguage outside LanguageProvider");
	return context;
}

export const useT = (): TFunction => useLanguage().t;
