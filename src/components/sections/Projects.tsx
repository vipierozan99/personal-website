import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { useMemo, useState } from "react";
import type { Project } from "../../content/model";
import { useHighlight } from "../../lib/highlight";
import { useLanguage } from "../../lib/lang";
import { crossfade } from "../../lib/transitions";
import { Panel } from "../Panel";
import { InlineProse, Prose } from "../Prose";
import { headerButton, SectionHeader } from "../SectionHeader";

export const byYear =
	(newestFirst: boolean) =>
	(a: { year: number }, b: { year: number }): number =>
		newestFirst ? b.year - a.year : a.year - b.year;

export function Projects() {
	const { content, t } = useLanguage();
	const [newestFirst, setNewestFirst] = useState(true);
	const [open, setOpen] = useState<ReadonlySet<string>>(new Set());

	const sorted = useMemo(
		() => [...content.projects].sort(byYear(newestFirst)),
		[content.projects, newestFirst],
	);

	const allOpen = open.size === content.projects.length;

	return (
		<section id="projects" className="flex flex-col">
			<SectionHeader label={t("projects.title")}>
				<button
					type="button"
					className={headerButton}
					onClick={() =>
						crossfade(() =>
							setOpen(
								allOpen
									? new Set()
									: new Set(content.projects.map((project) => project.id)),
							),
						)
					}
				>
					{allOpen ? t("projects.collapseAll") : t("projects.expandAll")}
				</button>
				<button
					type="button"
					className={headerButton}
					onClick={() => crossfade(() => setNewestFirst((value) => !value))}
				>
					{newestFirst ? t("projects.newest") : t("projects.oldest")}
				</button>
			</SectionHeader>
			<Panel label={t("panel.projects")}>
				{sorted.map((project) => (
					<Row
						key={project.id}
						project={project}
						open={open.has(project.id)}
						toggle={() =>
							crossfade(() =>
								setOpen((current) => {
									const next = new Set(current);
									if (!next.delete(project.id)) next.add(project.id);
									return next;
								}),
							)
						}
					/>
				))}
			</Panel>
		</section>
	);
}

function Row({
	project,
	open,
	toggle,
}: {
	project: Project;
	open: boolean;
	toggle: () => void;
}) {
	const { setHover, projectLit } = useHighlight();

	return (
		<div
			className={clsx(
				"border-rule-2 border-b transition-opacity duration-200",
				!projectLit(project.id) && "opacity-35",
			)}
			style={{ viewTransitionName: `proj-${project.id}` }}
		>
			<button
				type="button"
				onClick={toggle}
				aria-expanded={open}
				onMouseEnter={() => setHover({ kind: "project", id: project.id })}
				onMouseLeave={() => setHover(null)}
				onFocus={() => setHover({ kind: "project", id: project.id })}
				onBlur={() => setHover(null)}
				className="grid w-full cursor-pointer grid-cols-[2rem_1fr_1rem] items-baseline gap-3 py-3 pr-1.5 text-left transition-colors duration-150 hover:bg-row-hover"
			>
				<span className="font-mono text-accent-2 text-tag">{project.year}</span>
				<span className="flex flex-col gap-1">
					<span className="flex flex-wrap items-baseline gap-3">
						<span className="font-serif text-accent text-title">
							{project.title}
						</span>
						<span className="font-mono text-mut-2 text-tag uppercase tracking-tag">
							{project.meta}
						</span>
					</span>
					<span className="text-ink-3 text-sm leading-normal">
						<InlineProse value={project.blurb} />
					</span>
				</span>
				<span
					className="justify-self-end font-mono text-faint text-sm"
					aria-hidden
				>
					{open ? "−" : "+"}
				</span>
			</button>
			{open && (
				<div className="pr-1.5 pb-4 pl-12">
					<div className="flex flex-col gap-3 border-accent-soft border-l-2 pl-4">
						<div className="prose-body text-ink-2">
							<Prose value={project.detail} />
						</div>
						<span className="flex flex-wrap gap-1">
							{project.stack.map((chip) => (
								<span
									key={chip}
									className="rounded-full bg-chip px-2 py-1 font-mono text-mut text-tag"
								>
									{chip}
								</span>
							))}
						</span>
						<ProjectLink href={project.href} label={project.link} />
					</div>
				</div>
			)}
		</div>
	);
}

/** Internal targets route through the router; everything else is a plain a. */
function ProjectLink({ href, label }: { href: string; label: string }) {
	const className = "self-start font-mono text-tag";
	return href.startsWith("/") ? (
		<Link to={href} className={className}>
			{label}
		</Link>
	) : (
		<a href={href} className={className}>
			{label}
		</a>
	);
}
