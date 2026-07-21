import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FaqList } from "@/components/list-with-us/FaqList";
import { Avatar } from "@/components/ui/Avatar";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "List with us — CodaCo",
  description:
    "Join CodaCo's curated marketplace for death and dying. Reach clients who are ready.",
};

const howItWorks = [
  { n: 1, title: "Create your profile", desc: "Set up a shop or service profile with photos and pricing" },
  { n: 2, title: "List goods or services", desc: "Add products with shipping options or services with area" },
  { n: 3, title: "Connect with clients", desc: "Receive inquiries, manage orders, build reviews" },
];

const whyItems = [
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="14" stroke="#C1634F" strokeWidth="1.5" fill="none" />
        <path d="M12 18 L16 22 L24 14" stroke="#C1634F" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Curated audience",
    body: "Every visitor is here intentionally — actively seeking goods and services related to death and dying.",
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="6" y="6" width="24" height="24" rx="4" stroke="#7A9E82" strokeWidth="1.5" fill="none" />
        <line x1="11" y1="13" x2="25" y2="13" stroke="#7A9E82" strokeWidth="1.2" />
        <line x1="11" y1="18" x2="25" y2="18" stroke="#7A9E82" strokeWidth="1.2" />
        <line x1="11" y1="23" x2="19" y2="23" stroke="#7A9E82" strokeWidth="1.2" />
      </svg>
    ),
    title: "Simple setup",
    body: "Create a profile, list your offerings, and start receiving inquiries — typically within 24 hours of approval.",
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path
          d="M18 4 L21 12 L30 12.5 L23.5 18.5 L25.5 28 L18 23.5 L10.5 28 L12.5 18.5 L6 12.5 L15 12 Z"
          stroke="#C1634F"
          strokeWidth="1.4"
          fill="none"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Trusted reviews",
    body: "Verified reviews from real clients help you build a reputation and give buyers confidence.",
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="12" stroke="#7A9E82" strokeWidth="1.5" fill="none" />
        <path
          d="M14 18 L18 12 L22 18 L18 24 Z"
          stroke="#7A9E82"
          strokeWidth="1.3"
          fill="none"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Fair, transparent fees",
    body: "Start with a free 3-month trial, then one simple flat rate — no hidden fees.",
  },
];

const pricingFeatures = [
  "Be discovered by local customers",
  "Accept direct payments from clients",
  "Message with customers directly",
  "Collect verified reviews",
];

const testimonials = [
  {
    quote:
      '"CodaCo brought me clients who truly understood the value of handmade work. My first week, I had three orders."',
    name: "Nora Hayashi",
    role: "Earthen Studio, Portland OR",
    initials: "NH",
  },
  {
    quote:
      '"As a death doula, finding clients used to rely entirely on word of mouth. CodaCo changed that. My calendar filled within a month."',
    name: "Maria Rosales, CEND",
    role: "Brooklyn, NY",
    initials: "MR",
  },
  {
    quote:
      '"The platform is thoughtfully built — it feels right for this kind of work. I\'m proud to have my practice listed here."',
    name: "James Thornton, Esq.",
    role: "Estate Attorney, Manhattan NY",
    initials: "JT",
  },
];

const faqs = [
  {
    q: "Is there a fee to list on CodaCo?",
    a: "Both goods sellers and service providers start with a free 3-month trial, then choose a $29/month or $320/year subscription. No per-sale transaction fee.",
  },
  {
    q: "How long does approval take?",
    a: "We review all listings within 1–2 business days. Service providers may be asked to provide credentials or verification documents.",
  },
  {
    q: "Who can list on CodaCo?",
    a: "Any US-based individual or business offering goods or services related to death and dying — makers, artists, estate professionals, certified doulas, celebrants, organizers, attorneys, and more.",
  },
  {
    q: "Can I list both goods and services?",
    a: "Yes — you can manage both from a single vendor account. Your profile will display both your goods shop and your service listing.",
  },
];

