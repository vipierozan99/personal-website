import { useLanguage } from "../../lib/lang-context";
import { InlineProse, Prose } from "../Prose";

export function Intro() {
	const { content } = useLanguage();
	const { frontmatter, intro } = content;

	return (
		<section id="intro" className="flex w-full flex-col gap-6">
			<div className="flex flex-col gap-2">
				<h1 className="font-normal font-serif-display text-display text-ink leading-display tracking-display">
					{frontmatter.person.name}
				</h1>
				<p className="font-serif text-accent text-lede italic leading-snug">
					{frontmatter.subtitle}
				</p>
			</div>

			<div className="prose-body text-pretty text-ink-2">
				<Prose value={intro.bio} />
			</div>

			<div id="care" className="border-accent border-l-[3px] py-1 pl-5">
				<p className="m-0 text-pretty font-serif text-ink text-lede leading-normal">
					<InlineProse value={intro.quote} />
				</p>
			</div>

			<div className="prose-body text-ink-2">
				<Prose value={intro.lead} />
			</div>
		</section>
	);
}
