import { Link } from "@tanstack/react-router";
import { useLanguage } from "../lib/lang";
import { LangSwitch } from "./LangSwitch";
import { ThemeToggle } from "./ThemeToggle";

const navLink =
	"font-mono text-[10.5px] uppercase tracking-[0.1em] text-mut hover:text-accent hover:no-underline";

export function Header() {
	const { content, t } = useLanguage();
	const { person, role } = content.frontmatter;

	return (
		<header className="sticky top-0 z-10 flex min-h-[54px] flex-wrap items-center gap-x-[18px] gap-y-1 border-b border-accent-line bg-header px-[clamp(18px,4vw,44px)] py-1 backdrop-blur-md">
			<span className="whitespace-nowrap font-serif text-[17px] text-ink">
				{person.name}
			</span>
			<span className="whitespace-nowrap font-mono text-[9.5px] uppercase tracking-[0.15em] text-mut-2">
				{role}
			</span>
			<div className="min-w-[30px] flex-1" />
			<Link to="/cv" className={navLink}>
				{t("header.cv")}
			</Link>
			<a href={person.gitlab.href} className={navLink}>
				{t("header.gitlab")}
			</a>
			<div className="h-[18px] w-px bg-rule" />
			<ThemeToggle />
			<LangSwitch />
		</header>
	);
}
