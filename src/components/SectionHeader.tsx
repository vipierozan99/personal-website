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
			<span className="font-mono font-semibold text-accent text-tag uppercase tracking-banner">
				{label}
			</span>
			<div className="flex-1" />
			{children}
		</div>
	);
}
