import { useT } from "../../lib/lang-context";

/**
 * The note below the last sheet. It is about the site rather than the person,
 * so it belongs after the document and not in the chrome on top of it — and,
 * like the chrome, it is never printed. Sits on the desk, so it themes with
 * the site.
 */
export function Colophon() {
	const t = useT();

	return (
		<footer className="flex flex-col items-center pb-[1em] text-center font-mono text-[13px] text-mut leading-[1.6] print:hidden">
			<p className="max-w-[40em] text-pretty">{t("cv.colophon")}</p>
			<nav className="flex flex-wrap items-center justify-center gap-[1.5em] py-[0.75em]">
				<a
					href="https://github.com/vipierozan99"
					target="_blank"
					rel="noopener noreferrer"
				>
					{t("cv.source")}
				</a>
			</nav>
		</footer>
	);
}
