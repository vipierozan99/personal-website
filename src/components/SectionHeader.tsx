import type { ReactNode } from "react";

export function SectionHeader({
	label,
	children,
}: {
	label: string;
	children?: ReactNode;
}) {
	return (
		<div className="mb-1.5 flex items-baseline gap-3 border-accent-line border-b pb-2">
			<span className="font-bold font-mono text-accent text-label uppercase tracking-banner">
				{label}
			</span>
			<div className="flex-1" />
			{children}
		</div>
	);
}

/** The bare text-button style the section headers share. */
export const headerButton =
	"cursor-pointer font-mono text-label uppercase tracking-widest text-accent";
