import { Link } from "@tanstack/react-router";
import { useLanguage } from "../../lib/lang";
import { useCopy } from "../../lib/useCopy";

const rowLink = "font-mono text-[11.5px]";

export function Elsewhere() {
	const { content, t } = useLanguage();
	const { person } = content.frontmatter;
	const { copied, copy } = useCopy(person.email);

	return (
		<section
			id="elsewhere"
			className="flex flex-wrap items-baseline gap-x-10 gap-y-[18px] border-t border-accent-line pt-[22px]"
		>
			<span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
				{t("elsewhere.title")}
			</span>
			<button
				type="button"
				onClick={copy}
				title={t("contact.copy")}
				className="cursor-pointer font-mono text-[11.5px] text-ink-3 transition-colors duration-150 hover:text-accent"
			>
				{copied ? t("contact.copied") : `⧉ ${person.email}`}
			</button>
			<a href={person.gitlab.href} className={rowLink}>
				{person.gitlab.label} ↗
			</a>
			<a href={person.paper} className={rowLink}>
				{t("elsewhere.paper")}
			</a>
			<Link to="/cv" className={rowLink}>
				{t("elsewhere.cvLink")}
			</Link>
			<div className="flex-1" />
			<span className="font-mono text-[10px] leading-[1.7] text-faint">
				{t("elsewhere.colophon")}
			</span>
		</section>
	);
}
