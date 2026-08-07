import type { ReactNode } from "react";

export function SectionHeader({
	label,
	children,
}: {
	label: string;
	children?: ReactNode;
}) {
	return (
		<div className="mb-1.5 flex items-baseline gap-3 border-b border-accent-line pb-2.5">
			<span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
				{label}
			</span>
			<div className="flex-1" />
			{children}
		</div>
	);
}

/** The bare text-button style the section headers share. */
export const headerButton =
	"cursor-pointer font-mono text-[10px] uppercase tracking-[0.1em] text-accent";
