import { useLanguage } from "../../lib/lang-context";
import { Panel } from "../Panel";
import { Prose } from "../Prose";
import { SectionHeader } from "../SectionHeader";

export function People() {
	const { content, t } = useLanguage();

	return (
		<section id="people" className="flex flex-col">
			<SectionHeader label={t("people.title")}>
				<span className="font-mono text-mut text-tag">
					{t("people.count", { count: content.people.length })}
				</span>
			</SectionHeader>
			<Panel label={t("panel.people")}>
				<div className="flex flex-col gap-3">
					{content.people.map((person) => (
						<div
							key={person.id}
							className="flex flex-col gap-3 rounded-card border border-rule bg-paper-2 p-5"
						>
							<div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
								<span className="font-serif text-2xl text-ink leading-heading">
									{person.name}
								</span>
								<span className="text-faint" aria-hidden="true">
									—
								</span>
								<span className="font-mono text-mut text-tag uppercase tracking-tag">
									{person.subject}
								</span>
							</div>
							<div className="prose-body text-pretty text-ink-2 [--prose-size:0.875rem]">
								<Prose value={person.note} />
							</div>
							<span className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-tag">
								{person.links.map((link) => (
									<a key={link.label} href={link.href}>
										{link.label}
									</a>
								))}
							</span>
						</div>
					))}
				</div>
			</Panel>
		</section>
	);
}
