import { Link } from "@tanstack/react-router";
import { useLanguage } from "../lib/lang";
import { LangSwitch } from "./LangSwitch";
import { ThemeToggle } from "./ThemeToggle";

const navLink =
	"font-mono text-tag uppercase tracking-tag text-mut hover:text-accent hover:no-underline";

export function Header() {
	const { content, t } = useLanguage();
	const { person, role } = content.frontmatter;

	return (
		<header className="sticky top-0 z-10 flex min-h-header flex-wrap items-center gap-x-4 gap-y-1 border-accent-line border-b bg-header px-gutter py-1 backdrop-blur-md print:hidden">
			<Link
				to="/"
				className="whitespace-nowrap font-serif text-ink text-lg hover:no-underline"
			>
				{person.name}
			</Link>
			<span className="whitespace-nowrap font-mono text-mut-2 text-tag uppercase tracking-tag">
				{role}
			</span>
			<div className="min-w-8 flex-1" />
			<Link to="/cv" className={navLink}>
				{t("header.cv")}
			</Link>
			<a href={person.gitlab.href} className={navLink}>
				{t("header.gitlab")}
			</a>
			<div className="h-4 w-px bg-rule" />
			<ThemeToggle />
			<LangSwitch />
		</header>
	);
}
