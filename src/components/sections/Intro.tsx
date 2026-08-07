import { useLanguage } from "../../lib/lang";
import { InlineProse, Prose } from "../Prose";

export function Intro() {
	const { content } = useLanguage();
	const { frontmatter, intro } = content;

	return (
		<section
			id="intro"
			className="flex w-full flex-col gap-[22px]"
			style={{ maxWidth: "var(--reader-measure)" }}
		>
			<div className="flex flex-col gap-2.5">
				<h1 className="font-serif text-[clamp(38px,6vw,62px)] font-normal leading-[0.95] tracking-[-0.026em] text-ink">
					{frontmatter.person.name}
				</h1>
				<p className="font-serif text-[clamp(19px,2.5vw,23px)] italic leading-[1.3] text-accent">
					{frontmatter.subtitle}
				</p>
			</div>

			<div className="prose-body text-pretty text-ink-2">
				<Prose value={intro.bio} />
			</div>

			<div id="care" className="border-l-[3px] border-accent py-1 pl-5">
				<p className="m-0 font-serif text-[clamp(19px,2.5vw,21px)] leading-[1.5] text-pretty text-ink">
					<InlineProse value={intro.quote} />
				</p>
			</div>

			<div className="prose-body text-ink-2">
				<Prose value={intro.lead} />
			</div>
		</section>
	);
}
