import { HelpTimeline } from "./HelpTimeline";

// The "How can we help you today?" intent picker that sits in the hero.
// Renders the stepping-stones timeline — four life-stage moments the
// visitor can click through to services, guidance, or the shop. RSC; the
// keyword search lives in HeroSearchBar.
export function HeroQuickLinks() {
  return (
    <div className="bg-sg-p border border-sg-l rounded-[12px] px-6 py-5 max-w-[500px] mx-auto">
      <p className="text-[16px] text-cm mb-3 text-center">
        How can we help you today?
      </p>
      <HelpTimeline />
    </div>
  );
}
