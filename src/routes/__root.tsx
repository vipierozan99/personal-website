import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { i18n as I18n } from "i18next";
import { LanguageProvider } from "../lib/lang";

export type ExtraLang = "de" | "pt";

const isExtraLang = (value: unknown): value is ExtraLang =>
	value === "de" || value === "pt";

export const Route = createRootRouteWithContext<{ i18n: I18n }>()({
	// `?lang=en`, junk and absence all normalize to {} — English is the absence
	// of the parameter, so the canonical URL stays clean.
	validateSearch: (search: Record<string, unknown>): { lang?: ExtraLang } =>
		isExtraLang(search.lang) ? { lang: search.lang } : {},
	component: Root,
});

function Root() {
	const { i18n } = Route.useRouteContext();
	const { lang } = Route.useSearch();
	return (
		<LanguageProvider i18n={i18n} urlLang={lang}>
			<Outlet />
		</LanguageProvider>
	);
}