export default function ListWithUsPage() {
  return (
    <>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "List with us" }]} />

      {/* Hero */}
      <section className="bg-white px-10 pt-16 pb-12 text-center">
        <p className="text-[13px] tracking-[.14em] uppercase text-tr mb-3">
          For vendors &amp; service providers
        </p>
        <h1 className="font-serif text-[46px] font-light leading-[1.13] text-ch mb-4">
          Reach people who are{" "}
          <em className="italic text-tr">ready.</em>
        </h1>
        <p className="text-[17px] text-cm max-w-[520px] mx-auto mb-10 leading-[1.75]">
          CodaCo connects you with clients who are actively seeking support around death and dying —
          whether that&apos;s a handmade urn, an estate attorney, or a compassionate death doula. Join
          a curated community built with care.
        </p>

        {/* Type cards */}
        <div className="grid grid-cols-2 gap-4 max-w-[620px] mx-auto">
          <Link
            href="/list-with-us/goods"
            className="bg-white border-2 border-line-strong rounded-[12px] py-7 px-6 text-center no-underline cursor-pointer transition-colors hover:border-tr-l hover:bg-tr-vp"
          >
            <div className="w-[54px] h-[54px] mx-auto mb-4 flex items-center justify-center">
              <svg width="50" height="50" viewBox="0 0 60 60" fill="none">
                <path
                  d="M30 8 C18 8 10 20 10 35 C10 48 18 56 30 56 C42 56 50 48 50 35 C50 20 42 8 30 8Z"
                  stroke="#C1634F"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M20 35 C20 26 24 20 30 20 C36 20 40 26 40 35"
                  stroke="#C1634F"
                  strokeWidth="1.7"
                  fill="none"
                />
              </svg>
            </div>
            <div className="font-serif text-[22px] font-normal text-ch mb-1.5">
              List goods
            </div>
            <p className="text-[15px] text-cl leading-[1.5]">
              Urns, jewelry, shrouds, planning workbooks, memorial art, humor gifts — anything
              shipped or available locally
            </p>
          </Link>

          <Link
            href="/list-with-us/services"
            className="bg-white border-2 border-line-strong rounded-[12px] py-7 px-6 text-center no-underline cursor-pointer transition-colors hover:border-tr-l hover:bg-tr-vp"
          >
            <div className="w-[54px] h-[54px] mx-auto mb-4 flex items-center justify-center">
              <svg width="50" height="50" viewBox="0 0 60 60" fill="none">
                <circle cx="24" cy="20" r="9" stroke="#7A9E82" strokeWidth="2" />
                <path
                  d="M8 52 C8 42 15 37 24 37 C33 37 40 42 40 52"
                  stroke="#7A9E82"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M40 22 C40 22 44 20 48 24 C50 27 48 32 44 30"
                  stroke="#C1634F"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
            <div className="font-serif text-[22px] font-normal text-ch mb-1.5">
              List services
            </div>
            <p className="text-[15px] text-cl leading-[1.5]">
              Death doulas, estate attorneys, death cleaning, celebrants, EOL organizers — found by
              geographic location
            </p>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white px-10 pt-2 pb-12">
        <Container width="narrow">
          <SectionHeader eyebrow="How it works" title="Three steps to get started" />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 mb-8">
            {howItWorks.map((s) => (
              <div
                key={s.n}
                className="bg-white rounded-[10px] py-5 px-4 text-center border border-line"
              >
                <div className="w-[30px] h-[30px] rounded-full bg-tr text-white text-[15px] font-medium flex items-center justify-center mx-auto mb-2.5">
                  {s.n}
                </div>
                <div className="text-[15px] font-medium text-ch mb-0.5">
                  {s.title}
                </div>
                <div className="text-[14px] text-cl leading-[1.45]">
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3.5 justify-center flex-wrap">
            <Link
              href="/list-with-us/goods"
              className="inline-block bg-tr text-white px-[30px] py-3.5 rounded-[26px] text-[16px] no-underline hover:bg-tr-d transition-colors"
            >
              List goods →
            </Link>
            <Link
              href="/list-with-us/services"
              className="inline-block bg-transparent text-ch border-[1.5px] border-[rgba(44,40,37,.25)] px-[26px] py-3 rounded-[26px] text-[15px] no-underline hover:border-tr hover:text-tr transition-colors"
            >
              List services
            </Link>
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section className="bg-white px-10 pt-2 pb-14">
        <Container width="narrow">
          <SectionHeader
            eyebrow="Simple pricing"
            title="Start free. Grow with us."
            subtitle="Know exactly what you get and what it costs — before you sign up."
          />
          <div className="max-w-[540px] mx-auto bg-white border-2 border-tr-l rounded-[14px] overflow-hidden">
            {/* Free trial banner */}
            <div className="bg-tr-vp px-8 py-7 text-center border-b border-line">
              <p className="text-[13px] tracking-[.14em] uppercase text-tr mb-2">
                3 months free
              </p>
              <h3 className="font-serif text-[26px] font-light text-ch mb-2">
                Try everything, free for 3 months
              </h3>
              <p className="text-[15px] text-cm leading-[1.6]">
                Explore every CodaCo feature and reach your target market. Cancel anytime.
              </p>
            </div>

            {/* Price + what's included */}
            <div className="px-8 py-7">
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="font-serif text-[40px] font-light text-ch leading-none">$29</span>
                  <span className="text-[16px] text-cl">/ month</span>
                </div>
                <p className="text-[14px] text-cl mt-1.5">
                  or $320 a year — save $28
                </p>
              </div>

              <p className="text-[13px] tracking-[.1em] uppercase text-cl text-center mb-4">
                Everything included
              </p>
              <ul className="max-w-[320px] mx-auto flex flex-col gap-3">
                {pricingFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="shrink-0">
                      <circle cx="11" cy="11" r="10" stroke="#C1634F" strokeWidth="1.3" fill="none" />
                      <path
                        d="M7 11 L10 14 L15 8"
                        stroke="#C1634F"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[15px] text-ch">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Why CodaCo */}
      <section className="bg-tr-vp px-10 py-14">
        <Container width="mid">
          <SectionHeader
            eyebrow="Why CodaCo"
            title="Built for this work, by people who understand it"
            className="mb-8"
          />
          <div className="grid-auto-200">
            {whyItems.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-[10px] p-5 border border-line"
              >
                <div className="mb-3">{item.icon}</div>
                <div className="text-[16px] font-medium text-ch mb-1">{item.title}</div>
                <p className="text-[15px] text-cl leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="bg-white px-10 py-14">
        <Container width="mid">
          <SectionHeader
            eyebrow="From our vendors"
            eyebrowTone="sg"
            title="What sellers are saying"
            className="mb-8"
          />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-sg-vp rounded-[10px] p-5 border border-[rgba(122,158,130,.15)]"
              >
                <p className="font-serif text-[16px] font-light text-ch leading-[1.7] italic mb-4">
                  {t.quote}
                </p>
                <div className="flex items-center gap-2.5">
                  <Avatar initials={t.initials} size="sm" />
                  <div>
                    <div className="text-[15px] font-medium text-ch">{t.name}</div>
                    <div className="text-[13px] text-cl">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-sg-vp px-10 py-12">
        <Container width="narrow">
          <SectionHeader
            eyebrow="FAQ"
            eyebrowTone="sg"
            title="Common questions"
            className="mb-8"
          />
          <FaqList faqs={faqs} />
        </Container>
      </section>
    </>
  );
}
