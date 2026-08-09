import { clsx } from "clsx";
import type { ComponentProps } from "react";

/**
 * One physical A4 sheet. The size is set in centimetres to match the `@page`
 * rule, so a screen sheet and a printed sheet are the same object; everything
 * inside is in pixels, which at the CSS 96dpi reference makes 21cm exactly
 * 794px. These literals are deliberately not tokenized: scripts/browser.js
 * finds sheets by `[class*="21cm"]`, and the sheet is a print object outside
 * the site's rem scale by design.
 *
 * `sheet-light` pins the token bases to their light values (see index.css),
 * so the paper stays paper in dark mode and when printing from it.
 *
 * `fit` is a prop rather than something a caller overrides through
 * `className`: classes here are concatenated, not merged, so a passed-in
 * `h-auto` would not beat the `h-[29.7cm]` below.
 */
export function Sheet({
	children,
	className,
	fit = "page",
	...props
}: ComponentProps<"div"> & { fit?: "page" | "content" }) {
	return (
		<div
			className={clsx(
				"sheet-light mx-auto flex w-[21cm] flex-col overflow-hidden",
				fit === "page" ? "h-[29.7cm]" : "h-auto min-h-[29.7cm]",
				"border border-rule bg-paper font-serif text-ink",
				"px-[60px] pt-[58px] pb-[44px]",
				"shadow-[0_20px_50px_-28px_rgba(20,18,12,0.4)]",
				"print:m-0 print:border-0 print:shadow-none",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

/**
 * The region a sheet gives to content. Its measured height is the page
 * capacity the paginator packs against, which is why the footer sits outside.
 */
export function SheetFlow({
	children,
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div className={clsx("flex min-h-0 flex-1 flex-col", className)} {...props}>
			{children}
		</div>
	);
}

export function SheetFooter({
	name,
	site,
	page,
	total,
}: {
	name: string;
	site: string;
	page: number;
	total: number;
}) {
	return (
		<div className="flex justify-between pt-4 font-mono text-[9.5px] text-accent uppercase tracking-widest">
			<span>{name}</span>
			<span>{site}</span>
			<span>
				{page} / {total}
			</span>
		</div>
	);
}

/*
 * Print metrics, pinned rather than tokenised — like the px sizes throughout
 * these sheets. The section headings once read the site's --tracking-banner,
 * which meant retuning that token for the screen silently re-set the printed
 * document and moved the committed PDF bytes. Anything the sheets render is
 * part of a paginated artifact: it states its own values.
 */
const SHEET_HEADING =
	"font-bold font-mono text-[10px] text-accent uppercase tracking-[0.2em]";

/** The label-and-hairline that opens a section. */
export function SectionRule({
	label,
	suffix,
	className,
}: {
	label: string;
	suffix?: string;
	className?: string;
}) {
	return (
		<div className={clsx("flex items-baseline gap-[10px]", className)}>
			<h2 className={SHEET_HEADING}>
				{label}
				{suffix ? <span className="text-mut-2"> {suffix}</span> : null}
			</h2>
			<div className="h-px flex-1 bg-accent-line" />
		</div>
	);
}

/**
 * Opens every sheet after the first, bleeding to the paper edges so the
 * reader picks up the second sheet as its own object rather than as a scroll
 * position. It is always rendered on those sheets — even with nothing to
 * continue, where it degrades to the bare rule — because a constant height is
 * what lets the paginator size the pages in one pass.
 */
export function ContinuationRule({
	label,
	suffix,
}: {
	label?: string;
	suffix?: string;
}) {
	return (
		<div className="-mx-[60px] -mt-[22px] mb-[18px] border-accent border-t-[3px] px-[60px] pt-[18px]">
			{/* Fixed height so the labelled and bare variants cost the page the same. */}
			<div className="flex h-[13px] items-baseline gap-[10px]">
				{label ? (
					<h2 className={SHEET_HEADING}>
						{label}
						{suffix ? <span className="text-mut-2"> {suffix}</span> : null}
					</h2>
				) : null}
				<div className="h-px flex-1 bg-accent-line" />
			</div>
		</div>
	);
}
