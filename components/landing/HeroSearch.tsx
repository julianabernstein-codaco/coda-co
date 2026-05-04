import Link from "next/link";

const entries = [
  { label: "I'm planning ahead", href: "/services" },
  { label: "Someone has died", href: "/where-to-start" },
  { label: "Someone is dying", href: "/where-to-start" },
  { label: "I'm just exploring", href: "/shop" },
];

export function HeroSearch() {
  return (
    <>
      <div className="flex max-w-[500px] mx-auto mb-4">
        <input
          type="text"
          placeholder="Search goods, services, books…"
          className="flex-1 px-5 py-3.5 border-[1.5px] border-r-0 border-[rgba(193,99,79,.25)] rounded-l-[28px] bg-white text-[14px] text-ch outline-none focus:border-tr placeholder:text-cl"
        />
        <button className="bg-tr text-white border-0 px-6 py-3.5 rounded-r-[28px] text-[13px] cursor-pointer hover:bg-tr-d transition-colors">
          Search
        </button>
      </div>

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
    </>
  );
}
