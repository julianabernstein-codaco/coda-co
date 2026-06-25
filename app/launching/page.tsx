import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { WaitlistForm } from "./WaitlistForm";

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

          {/* The launch announcement is the hero — large, then the two
              cities immediately beneath it. */}
          <h1 className="font-serif text-[46px] sm:text-[64px] font-light leading-[1.02] text-tr mb-4">
            Launching soon
          </h1>

          {/* Launch-city badges — sit directly under the announcement. */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
            {launchCities.map(({ city, state }) => (
              <span
                key={city}
                className="inline-flex items-center gap-1.5 bg-white border border-tr-l rounded-pill pl-3 pr-4 py-2 text-[14px] font-medium text-ch"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 22s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12Z"
                    stroke="var(--color-tr)"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="2.4" stroke="var(--color-tr)" strokeWidth="1.8" />
                </svg>
                {city}, {state}
              </span>
            ))}
          </div>

          <p className="font-serif italic text-[22px] sm:text-[26px] font-light leading-[1.25] text-ch mb-5">
            Death is a part of life.{" "}
            <span className="text-tr not-italic">Support should be easy to find.</span>
          </p>

          <p className="text-[15px] text-cm max-w-[520px] mx-auto leading-[1.78]">
            CodaCo is a carefully curated marketplace for end-of-life goods,
            services, and planning resources — bringing trusted makers and
            providers together in one calm, considered place. We&apos;re opening
            first in Boulder and Portland. Be the first to know.
          </p>
        </Container>
      </section>

      <WaveDivider topColor="var(--color-pl)" bottomColor="var(--color-tr-vp)" />

      {/* Signup */}
      <section className="bg-tr-vp px-6 pt-12 pb-14">
        <Container width="narrow">
          <div className="max-w-[480px] mx-auto">
            <div className="text-center mb-6">
              <h2 className="font-serif text-[26px] font-light text-ink mb-1.5">
                Get notified at launch
              </h2>
              <p className="text-[14px] text-ink/80 leading-relaxed">
                Tell us how you&apos;d like to take part, and we&apos;ll send a
                single note the day we open.
              </p>
            </div>
            <WaitlistForm />
          </div>
        </Container>
      </section>

      <WaveDivider topColor="var(--color-tr-vp)" bottomColor="var(--color-white)" />

      {/* What you'll find */}
      <section className="bg-white px-6 pt-12 pb-14 text-center">
        <Container width="narrow">
          <p className="text-overline text-sg-d mb-3">What you&apos;ll find</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
            {previewCategories.map((label) => (
              <span
                key={label}
                className="bg-pl2 border border-line rounded-pill px-4 py-2 text-[13px] text-cm"
              >
                {label}
              </span>
            ))}
          </div>
          <p className="text-[14px] text-cl max-w-[440px] mx-auto leading-relaxed">
            From planning ahead to a recent loss — thoughtful goods and vetted
            local support, gathered with care.
          </p>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-ch font-sans arc-top">
        <Container width="mid" className="px-6 pt-12 pb-10 text-center">
          <div className="font-serif text-[30px] font-medium leading-none mb-3">
            <span className="text-tr">Coda</span>
            <span className="text-sg">Co</span>
          </div>
          <p className="text-[13px] text-cl leading-relaxed max-w-[420px] mx-auto mb-5">
            A curated marketplace for death and dying. Launching soon in
            Boulder, CO &amp; Portland, OR.
          </p>
          <p className="text-[12px] text-cl">
            © {new Date().getFullYear()} CodaCo, Inc. · Made with intention.
          </p>
        </Container>
      </footer>
    </div>
  );
}
