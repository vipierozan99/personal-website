import { createRootRoute, Outlet } from "@tanstack/react-router";

export type ExtraLang = "de" | "pt";

const isExtraLang = (value: unknown): value is ExtraLang =>
	value === "de" || value === "pt";

export const Route = createRootRoute({
	// `?lang=en`, junk and absence all normalize to {} — English is the absence
	// of the parameter, so the canonical URL stays clean.
	validateSearch: (search: Record<string, unknown>): { lang?: ExtraLang } =>
		isExtraLang(search.lang) ? { lang: search.lang } : {},
	component: () => <Outlet />,
});
