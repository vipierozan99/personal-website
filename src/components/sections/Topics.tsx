import clsx from "clsx";
import { useState } from "react";
import { useHighlight } from "../../lib/highlight";
import { useLanguage } from "../../lib/lang";
import { crossfade } from "../../lib/transitions";
import { Panel } from "../Panel";
import { InlineProse } from "../Prose";
import { headerButton, SectionHeader } from "../SectionHeader";

export function Topics() {
	const { content, t } = useLanguage();
	const { hover, setHover, topicLit } = useHighlight();
	const [glosses, setGlosses] = useState(false);

	return (
		<section id="topics" className="flex flex-col">
			<SectionHeader label={t("topics.title")}>
				<button
					type="button"
					className={clsx(headerButton, !glosses && "text-faint")}
					onClick={() => crossfade(() => setGlosses((value) => !value))}
				>
					{glosses ? t("topics.glossesOn") : t("topics.glossesOff")}
				</button>
			</SectionHeader>
			<Panel label={t("panel.topics", { count: content.topics.length })}>
				{content.topics.map((topic, index) => {
					const lit = topicLit(topic.id);
					const hovered = hover?.kind === "topic" && hover.id === topic.id;
					return (
						<button
							key={topic.id}
							type="button"
							onMouseEnter={() => setHover({ kind: "topic", id: topic.id })}
							onMouseLeave={() => setHover(null)}
							onFocus={() => setHover({ kind: "topic", id: topic.id })}
							onBlur={() => setHover(null)}
							className={clsx(
								"-ml-2 grid w-full cursor-pointer grid-cols-[30px_1fr] items-baseline gap-3 rounded-[2px] px-2 py-[7px] text-left transition-colors duration-150",
								hovered ? "bg-hover" : "bg-transparent",
							)}
						>
							<span
								className={clsx(
									"font-mono text-[10px] transition-colors duration-150",
									hover && lit ? "text-accent-2" : "text-faint-2",
								)}
							>
								{String(index + 1).padStart(2, "0")}
							</span>
							<span className="flex flex-col gap-1">
								<span
									className={clsx(
										"font-serif text-lg leading-[1.4] transition-colors duration-150",
										lit ? "text-ink-2" : "text-faint",
									)}
								>
									{topic.label}
								</span>
								{glosses && (
									<span className="max-w-[52ch] text-[13px] leading-[1.55] text-mut-2">
										<InlineProse value={topic.gloss} />
									</span>
								)}
							</span>
						</button>
					);
				})}
			</Panel>
		</section>
	);
}
