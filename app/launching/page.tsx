import type { Metadata } from "next";
import { Fragment } from "react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { WaitlistDialog } from "./WaitlistDialog";

// Public, shareable "launching soon" teaser for social media. Unlike the
// rest of the site (and the /homepage marketing teaser), this page is
// intentionally indexable + carries OpenGraph/Twitter metadata so a
// shared link renders a rich, eyecatching preview. It's allowlisted past
// the preview-password gate in proxy.ts and renders its own chrome
// (CHROMELESS_PATHS in app/layout.tsx) — keep it self-sufficient: no
// <Nav>, no <Footer>, no outbound links to the gated app.

const TITLE = "CodaCo is launching soon in Boulder & Portland";
const DESCRIPTION =
  "A curated marketplace for death and dying — thoughtful goods, vetted services, and planning resources. Launching soon in Boulder, CO & Portland, OR. Join the list for early access.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Deliberately indexable — this is the one public page built to be
  // found and shared while the marketplace itself stays in private dev.
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "CodaCo",
    type: "website",
    url: "/launching",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const launchCities = [
  { city: "Boulder", state: "CO" },
  { city: "Portland", state: "OR" },
];

const previewCategories = [
  "Urns & vessels",
  "Death doulas",
  "Green burial",
  "Celebrants",
  "Ash jewelry",
  "Planning docs",
  "Grief counselors",
  "Event planners",
  "Death cafés",
  "Keepsake items",
];

export default function LaunchingPage() {
  return (
    <div className="min-h-screen bg-pl">
      {/* Hero */}
      <section className="px-6 pt-12 pb-14 sm:pt-16 text-center">
        <Container width="narrow">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <Logo />
            <span className="font-serif text-[30px] font-medium tracking-[.02em] leading-none">
              <span className="text-tr">Coda</span>
              <span className="text-sg">Co</span>
            </span>
          </div>

          {/* Announcement kicker — small, letter-spaced, flanked by hairlines. */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-9 bg-tr-l" aria-hidden="true" />
            <span className="text-[12px] sm:text-[13px] tracking-[.26em] uppercase font-semibold text-tr">
              Launching soon
            </span>
            <span className="h-px w-9 bg-tr-l" aria-hidden="true" />
          </div>

          {/* The two launch cities are the visual hero. */}
          <h1 className="font-serif font-light leading-[1.04] mb-4">
            <span className="block text-[20px] sm:text-[24px] italic text-cm mb-1.5">
              in
            </span>
            <span className="block text-[42px] sm:text-[58px] text-ch">
              Boulder <span className="text-sg italic font-normal">&amp;</span> Portland
            </span>
          </h1>

          {/* State + pin, kept as a quiet caption under the city names. */}
          <p className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[13px] sm:text-[14px] text-cm mb-8">
            {launchCities.map(({ city, state }, i) => (
              <Fragment key={city}>
                {i > 0 && (
                  <span className="text-cl" aria-hidden="true">
                    ·
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <LocationPin />
                  {city}, {state}
                </span>
              </Fragment>
            ))}
          </p>

          <p className="font-serif italic text-[21px] sm:text-[25px] font-light leading-[1.3] text-ch mb-5">
            Death is a part of life.{" "}
            <span className="text-tr not-italic">Support should be easy to find.</span>
          </p>

          <p className="text-[15px] text-cm max-w-[520px] mx-auto leading-[1.78]">
            CodaCo is a carefully curated marketplace for end-of-life goods,
            services, and planning resources — bringing trusted makers and
            providers together in one calm, considered place. We&apos;re opening
            first in Boulder and Portland.
          </p>
        </Container>
      </section>

      <WaveDivider topColor="var(--color-pl)" bottomColor="var(--color-tr-vp)" />

      {/* What you'll find — in the terracotta banner */}
      <section className="bg-tr-vp px-6 pt-5 pb-14 text-center">
        <Container width="narrow">
          <p className="text-overline text-sg-d mb-3">What you&apos;ll find</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
            {previewCategories.map((label) => (
              <span
                key={label}
                className="bg-white border border-line rounded-pill px-4 py-2 text-[13px] text-cm"
              >
                {label}
              </span>
            ))}
          </div>
          <p className="text-[14px] text-ink/75 max-w-[440px] mx-auto leading-relaxed">
            From planning ahead to a recent loss — thoughtful goods and vetted
            local support, gathered with care.
          </p>

          {/* "Learn more" (survey, new tab) sits just above the signup
              CTA, which opens in a modal. */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <a
              href="https://tally.so/r/kdkb6Z"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost btn-lg no-underline bg-white border-line text-ch hover:text-ch hover:bg-pl2 hover:border-line"
            >
              Learn more
            </a>
            <WaitlistDialog />
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-ch font-sans arc-top">
        <Container width="mid" className="px-6 pt-12 pb-10 text-center">
          <div className="font-serif text-[30px] font-medium leading-none mb-3">
            <span className="text-tr">Coda</span>
            <span className="text-sg">Co</span>
          </div>
          <p className="text-[13px] text-cl leading-relaxed max-w-[420px] mx-auto mb-2">
            A curated marketplace for death and dying.
          </p>
          <p className="text-[13px] text-sg-vp leading-relaxed mb-5">
            Launching soon in Boulder, CO &amp; Portland, OR.
          </p>
          <p className="text-[12px] text-cl">
            © {new Date().getFullYear()} CodaCo, Inc. · Made with intention.
          </p>
        </Container>
      </footer>
    </div>
  );
}

function LocationPin() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 22s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12Z"
        stroke="var(--color-tr)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.4" stroke="var(--color-tr)" strokeWidth="1.8" />
    </svg>
  );
}
