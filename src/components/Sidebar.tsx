import { Link } from "@tanstack/react-router";
import portrait from "../assets/portrait.jpeg";
import { useHighlight } from "../lib/highlight";
import { useLanguage } from "../lib/lang";
import { useCopy } from "../lib/useCopy";

export function Sidebar() {
	const { content, t } = useLanguage();
	const { person } = content.frontmatter;

	return (
		// The grid area spans the full main-row height; the inner wrapper is
		// what sticks below the 54px header while the columns scroll.
		<aside className="h-full">
			<div className="sticky top-20 flex flex-col gap-6">
				<div className="flex aspect-4/5 items-end justify-center border border-accent-line">
					<img
						src={portrait}
						alt={t("sidebar.portrait")}
						className="h-full w-full object-cover"
					/>
				</div>

				<SectionNav />
				<div className="h-px bg-rule" />

				<div className="font-mono text-mut-2 text-tag leading-prose">
					{content.frontmatter.location}
					<br />
					{content.frontmatter.before}
				</div>

				<HintBox />

				<div className="flex flex-col gap-2 font-mono text-ink-3 text-tag">
					<CopyEmailRow email={person.email} />
					<a
						href={person.github.href}
						className="flex justify-between text-ink-3 hover:text-accent hover:no-underline"
					>
						<span>{person.github.label}</span>
						<span className="text-mut-2">↗</span>
					</a>
					<Link
						to="/cv"
						className="flex justify-between text-ink-3 hover:text-accent hover:no-underline"
					>
						<span>{t("elsewhere.cvLink").replace(" →", "")}</span>
						<span className="text-mut-2">→</span>
					</Link>
				</div>
			</div>
		</aside>
	);
}

function SectionNav() {
	const { t } = useLanguage();
	const sections = [
		{ n: "01", href: "#intro", label: t("nav.intro") },
		{ n: "02", href: "#care", label: t("nav.care") },
		{ n: "03", href: "#projects", label: t("nav.projects") },
		{ n: "04", href: "#people", label: t("nav.people") },
		{ n: "05", href: "#topics", label: t("nav.topics") },
		{ n: "06", href: "#elsewhere", label: t("nav.elsewhere") },
	];

	return (
		<nav className="flex gap-3">
			<div className="w-0.5 shrink-0 bg-rule" />
			<div className="flex flex-1 flex-col gap-3">
				{sections.map((section) => (
					<a
						key={section.href}
						href={section.href}
						className="flex items-baseline gap-2 text-inherit hover:no-underline"
					>
						<span className="font-mono text-faint-2 text-tag">{section.n}</span>
						<span className="font-mono text-mut-2 text-tag uppercase tracking-tag hover:text-accent">
							{section.label}
						</span>
					</a>
				))}
			</div>
		</nav>
	);
}

/** Narrates the topic↔project cross-light for whatever is under the pointer. */
function HintBox() {
	const { content, t } = useLanguage();
	const { hover } = useHighlight();

	let hint = t("sidebar.hint");
	if (hover?.kind === "topic") {
		const topic = content.topics.find((entry) => entry.id === hover.id);
		if (topic)
			hint = t("sidebar.hintTopic", { topic: topic.label.toLowerCase() });
	} else if (hover?.kind === "project") {
		const project = content.projects.find((entry) => entry.id === hover.id);
		if (project) hint = t("sidebar.hintProject", { project: project.title });
	}

	return (
		<div className="border-accent-2 border-l-2 pl-3 font-mono text-accent text-tag leading-prose">
			{hint}
		</div>
	);
}

function CopyEmailRow({ email }: { email: string }) {
	const { t } = useLanguage();
	const { copied, copy } = useCopy(email);
	return (
		<button
			type="button"
			onClick={copy}
			title={t("contact.copy")}
			className="flex cursor-pointer justify-between font-mono text-ink-3 text-tag transition-colors duration-150 hover:text-accent"
		>
			<span>{copied ? t("contact.copied") : email}</span>
			<span className="text-mut-2" aria-hidden>
				⧉
			</span>
		</button>
	);
}
