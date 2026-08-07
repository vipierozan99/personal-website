import clsx from "clsx";
import type { ReactNode } from "react";
import { useT } from "../lib/lang";
import { usePanelOverflow } from "../lib/usePanelOverflow";

/**
 * Caps a section at 460px with its own scroll, a bottom fade while there is
 * more below, and a "Show all" pill — all only when the content actually
 * overflows. The expand runs inside a view transition.
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
	const { ref, expanded, fade, showButton, toggle } =
		usePanelOverflow<HTMLDivElement>();

	return (
		<>
			<div className="relative">
				<div
					ref={ref}
					className={clsx(
						"overscroll-contain",
						!expanded && "max-h-panel overflow-y-auto",
					)}
				>
					{children}
				</div>
				{fade && (
					<div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-15% from-paper to-transparent" />
				)}
			</div>
			{showButton && (
				<button
					type="button"
					onClick={toggle}
					className="mt-3 cursor-pointer self-start whitespace-nowrap rounded-full border border-accent-line px-3 py-1.5 font-mono text-accent text-tag uppercase tracking-widest transition-colors duration-150 hover:border-accent"
				>
					{expanded
						? t("panel.collapse", { label })
						: t("panel.showAll", { label })}
				</button>
			)}
		</>
	);
}
