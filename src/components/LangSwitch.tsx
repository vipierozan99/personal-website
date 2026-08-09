import { useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { useEffect, useId, useRef, useState } from "react";
import { DEFAULT_LOCALE, siteContent } from "../content/load";
import { useLanguage, useT } from "../lib/lang-context";
import type { ExtraLang } from "../routes/__root";

/**
 * The menu only navigates; the actual swap lives in LanguageProvider's URL
 * effect, so a click, back/forward and a shared `?lang=` link all take the
 * same path. Hover and focus warm the chunk so the switch lands in one
 * commit inside a view transition.
 *
 * A popover rather than a <select>: the open native picker is OS chrome and
 * only Chrome lets CSS near it, so the list would be a different object in
 * every browser.
 */
export function LangSwitch() {
	const t = useT();
	const { lang, prefetch } = useLanguage();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const trigger = useRef<HTMLButtonElement>(null);
	const root = useRef<HTMLDivElement>(null);
	const menuId = useId();

	// Escape and a click anywhere else close the menu; Escape returns focus to
	// the trigger, a click elsewhere leaves it wherever the click put it.
	useEffect(() => {
		if (!open) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			setOpen(false);
			trigger.current?.focus();
		};
		const onPointerDown = (event: PointerEvent) => {
			if (!root.current?.contains(event.target as Node)) setOpen(false);
		};

		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("pointerdown", onPointerDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("pointerdown", onPointerDown);
		};
	}, [open]);

	if (siteContent.LOCALES.length < 2) return null;

	const select = (code: string) => {
		setOpen(false);
		trigger.current?.focus();
		navigate({
			to: ".",
			search: (previous) => ({
				...previous,
				lang: code === DEFAULT_LOCALE ? undefined : (code as ExtraLang),
			}),
			replace: true,
			// The swap is LanguageProvider's, inside its own cross-fade once the
			// chunk is cached; a router transition around the URL change would
			// only pre-empt it.
			viewTransition: false,
		});
	};

	const pill =
		"cursor-pointer rounded-full border px-2 py-1 font-mono text-tag tracking-tag transition-colors duration-150";

	return (
		<div ref={root} className="relative">
			<button
				ref={trigger}
				type="button"
				aria-expanded={open}
				aria-controls={open ? menuId : undefined}
				aria-label={t("header.language")}
				onClick={() => setOpen((was) => !was)}
				// Warms every language the menu can offer, so the first pick is
				// already cached whichever one it is.
				onPointerEnter={() => {
					for (const code of siteContent.LOCALES) prefetch(code);
				}}
				onFocus={() => {
					for (const code of siteContent.LOCALES) prefetch(code);
				}}
				className={clsx(
					pill,
					"flex items-center gap-1 border-accent-line bg-transparent text-accent hover:border-accent",
				)}
			>
				{lang.toUpperCase()}
				<span aria-hidden="true" className="text-[0.7rem] leading-none">
					▾
				</span>
			</button>

			{/* A disclosure of buttons rather than a listbox: buttons are already
			    focusable and already announced, and the roles a listbox wants
			    would promise a keyboard model this does not implement. */}
			{open ? (
				<div
					id={menuId}
					className="absolute top-full right-0 z-20 mt-1 flex flex-col gap-1 rounded-card border border-accent-line bg-paper-2 p-1"
				>
					{siteContent.LOCALES.map((code) => {
						const current = code === lang;
						return (
							<button
								key={code}
								type="button"
								lang={code}
								aria-current={current || undefined}
								onClick={() => select(code)}
								onPointerEnter={() => prefetch(code)}
								onFocus={() => prefetch(code)}
								className={clsx(
									pill,
									current
										? "border-accent bg-accent text-on-accent"
										: "border-transparent bg-transparent text-accent hover:border-accent",
								)}
							>
								{code.toUpperCase()}
							</button>
						);
					})}
				</div>
			) : null}
		</div>
	);
}
