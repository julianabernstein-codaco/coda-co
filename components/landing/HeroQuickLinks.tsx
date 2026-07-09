import Link from "next/link";

// The "How can we help you today?" intent picker that sits in the hero. Four
// quick-links covering the services / planning / browsing intents. RSC — it's
// just links, no client state (the keyword search lives in HeroSearchBar).
const entries = [
  {
    label: "I'm planning ahead",
    href: "/services?lifeStage=planning-ahead,throughout",
  },
  { label: "Someone has died", href: "/where-to-start" },
  {
    label: "Someone is dying",
    href: "/services?lifeStage=throughout,active-dying,planning-ahead",
  },
  { label: "I'm just exploring", href: "/shop" },
];

export function HeroQuickLinks() {
  return (
    <div className="bg-sg-p border border-sg-l rounded-[12px] px-6 py-5 max-w-[500px] mx-auto">
      <p className="text-[14px] text-cm mb-3 text-center">
        How can we help you today?
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {entries.map((entry) => (
          <Link
            key={entry.label}
            href={entry.href}
            className="bg-white border border-line-strong rounded-[8px] px-4 py-3 text-[13px] text-ch text-center no-underline hover:border-tr hover:text-tr transition-colors"
          >
            {entry.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
