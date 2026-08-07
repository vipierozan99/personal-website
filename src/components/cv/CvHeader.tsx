import type { CvFrontmatter } from "../../content/cv-schema";
import { useCopy } from "../../lib/useCopy";
import { useCvContext } from "./context";

/**
 * Pinned to the first sheet. The 3px oxide rule under it is the heaviest mark
 * on the page and the only one that spans the full measure, which is what
 * makes the name read as a masthead rather than as the first line of the
 * summary.
 */
export function CvHeader({ person }: Pick<CvFrontmatter, "person">) {
	return (
		<header className="flex w-full items-end justify-between border-accent border-b-[3px] pb-4">
			{/* The name sets the width it needs and keeps it; the contact column
			    is the side that yields. */}
			<div className="flex shrink-0 grow flex-col gap-[6px]">
				<h1 className="font-medium text-[38px] text-accent leading-none tracking-[-0.018em]">
					{person.name}
				</h1>
				<div className="font-mono text-[11px] text-mut uppercase tracking-[0.09em]">
					{person.tagline}
				</div>
			</div>

			<div className="min-w-0 text-right font-mono text-[10.5px] text-ink-3 leading-[1.85]">
				<div>
					<CopyEmail email={person.email} />
				</div>
				<div>
					{person.links.map((link, index) => (
						<span key={link.href}>
							{index > 0 ? <br /> : null}
							<a
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								className="text-accent underline decoration-accent-line underline-offset-2 hover:decoration-accent"
							>
								{link.label}
							</a>
						</span>
					))}
				</div>
				<div>{person.citizenship}</div>
			</div>
		</header>
	);
}

/**
 * On screen the address is a button that copies itself; on paper a button
 * with no chrome is indistinguishable from the plain text it replaced, so the
 * printed sheet needs no special case.
 */
function CopyEmail({ email }: { email: string }) {
	const { t } = useCvContext();
	const { copied, copy } = useCopy(email);

	return (
		<button
			type="button"
			// The address on the face of the button has to be part of the name a
			// screen reader resolves, so the label spells it out rather than
			// replacing it with "copy e-mail". Once copied the face reads the
			// confirmation instead, and that is the whole name.
			aria-label={copied ? undefined : t("cv.copyEmail", { email })}
			className="cursor-pointer font-mono text-[10.5px] text-ink-3 hover:text-accent print:cursor-auto"
			onClick={copy}
		>
			{copied ? t("cv.copied") : email}
		</button>
	);
}
