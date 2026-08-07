import { useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { DEFAULT_LOCALE, LOCALES } from "../content/load";
import { useLanguage, useT } from "../lib/lang";
import type { ExtraLang } from "../routes/__root";

/**
 * The pills only navigate; the actual swap lives in LanguageProvider's URL
 * effect, so a click, back/forward and a shared `?lang=` link all take the
 * same path. Hover and focus warm the chunk so the switch lands in one
 * commit inside a view transition.
 */
export function LangSwitch() {
	const t = useT();
	const { lang, prefetch } = useLanguage();
	const navigate = useNavigate();

	if (LOCALES.length < 2) return null;

	return (
		// A labelled set of related controls is what a fieldset is for; the
		// legend is only ever heard.
		<fieldset className="flex gap-1">
			<legend className="sr-only">{t("header.language")}</legend>
			{LOCALES.map((code) => {
				const current = code === lang;
				return (
					<button
						key={code}
						type="button"
						aria-current={current || undefined}
						onClick={() =>
							navigate({
								to: ".",
								search: (previous) => ({
									...previous,
									lang:
										code === DEFAULT_LOCALE ? undefined : (code as ExtraLang),
								}),
								replace: true,
							})
						}
						onPointerEnter={() => prefetch(code)}
						onFocus={() => prefetch(code)}
						onTouchStart={() => prefetch(code)}
						className={clsx(
							"cursor-pointer rounded-full border px-[9px] py-[5px] font-mono text-[10.5px] tracking-[0.08em] transition-colors duration-150",
							current
								? "border-accent bg-accent text-on-accent"
								: "border-accent-line bg-transparent text-accent hover:border-accent",
						)}
					>
						{code.toUpperCase()}
					</button>
				);
			})}
		</fieldset>
	);
}
