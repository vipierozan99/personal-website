import { createFileRoute } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { Elsewhere } from "../components/sections/Elsewhere";
import { Intro } from "../components/sections/Intro";
import { People } from "../components/sections/People";
import { Projects } from "../components/sections/Projects";
import { Topics } from "../components/sections/Topics";
import { HighlightProvider } from "../lib/highlight";

export const Route = createFileRoute("/")({
	component: Home,
});

/**
 * Page frame: header, then a grid that fills the rest of the viewport.
 *
 * Wide screens — sidebar hugs the left edge and spans both rows; the columns
 * take every remaining pixel; the footer sits under the columns only, pushed
 * to the viewport bottom by the 1fr content row when the page is short:
 *
 *   sidebar | content   (1fr)
 *   sidebar | footer    (auto)
 *
 * Narrow screens — one column: content, then the sidebar stack, footer last.
 */
function Home() {
	return (
		<div className="flex min-h-dvh flex-col">
			<Header />
			<HighlightProvider>
				<div className="grid flex-1 grid-cols-1 grid-rows-[1fr_auto_auto] gap-x-14 gap-y-12 px-[clamp(18px,3vw,44px)] pt-[46px] pb-10 [grid-template-areas:'content'_'sidebar'_'footer'] md:grid-cols-[minmax(250px,300px)_1fr] md:grid-rows-[1fr_auto] md:[grid-template-areas:'sidebar_content'_'sidebar_footer']">
					<div className="flex min-w-0 flex-wrap content-start items-start gap-[46px] [grid-area:content]">
						<div className="flex min-w-[340px] flex-[1_1_420px] flex-col gap-[34px]">
							<Intro />
							<Projects />
						</div>
						<div className="flex min-w-[340px] flex-[1_1_400px] flex-col gap-[34px]">
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
