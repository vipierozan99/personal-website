import { Fragment as ReactFragment, type ReactNode } from "react";
import type {
	AcademiaAttrs,
	RoleAttrs,
	SkillsAttrs,
} from "../../content/cv-schema";
import { formatDuration, monthsBetween, shortMonth } from "../../lib/dates";
import { useCvContext } from "./context";
import { SectionRule } from "./Sheet";

/**
 * `::summary`. A single paragraph, which the parser's `autoUnwrap` strips of
 * its `<p>` — so the paragraph element is supplied here, and the build fails
 * if the document ever puts a block element inside.
 */
export function Summary({ children }: { children?: ReactNode }) {
	return (
		<p className="mt-5 max-w-[68ch] text-pretty text-[17px] text-ink-2 leading-[1.48]">
			{children}
		</p>
	);
}

/**
 * `::role`. The date column is built from the attributes and the prose column
 * is whatever the markdown put inside, which is the split the whole
 * conversion turns on: props are chrome, children are content. Dates are
 * monospaced so the columns line up down the sheet without a rule to hold
 * them.
 */
export function Role({
	org,
	from,
	to,
	children,
	slotStack,
}: RoleAttrs & { children?: ReactNode; slotStack?: ReactNode }) {
	const { t, now } = useCvContext();
	const span = `${shortMonth(from)} → ${to ? shortMonth(to) : t("cv.present")}`;
	const duration = formatDuration(monthsBetween(from, to ?? now), t);

	return (
		<div
			data-role-row
			className="-mx-[10px] grid grid-cols-[132px_1fr] border-rule-2 border-b px-[10px] py-[11px] transition-colors duration-150 hover:bg-hover print:hover:bg-transparent"
		>
			<div className="font-mono text-[10.5px] text-mut leading-[1.7]">
				<div className="font-semibold text-accent">{span}</div>
				<div className="text-mut-2">{duration}</div>
				<div>{org}</div>
			</div>

			<div className="prose-role flex flex-col gap-[7px]">
				{children}
				{slotStack ? (
					<div className="font-mono text-[10px] text-mut-2 tracking-[0.03em]">
						{slotStack}
					</div>
				) : null}
			</div>
		</div>
	);
}

/** `::academia`. One shared date column for the entries nested inside it. */
export function Academia({
	org,
	from,
	to,
	children,
}: AcademiaAttrs & { children?: ReactNode }) {
	return (
		<div className="grid grid-cols-[132px_1fr] pt-[10px]">
			<div className="font-mono text-[10.5px] text-mut leading-[1.7]">
				<div className="font-semibold text-accent">
					{shortMonth(from)} → {shortMonth(to)}
				</div>
				<div>{org}</div>
			</div>
			<div className="prose-entry flex flex-col gap-[10px]">{children}</div>
		</div>
	);
}

/**
 * `:::entry`. Carries no styling of its own — it exists so each qualification
 * is one element, which is what `:first-child` in `prose-entry` selects.
 */
export function Entry({ children }: { children?: ReactNode }) {
	return <div>{children}</div>;
}

/** `::skills`. Data rather than prose, so it arrives as YAML block props. */
export function Skills({ items }: SkillsAttrs) {
	return (
		<div className="font-mono text-[11px] text-ink-2 leading-[1.85]">
			{items.map((skill) => (
				// A grid rather than an inline label, so a value long enough to wrap
				// hangs under itself instead of colliding with the key column.
				<div key={skill.key} className="grid grid-cols-[3.4em_1fr]">
					<span className="text-mut-2">{skill.key}</span>
					<span>{skill.value}</span>
				</div>
			))}
		</div>
	);
}

/**
 * Every `###` in the document. Rendered a level down, as `<h3>`, because the
 * section rule above it already occupies `<h2>` — the document's own `##` is
 * consumed as that rule's label and never rendered. The name is the only
 * `<h1>`, so the levels run 1 → 2 → 3 with nothing skipped.
 */
export function Heading({
	id,
	children,
}: {
	id?: string;
	children?: ReactNode;
}) {
	return <h3 id={id}>{children}</h3>;
}

/** Every link in the document. */
export function DocumentLink({
	href,
	children,
}: {
	href?: string;
	children?: ReactNode;
}) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="text-accent underline decoration-accent-line underline-offset-2 hover:decoration-accent"
		>
			{children}
		</a>
	);
}

/**
 * The sections marked `{.closing}`, set side by side to close the last sheet.
 * The first takes its own column — it is the skills list, the tallest thing
 * on the sheet — and the rest stack beside it.
 */
export function Closing({
	sections,
}: {
	sections: { id: string; label: string; body: ReactNode }[];
}) {
	const [lead, ...rest] = sections;

	return (
		<div className="mt-[10px] grid grid-cols-2 gap-[38px]">
			<div className="flex flex-col gap-[9px]">
				{lead ? (
					<>
						<SectionRule label={lead.label} />
						<div className="prose-closing">{lead.body}</div>
					</>
				) : null}
			</div>

			<div className="flex flex-col gap-[9px]">
				{rest.map((section, index) => (
					<ReactFragment key={section.id}>
						<SectionRule
							label={section.label}
							className={index > 0 ? "mt-[7px]" : undefined}
						/>
						<div className="prose-closing">{section.body}</div>
					</ReactFragment>
				))}
			</div>
		</div>
	);
}
