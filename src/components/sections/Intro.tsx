import { useLanguage } from "../../lib/lang";
import { InlineProse, Prose } from "../Prose";

export function Intro() {
	const { content } = useLanguage();
	const { frontmatter, intro } = content;

	return (
		<section
			id="intro"
			className="flex w-full flex-col gap-6"
			style={{ maxWidth: "var(--reader-measure)" }}
		>
			<div className="flex flex-col gap-2">
				<h1 className="font-normal font-serif text-display text-ink leading-display tracking-display">
					{frontmatter.person.name}
				</h1>
				<p className="font-serif text-accent text-subtitle italic leading-snug">
					{frontmatter.subtitle}
				</p>
			</div>

			<div className="prose-body text-pretty text-ink-2">
				<Prose value={intro.bio} />
			</div>

			<div id="care" className="border-accent border-l-[3px] py-1 pl-5">
				<p className="m-0 text-pretty font-serif text-ink text-quote leading-normal">
					<InlineProse value={intro.quote} />
				</p>
			</div>

			<div className="prose-body text-ink-2">
				<Prose value={intro.lead} />
			</div>
		</section>
	);
}
