import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stars } from "@/components/ui/Stars";
import { VendorPhoto } from "@/components/ui/VendorPhoto";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { WaitlistDialog } from "@/app/launching/WaitlistDialog";
import { serviceTypeLabel, vendorLocationSuffix } from "@/lib/format/vendor";
import { getServices } from "@/lib/api/services";
import { getHomeFeaturedVendors } from "@/lib/api/vendors";
import type { Service, VendorWithRating } from "@/lib/types";

export const metadata: Metadata = {
  title: "CodaCo — Curated end-of-life goods, services & planning resources",
  description:
    "Curated end-of-life goods, services, and planning resources — find vetted providers and thoughtful tools to approach death, grief, and farewells with intention.",
  robots: { index: false, follow: false },
};

// The /homepage route is a public-facing teaser of the marketplace. It
// re-uses the marketing copy and layout of the real landing page
// (app/page.tsx) but every link, button, and form is intentionally
// inert — the rest of the site lives behind a preview-password gate
// (see proxy.ts) and this page is the one place an unauthenticated
// visitor can see what we're building.
//
// Keep this page self-sufficient: no <Nav>, no <Footer>, and no
// outbound links. If you add a new section, make sure interactive
// elements degrade to non-interactive placeholders.

const categories: Array<{ label: string; icon: ReactNode }> = [
  {
    label: "Urns & vessels",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M18 6 C12 6 8 11 8 18 C8 25 12 30 18 30 C24 30 28 25 28 18 C28 11 24 6 18 6Z" stroke="var(--color-tr)" strokeWidth="1.5" fill="none" />
        <path d="M13 18 C13 14 15 11 18 11 C21 11 23 14 23 18" stroke="var(--color-tr)" strokeWidth="1.3" fill="none" />
        <line x1="18" y1="6" x2="18" y2="4" stroke="var(--color-tr)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Ash jewelry",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M18 8 L20 14 L26 14 L21 18 L23 24 L18 20 L13 24 L15 18 L10 14 L16 14 Z" stroke="var(--color-tr)" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Burial goods",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M11 8 C11 8 13 10 18 10 C23 10 25 8 25 8 L25 24 C25 27 22 29 18 29 C14 29 11 27 11 24 Z" stroke="var(--color-sg)" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    label: "Planning docs",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="8" y="6" width="20" height="24" rx="2" stroke="var(--color-tr)" strokeWidth="1.5" />
        <line x1="12" y1="13" x2="24" y2="13" stroke="var(--color-tr)" strokeWidth="1.2" />
        <line x1="12" y1="17" x2="24" y2="17" stroke="var(--color-tr)" strokeWidth="1.2" />
        <line x1="12" y1="21" x2="19" y2="21" stroke="var(--color-tr)" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    label: "Death doulas",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="14" cy="13" r="4.5" stroke="var(--color-sg)" strokeWidth="1.5" />
        <path d="M6 28 C6 23 9.5 20 14 20 C18.5 20 22 23 22 28" stroke="var(--color-sg)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M24 15 C24 15 27 13 29 16" stroke="var(--color-tr)" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Estate attorneys",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="10" y="10" width="16" height="16" rx="2" stroke="var(--color-sg)" strokeWidth="1.5" />
        <line x1="14" y1="16" x2="22" y2="16" stroke="var(--color-sg)" strokeWidth="1.2" />
        <line x1="14" y1="20" x2="20" y2="20" stroke="var(--color-sg)" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    label: "Death cleaning",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M10 28 L10 14 L18 8 L26 14 L26 28" stroke="var(--color-tr)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="14" y="20" width="8" height="8" stroke="var(--color-tr)" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    label: "Celebrants",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="10" stroke="var(--color-sg)" strokeWidth="1.5" fill="none" />
        <path d="M14 18 C14 15 16 13 18 13 C20 13 22 15 22 18" stroke="var(--color-sg)" strokeWidth="1.3" fill="none" />
        <line x1="18" y1="23" x2="18" y2="26" stroke="var(--color-sg)" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Books",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="9" y="6" width="12" height="22" rx="1.5" stroke="var(--color-tr)" strokeWidth="1.5" />
        <rect x="14" y="8" width="12" height="22" rx="1.5" stroke="var(--color-sg)" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    label: "Funeral homes",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M7 15 L18 8 L29 15" stroke="var(--color-tr)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="10" y1="16" x2="10" y2="26" stroke="var(--color-tr)" strokeWidth="1.3" />
        <line x1="15" y1="16" x2="15" y2="26" stroke="var(--color-tr)" strokeWidth="1.3" />
        <line x1="21" y1="16" x2="21" y2="26" stroke="var(--color-tr)" strokeWidth="1.3" />
        <line x1="26" y1="16" x2="26" y2="26" stroke="var(--color-tr)" strokeWidth="1.3" />
        <line x1="7" y1="27" x2="29" y2="27" stroke="var(--color-tr)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

// Soft "stepping-stones" timeline that replaces the old 2x2 quick-link
// grid: four life-stage moments as dots resting on a gentle sage wave, in
// the order a life moves through them. Inert on this preview page (see the
// "coming soon" note below) — purely illustrative, no links.
const helpStages = [
  { x: 60, y: 72, l1: "I'm planning", l2: "ahead" },
  { x: 180, y: 140, l1: "Someone is", l2: "dying" },
  { x: 300, y: 72, l1: "Someone", l2: "has died" },
  { x: 420, y: 140, l1: "I'm just", l2: "exploring" },
];

async function loadFeaturedVendors(): Promise<
  Array<{ vendor: VendorWithRating; services: Service[] }>
> {
  // Defensive fallback: if the DB is unreachable or unseeded the rest of
  // the teaser still renders cleanly without the "Support in your area"
  // section.
  try {
    const vendors = await getHomeFeaturedVendors();
    if (vendors.length === 0) return [];
    const services = await Promise.all(
      vendors.map((v) => getServices({ vendorId: v.id })),
    );
    return vendors.map((vendor, i) => ({ vendor, services: services[i] }));
  } catch {
    return [];
  }
}

export default async function PublicHomepage() {
  const featured = await loadFeaturedVendors();

  return (
    <div className="min-h-screen bg-white">
      <PreviewBanner />
      <StaticTopBar />

      {/* Hero */}
      <section className="bg-white px-10 pt-[3.5rem] pb-12 text-center">
        <p className="text-[13px] tracking-[.14em] uppercase text-tr mb-1.5">
          Welcome
        </p>
        <h1 className="font-serif italic text-[52px] font-light leading-[1.12] text-ch mb-5">
          Death is a part of life.
          <br />
          <span className="text-tr">Support should be easy to find.</span>
        </h1>
        <p className="text-[17px] text-cm max-w-[560px] mx-auto leading-[1.78] mb-8">
          Carefully curated end-of-life goods, services, and planning
          resources.
        </p>
        <StaticHeroSearch />
      </section>

      <WaveDivider topColor="var(--color-white)" bottomColor="var(--color-tr-vp)" />

      {/* Browse by category */}
      <section className="bg-tr-vp px-10 pt-12 pb-10">
        <Container width="wide">
          <SectionHeader
            eyebrow="Browse by category"
            title="What are you looking for?"
            subtitle="Goods by mail · Services by location"
            subtitleTone="ink"
          />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.label}
                className="bg-white border border-line rounded-[12px] py-[1.2rem] px-4 text-center"
              >
                <div className="w-10 h-10 mx-auto mb-2.5 flex items-center justify-center">
                  {cat.icon}
                </div>
                <div className="text-[14px] font-medium text-ch leading-tight">
                  {cat.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <WaveDivider topColor="var(--color-tr-vp)" bottomColor="var(--color-white)" />

      {featured.length > 0 && (
        <section className="bg-white px-10 pt-12 pb-12">
          <Container width="wide">
            <SectionHeader
              eyebrow="Find local services"
              eyebrowTone="sg"
              title="Support in your area"
              subtitle="Vetted providers · search by zip or city"
            />

            <div className="flex items-center gap-2.5 bg-white border border-line rounded-[8px] px-4 py-2.5 mb-6">
              <span className="text-[15px] text-cm flex-1">
                Showing results near:
              </span>
              <span className="font-sans text-[15px] text-tr font-medium">
                Boulder, CO 80301
              </span>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">
              {featured.map(({ vendor, services }) => (
                <StaticVendorCard
                  key={vendor.id}
                  vendor={vendor}
                  services={services}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      <WaveDivider topColor="var(--color-white)" bottomColor="var(--color-sg-p)" />

      {/* Survey CTA — the one intentionally-active link on this otherwise
          inert preview page. Tally form opens in a new tab so visitors
          keep their place on the teaser. */}
      <section className="bg-sg-p px-10 pt-12 pb-14">
        <Container width="narrow">
          <SectionHeader
            eyebrow="A small ask"
            eyebrowTone="sg"
            title="Help us get this right."
            subtitle="A short survey · about 5 minutes"
            subtitleTone="ink"
          />
          <p className="text-[17px] text-cm text-center leading-[1.78] mb-7 max-w-[520px] mx-auto">
            CodaCo is being shaped by the people who&apos;ll use it — those
            planning ahead, caring for someone dying, or grieving a recent
            loss, as well as practitioners and makers in the dying space.
            Your perspective directly influences what we build.
          </p>
          <div className="text-center">
            <a
              href="https://tally.so/r/kdkb6Z"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary btn-lg no-underline inline-flex"
            >
              Take the survey →
            </a>
          </div>
        </Container>
      </section>

      <StaticFooter />
    </div>
  );
}

function PreviewBanner() {
  return (
    <div className="bg-sg-p border-b border-sg-l text-center px-6 py-2.5">
      <p className="text-[14px] text-sg-d">
        Preview · CodaCo is in private development. Launching publicly later this year.
      </p>
    </div>
  );
}

function StaticTopBar() {
  return (
    <div className="bg-white border-b border-line px-10 h-[68px] flex items-center">
      <div className="flex items-center gap-[13px]">
        <Logo />
        <div>
          <div className="font-serif text-[30px] font-medium tracking-[.02em] leading-none">
            <span className="text-tr">Coda</span>
            <span className="text-sg">Co</span>
          </div>
          <div className="text-[12px] tracking-[.11em] uppercase text-cl mt-[3px] whitespace-nowrap">
            A curated marketplace for death and dying
          </div>
        </div>
      </div>
    </div>
  );
}

function StaticHeroSearch() {
  return (
    <>
      {/* Inert preview placeholders. Muted (neutral fill, soft text, no
          hover) so they read as "coming soon" rather than impersonating
          the live waitlist CTA below — the fake Search pill in particular
          used to mirror the terracotta of the real survey button. */}
      <div className="flex max-w-[500px] mx-auto mb-4">
        <div className="flex-1 px-5 py-3.5 border-[1.5px] border-r-0 border-line-strong rounded-l-[28px] bg-pl text-[16px] text-cl">
          Search goods, services, books…
        </div>
        <div className="bg-pl2 text-cl border-[1.5px] border-l-0 border-line-strong px-6 py-3.5 rounded-r-[28px] text-[15px] flex items-center">
          Search
        </div>
      </div>

      <div className="bg-sg-p border border-sg-l rounded-[12px] px-6 py-5 max-w-[500px] mx-auto">
        <p className="text-[16px] text-cm mb-3 text-center">
          How can we help you today?
        </p>
        <StaticHelpTimeline />
      </div>

      {/* Scopes the "coming soon" note to the search + quick-link
          placeholders above — named explicitly so it can't be misread as
          applying to the live button below. */}
      <p className="max-w-[500px] mx-auto mt-2.5 text-center text-[13px] uppercase tracking-[.1em] text-cl">
        Search &amp; browsing — coming soon at launch
      </p>

      {/* Active waitlist capture — like the survey CTA below, this is an
          intentional exception to the page's inert placeholders. Reuses
          the /launching dialog so the popup, DB write, and confirmation
          email are identical. The extra top gap and solid sage fill set
          it apart from the muted placeholders. */}
      <div className="max-w-[500px] mx-auto mt-6 text-center">
        <WaitlistDialog
          triggerLabel="Get notified when we launch"
          triggerClassName="btn-secondary btn-lg bg-sg-d hover:bg-sg w-full"
        />
      </div>
    </>
  );
}

// Illustrative-only timeline for the "How can we help you today?" box.
// Dots rest on a sage wave with the label hanging beneath each; the whole
// thing is decorative on this preview page (no links, no hover), matching
// the "coming soon" placeholders around it.
function StaticHelpTimeline() {
  return (
    <svg
      viewBox="0 0 480 200"
      className="w-full max-w-[440px] h-auto mx-auto block"
      role="img"
      aria-label="How can we help you today: I'm planning ahead, someone is dying, someone has died, or I'm just exploring."
    >
      <path
        d="M4,106 C24,72 40,72 60,72 S150,140 180,140 S270,72 300,72 S390,140 420,140 S460,106 476,106"
        fill="none"
        stroke="var(--color-sg)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      {helpStages.map((s) => (
        <g key={s.l2}>
          <circle cx={s.x} cy={s.y} r="11" fill="var(--color-sg)" opacity="0.2" />
          <circle cx={s.x} cy={s.y} r="6.5" fill="var(--color-sg)" />
          <text
            x={s.x}
            y={s.y + 30}
            fontSize="13"
            textAnchor="middle"
            fill="var(--color-ch)"
            className="font-semibold"
          >
            <tspan x={s.x} dy="0">
              {s.l1}
            </tspan>
            <tspan x={s.x} dy="15">
              {s.l2}
            </tspan>
          </text>
        </g>
      ))}
    </svg>
  );
}

function StaticVendorCard({
  vendor,
  services,
}: {
  vendor: VendorWithRating;
  services: Service[];
}) {
  const typeLabel =
    services.length === 0
      ? "Service provider"
      : serviceTypeLabel(services[0].serviceType);
  return (
    <Card hoverTone="none">
      <VendorPhoto
        src={vendor.photoSrc}
        alt={vendor.name}
        initials={vendor.initials}
        tone={vendor.photoTone}
        className="mb-3"
      />
      <div className="text-[16px] font-medium text-ch mb-[2px]">{vendor.name}</div>
      <div className="text-[12px] tracking-[.08em] uppercase text-cl mb-[7px]">
        {typeLabel}
      </div>
      <div className="text-[14px] text-cm mb-[5px]">
        {vendorLocationSuffix(vendor, services.map((s) => s.locationType))}
      </div>
      <Stars
        rating={vendor.rating}
        reviewCount={vendor.reviewCount}
        className="text-[14px]"
      />
    </Card>
  );
}

function StaticFooter() {
  return (
    <footer className="bg-ch font-sans arc-top">
      <Container width="mid" className="px-10 pt-12 pb-10 text-center">
        <div className="font-serif text-[32px] font-medium leading-none mb-3">
          <span className="text-tr">Coda</span>
          <span className="text-sg">Co</span>
        </div>
        <p className="text-[15px] text-cl leading-relaxed max-w-[420px] mx-auto mb-6">
          A curated marketplace for death and dying. Based in the US.
          Launching publicly later this year.
        </p>
        <p className="text-[14px] text-cl">
          © {new Date().getFullYear()} CodaCo, Inc. · Made with intention.
        </p>
      </Container>
    </footer>
  );
}
