import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useLanguage, useT } from "../lib/lang";
import { LangSwitch } from "./LangSwitch";
import { ThemeToggle } from "./ThemeToggle";

const navLink =
	"whitespace-nowrap font-mono text-tag uppercase tracking-tag text-mut hover:text-accent hover:no-underline";

/** The home route's action: the way in to the CV. */
export function CvLink() {
	const t = useT();
	return (
		<Link to="/cv" className={navLink}>
			{t("header.cv")}
		</Link>
	);
}

/**
 * `actions` is the one slot that differs by route — the CV link on the home
 * page, the PDF download on the CV — so each route passes its own rather than
 * the header reading the location: only the CV route knows which language the
 * document actually rendered in.
 */
export function Header({ actions }: { actions?: ReactNode }) {
	const { content } = useLanguage();
	const { person, role } = content.frontmatter;

	return (
		// justify-end with the flex-1 spacer below: the spacer eats every pixel
		// of the first row, so this only bites on a row that wrapped — which is
		// what pushes the controls to the right edge on a narrow screen.
		<header className="sticky top-0 z-10 flex min-h-header flex-wrap items-center justify-end gap-x-3 gap-y-1 border-accent-line border-b bg-header px-gutter py-1 backdrop-blur-md sm:gap-x-4 print:hidden">
			<Link
				to="/"
				className="whitespace-nowrap font-serif text-ink text-lg hover:no-underline"
			>
				{person.name}
			</Link>
			{/* The first thing to go when the bar runs out of room: it is the one
			    line here that repeats what the page already says, and dropping it
			    is what keeps the header a single row on a phone. */}
			<span className="hidden whitespace-nowrap font-mono text-mut-2 text-tag uppercase tracking-tag sm:inline">
				{role}
			</span>
			<div className="min-w-4 flex-1" />
			{actions}
			{/* Decoration, and the first casualty after the role: on a phone the
			    gap either side of it is worth more than the line itself. */}
			<div className="hidden h-4 w-px bg-rule sm:block" />
			<ThemeToggle />
			<LangSwitch />
		</header>
	);
}
