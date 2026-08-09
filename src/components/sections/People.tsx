import { useLanguage } from "../../lib/lang";
import { Panel } from "../Panel";
import { Prose } from "../Prose";
import { SectionHeader } from "../SectionHeader";

export function People() {
	const { content, t } = useLanguage();

	return (
		<section id="people" className="flex flex-col">
			<SectionHeader label={t("people.title")}>
				<span className="font-mono text-faint text-tag">
					{t("people.count", { count: content.people.length })}
				</span>
			</SectionHeader>
			<Panel label={t("panel.people")}>
				<div className="flex flex-col gap-3">
					{content.people.map((person) => (
						<div
							key={person.id}
							className="flex flex-wrap items-start gap-x-6 gap-y-2 rounded-card border border-rule bg-paper-2 p-5"
						>
							<div className="flex shrink basis-45 flex-col gap-2">
								<span className="font-serif text-2xl text-ink leading-heading">
									{person.name}
								</span>
								<span className="font-mono text-mut-2 text-tag uppercase tracking-tag">
									{person.subject}
								</span>
								<span className="flex flex-col gap-1 font-mono text-tag">
									{person.links.map((link) => (
										<a key={link.label} href={link.href}>
											{link.label}
										</a>
									))}
								</span>
							</div>
							<div className="prose-body flex-1 basis-75 text-pretty text-ink-2">
								<Prose value={person.note} />
							</div>
						</div>
					))}
				</div>
			</Panel>
		</section>
	);
}
