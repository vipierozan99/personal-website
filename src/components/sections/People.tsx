import { useLanguage } from "../../lib/lang";
import { Panel } from "../Panel";
import { Prose } from "../Prose";
import { SectionHeader } from "../SectionHeader";

export function People() {
	const { content, t } = useLanguage();

	return (
		<section id="people" className="flex flex-col">
			<SectionHeader label={t("people.title")}>
				<span className="font-mono text-[10px] text-faint">
					{t("people.count", { count: content.people.length })}
				</span>
			</SectionHeader>
			<Panel label={t("panel.people")}>
				<div className="flex flex-col gap-3.5">
					{content.people.map((person) => (
						<div
							key={person.id}
							className="flex flex-wrap items-start gap-x-6 gap-y-2.5 rounded-[3px] border border-rule bg-paper-2 px-[22px] py-5"
						>
							<div className="flex shrink basis-[180px] flex-col gap-[7px]">
								<span className="font-serif text-2xl leading-[1.08] text-ink">
									{person.name}
								</span>
								<span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-mut-2">
									{person.subject}
								</span>
								<span className="mt-0.5 flex flex-col gap-[3px] font-mono text-[10.5px]">
									{person.links.map((link) => (
										<a key={link.label} href={link.href}>
											{link.label}
										</a>
									))}
								</span>
							</div>
							<div className="max-w-[52ch] flex-1 basis-[300px] font-serif text-[16.5px] leading-[1.62] text-pretty text-ink-2">
								<Prose value={person.note} />
							</div>
						</div>
					))}
				</div>
			</Panel>
		</section>
	);
}
