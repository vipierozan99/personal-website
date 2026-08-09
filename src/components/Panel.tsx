import clsx from "clsx";
import type { ReactNode } from "react";
import { useT } from "../lib/lang-context";
import { usePanelOverflow } from "../lib/usePanelOverflow";

/**
 * Caps a section at 460px with its own scroll, a bottom fade while there is
 * more below, and a "Show all" pill — all only when the content actually
 * overflows. The expand animates the cap away rather than cross-fading, so the
 * page below moves with it.
 */
export function Panel({
	label,
	children,
}: {
	/** Already-localized noun for the button, e.g. "projects" or "15 topics". */
	label: string;
	children: ReactNode;
}) {
	const t = useT();
	const { ref, expanded, overflowing, toggle } =
		usePanelOverflow<HTMLDivElement>();
	const showFade = overflowing && !expanded;

	return (
		<>
			<div className="relative">
				<div
					ref={ref}
					className={clsx(
						"scroll-gutter overflow-y-auto overscroll-contain",
						!expanded && "max-h-panel",
						showFade && "pb-6",
					)}
				>
					{children}
				</div>
				{/* Mounted in both states: appearing is what made the collapse flash,
				    and an inert gradient costs a paint of nothing. */}
				<div
					className={clsx(
						"pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-15% from-paper to-transparent transition-opacity duration-300",
						showFade ? "opacity-100" : "opacity-0",
					)}
				/>
			</div>
			{overflowing && (
				<button
					type="button"
					onClick={toggle}
					className="fade-in mt-3 cursor-pointer self-start whitespace-nowrap rounded-full border border-accent-line px-3 py-1.5 font-mono text-accent text-tag uppercase tracking-tag transition-colors duration-150 hover:border-accent"
				>
					{expanded
						? t("panel.collapse", { label })
						: t("panel.showAll", { label })}
				</button>
			)}
		</>
	);
}
