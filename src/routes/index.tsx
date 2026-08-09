import { createFileRoute } from "@tanstack/react-router";
import { CvLink, Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { Elsewhere } from "../components/sections/Elsewhere";
import { Intro } from "../components/sections/Intro";
import { People } from "../components/sections/People";
import { Topics } from "../components/sections/Topics";
import { HighlightProvider } from "../lib/highlight";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<div className="flex min-h-dvh flex-col">
			<Header actions={<CvLink />} />
			<HighlightProvider>
				<div className="grid flex-1 grid-cols-1 grid-rows-[1fr_auto_auto] gap-x-12 gap-y-12 px-gutter pt-12 pb-12 [grid-template-areas:'content'_'sidebar'_'footer'] md:grid-cols-[minmax(16rem,19rem)_1fr] md:grid-rows-[1fr_auto] md:[grid-template-areas:'sidebar_content'_'sidebar_footer']">
					<div className="flex min-w-0 flex-wrap content-start items-start justify-center gap-12 [grid-area:content]">
						<div className="mx-auto flex min-w-0 max-w-260 flex-[1_1_40rem] flex-col gap-8">
							<Intro />
							{/* <Projects /> */}
						</div>
						<div className="flex min-w-0 max-w-200 flex-[1_1_30rem] flex-col gap-8">
							<People />
							<Topics />
						</div>
					</div>
					<div className="[grid-area:sidebar]">
						<Sidebar />
					</div>
					<div className="min-w-0 self-end [grid-area:footer]">
						<Elsewhere />
					</div>
				</div>
			</HighlightProvider>
		</div>
	);
}
