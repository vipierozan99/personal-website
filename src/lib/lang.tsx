import type { i18n as I18n } from "i18next";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_LOCALE, siteContent } from "../content/load";
import type { SiteContent } from "../content/model";
import { syncLanguage, translator } from "../i18n";
import { type Language, LanguageContext } from "./lang-context";
import { crossfade } from "./transitions";

/**
 * The language the URL asks for, applied after hydration.
 *
 * The URL is the single source of truth: the switcher only navigates (see
 * LangSwitch), and this effect performs the swap — so back/forward, a shared
 * `?lang=de` link and a click all take the same path. The prerendered page is
 * always English, and the provider seeds English no matter what the URL says;
 * hydration therefore never sees translated markup, and a `?lang=de` visitor
 * cross-fades to German the moment the chunk lands.
 *
 * Chunks can land out of order, so only the language still selected may win
 * (`wanted`). `<html lang>` moves with the prose rather than with the click:
 * until the new content lands, the text on screen is still the previous
 * language, and announcing otherwise would have a screen reader read it with
 * the wrong pronunciation.
 */
export function LanguageProvider({
	i18n,
	urlLang,
	children,
}: {
	i18n: I18n;
	urlLang: string | undefined;
	children: ReactNode;
}) {
	const [lang, setLang] = useState(DEFAULT_LOCALE);
	const [content, setContent] = useState(
		() => siteContent.cached(DEFAULT_LOCALE) as SiteContent,
	);
	const [pending, setPending] = useState(false);
	const wanted = useRef(DEFAULT_LOCALE);

	if (!content) {
		throw new Error(
			"LanguageProvider mounted before siteContent.load(DEFAULT_LOCALE) settled",
		);
	}

	const t = useMemo(() => translator(i18n, lang), [i18n, lang]);
	useEffect(() => syncLanguage(i18n, lang), [i18n, lang]);

	useEffect(() => {
		const next = urlLang ?? DEFAULT_LOCALE;
		if (next === wanted.current) return;
		wanted.current = next;

		const swap = (loaded: SiteContent) =>
			crossfade(() => {
				document.documentElement.lang = next;
				setLang(next);
				setContent(loaded);
				setPending(false);
			});

		// Warmed — usually by the prefetch on hover — so chrome and prose change
		// in the same commit, the one case there is a coherent before and after
		// to cross-fade between. Otherwise the strings lead and the prose follows
		// when its chunk lands.
		const cached = siteContent.cached(next);
		if (cached) {
			swap(cached);
			return;
		}

		setLang(next);
		setPending(true);
		siteContent
			.load(next)
			.then((loaded) => {
				if (wanted.current === next) swap(loaded);
			})
			.catch(() => {
				if (wanted.current === next) setPending(false);
			});
	}, [urlLang]);

	const value = useMemo<Language>(
		() => ({ lang, content, t, pending, prefetch: siteContent.prefetch }),
		[lang, content, t, pending],
	);

	return (
		<LanguageContext.Provider value={value}>
			{children}
		</LanguageContext.Provider>
	);
}
