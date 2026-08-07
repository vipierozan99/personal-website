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

function Home() {
	return (
		<>
			<Header />
			<HighlightProvider>
				<div className="flex flex-row-reverse flex-wrap justify-center gap-14 px-[clamp(18px,4vw,44px)] pt-[46px] pb-16">
					<div className="flex min-w-0 flex-[4_1_600px] flex-col gap-[30px]">
						<div className="flex flex-wrap items-start gap-[46px]">
							<div className="flex max-w-[720px] min-w-[280px] flex-[1_1_420px] flex-col gap-[34px]">
								<Intro />
								<Projects />
							</div>
							<div className="flex max-w-[620px] min-w-[280px] flex-[1_1_400px] flex-col gap-[34px]">
								<People />
								<Topics />
							</div>
						</div>
						<Elsewhere />
					</div>
					<Sidebar />
				</div>
			</HighlightProvider>
		</>
	);
}
