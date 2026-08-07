import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { useState } from "react";
import { useHighlight } from "../lib/highlight";
import { useLanguage } from "../lib/lang";
import {
	READER,
	type ReaderKey,
	resetReader,
	setReaderPref,
} from "../lib/reader";
import { useCopy } from "../lib/useCopy";

export function Sidebar() {
	const { content, t } = useLanguage();
	const { person } = content.frontmatter;

	return (
		// The grid area spans the full main-row height; the inner wrapper is
		// what sticks below the 54px header while the columns scroll.
		<aside className="h-full">
			<div className="sticky top-20 flex flex-col gap-6">
				<div
					className="flex aspect-[4/5] w-full items-end justify-center border border-accent-line pb-2"
					style={{
						background:
							"repeating-linear-gradient(135deg, var(--band) 0 6px, var(--paper-2) 6px 12px)",
					}}
				>
					<span className="font-mono text-mut-2 text-tag tracking-wider">
						{t("sidebar.portrait")}
					</span>
				</div>

				<SectionNav />
				<div className="h-px bg-rule" />
				<ReaderControls />
				<div className="h-px bg-rule" />

				<div className="font-mono text-mut-2 text-ui leading-prose">
					{content.frontmatter.location}
					<br />
					{content.frontmatter.before}
				</div>

				<HintBox />

				<div className="flex flex-col gap-2 font-mono text-ink-3 text-ui">
					<CopyEmailRow email={person.email} />
					<a
						href={person.gitlab.href}
						className="flex justify-between text-ink-3 hover:text-accent hover:no-underline"
					>
						<span>{person.gitlab.label}</span>
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
						<span className="font-mono text-mut-2 text-ui uppercase tracking-widest hover:text-accent">
							{section.label}
						</span>
					</a>
				))}
			</div>
		</nav>
	);
}

/**
 * Segmented pickers for measure, size and face. Selection state lives in
 * `<html data-*>` and localStorage (see src/lib/reader.ts); the active-pill
 * styling is the CSS block in index.css keyed on those attributes, so these
 * buttons render identically on server and client no matter what is stored.
 */
function ReaderControls() {
	const { t } = useLanguage();
	const [open, setOpen] = useState(true);

	const groups: {
		key: ReaderKey;
		name: string;
		options: { value: string | number; label: string; className?: string }[];
	}[] = [
		{
			key: "measure",
			name: t("reading.measure"),
			options: READER.measure.options.map((value) => ({
				value,
				label: `${value}ch`,
			})),
		},
		{
			key: "size",
			name: t("reading.size"),
			options: [
				{ value: 16, label: "S" },
				{ value: 18, label: "M" },
				{ value: 21, label: "L" },
			],
		},
		{
			key: "face",
			name: t("reading.face"),
			options: [
				{ value: "serif", label: t("reading.serif"), className: "font-serif" },
				{ value: "sans", label: t("reading.sans"), className: "font-sans" },
				{ value: "mono", label: t("reading.mono"), className: "font-mono" },
			],
		},
	];

	return (
		<div className="flex flex-col gap-3">
			<button
				type="button"
				onClick={() => setOpen((value) => !value)}
				aria-expanded={open}
				className="flex cursor-pointer items-center gap-2 text-left"
			>
				<span className="flex-1 font-bold font-mono text-accent text-tag uppercase tracking-banner">
					{t("reading.title")}
				</span>
				<span className="font-mono text-accent text-ui" aria-hidden>
					{open ? "−" : "+"}
				</span>
			</button>
			{open && (
				<div className="flex flex-col gap-3">
					{groups.map((group) => (
						<div key={group.key} className="flex flex-col gap-1.5">
							<span className="font-mono text-faint text-tag uppercase tracking-tag">
								{group.name}
							</span>
							<div className="flex overflow-hidden rounded-card border border-accent-line">
								{group.options.map((option) => (
									<button
										key={String(option.value)}
										type="button"
										data-reader-option={`${group.key}-${option.value}`}
										onClick={() =>
											// The options come straight from READER, so the cast is
											// narrowing back what the render map widened.
											setReaderPref(group.key, option.value as never)
										}
										className={clsx(
											"flex-1 cursor-pointer border-rule border-r px-1 py-2 font-mono text-xs last:border-r-0",
											option.className,
										)}
									>
										{option.label}
									</button>
								))}
							</div>
						</div>
					))}
					<div className="font-mono text-faint text-label leading-prose">
						{t("reading.kept")}{" "}
						<button
							type="button"
							onClick={resetReader}
							className="cursor-pointer font-mono text-accent text-label underline"
						>
							{t("reading.reset")}
						</button>
					</div>
				</div>
			)}
		</div>
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
		<div className="border-accent-2 border-l-2 pl-3 font-mono text-accent text-ui leading-prose">
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
			className="flex cursor-pointer justify-between font-mono text-ink-3 text-ui transition-colors duration-150 hover:text-accent"
		>
			<span>{copied ? t("contact.copied") : email}</span>
			<span className="text-mut-2" aria-hidden>
				⧉
			</span>
		</button>
	);
}
