import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FaqBrowser, type FaqCategory } from "@/components/faq/FaqBrowser";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Help & FAQ — CodaCo",
  description:
    "Whether you are feeling overwhelmed or have a specific question, find answers about buying goods, booking services, and using CodaCo.",
};

const categories: FaqCategory[] = [
  {
    heading: "Getting started",
    faqs: [
      {
        q: "What is CodaCo?",
        a: "CodaCo is a curated marketplace for death and dying. We bring together thoughtfully vetted goods — urns, ash jewelry, burial shrouds, planning workbooks, memorial art — alongside local services like death doulas, estate attorneys, celebrants, and death cleaners, so you can find what you need in one calm place.",
      },
      {
        q: "I'm feeling overwhelmed. Where should I begin?",
        a: (
          <>
            Start wherever feels manageable. If someone has recently died, our{" "}
            <Link href="/where-to-start" className="text-tr hover:underline">
              Where to Start guide
            </Link>{" "}
            walks you gently through what kind of support may be available near
            you and the order things tend to happen. If you&apos;re planning
            ahead or just exploring, browsing the shop or services pages is a
            low-pressure way to get oriented.
          </>
        ),
        searchText:
          "Start wherever feels manageable. If someone has recently died, our Where to Start guide walks you gently through what kind of support may be available near you and the order things tend to happen. If you're planning ahead or just exploring, browsing the shop or services pages is a low-pressure way to get oriented.",
      },
      {
        q: "Do I need an account to browse?",
        a: "No. You can browse goods, services, and resources freely without an account. You'll only be asked to sign in when you want to save a cart, contact a vendor, or place an order.",
      },
    ],
  },
  {
    heading: "Buying goods",
    faqs: [
      {
        q: "How do I buy something?",
        a: "Add items to your cart from any product page, then check out when you're ready. Each listing shows available options — size, material, engraving — and shipping or local-pickup details before you commit.",
      },
      {
        q: "Are the makers and products vetted?",
        a: "Yes. Every vendor on CodaCo is reviewed before they can list, and we curate for quality, care, and relevance to death and dying. Verified reviews from real buyers help you judge each maker for yourself.",
      },
      {
        q: "What are your shipping and return policies?",
        a: "Shipping options and timelines are set by each maker and shown on the product page. Because many items are handmade or personalized, return policies vary by vendor — check the listing, and reach out to the maker directly with any questions before ordering.",
      },
    ],
  },
  {
    heading: "Booking services",
    faqs: [
      {
        q: "How do I find a service provider near me?",
        a: "On the services pages you can search by your zip code and filter by the type of help you need — death doula, estate attorney, celebrant, end-of-life organizer, and more. Providers who serve your area (or work virtually) will appear with their location and distance.",
      },
      {
        q: "What's a death doula, and is that where I should start?",
        a: "A death doula offers non-medical emotional, practical, and spiritual support to a dying person and their loved ones. They're often a good first call because they can help you understand what else you might need and who to contact next.",
      },
      {
        q: "How do I contact a provider?",
        a: "Each provider has a public profile with a contact option. Sign in, send a message describing your situation, and the provider will follow up directly to discuss availability, approach, and fees.",
      },
    ],
  },
  {
    heading: "Trust & safety",
    faqs: [
      {
        q: "How are vendors and providers vetted?",
        a: "Every listing is reviewed before it goes live, typically within one to two business days. Service providers may be asked for credentials or verification documents — certified doulas, licensed attorneys, and the like — so you can engage with confidence.",
      },
      {
        q: "Is my information private?",
        a: "Privacy is a default, not an add-on. Your searches are never stored or sold, and we don't share your information with third parties. You decide when to reach out to a vendor or provider.",
      },
      {
        q: "Can I trust the reviews?",
        a: "Reviews on CodaCo come from verified clients and buyers who have actually worked with a vendor or purchased an item. They're there to help you make a grounded decision.",
      },
    ],
  },
  {
    heading: "Selling on CodaCo",
    faqs: [
      {
        q: "Can I list my own goods or services?",
        a: "Yes — makers, artists, and practitioners are welcome. Our List with us page explains how to create a profile, what we look for, and how approval works.",
      },
      {
        q: "Is there a fee to list?",
        a: "Plans start free with up to three listings. Paid plans add unlimited listings and featured placement, and a small transaction fee applies on goods sales. Full details are on the List with us page.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <Breadcrumb
        crumbs={[{ label: "Home", href: "/" }, { label: "Help & FAQ" }]}
      />

      {/* Hero — welcome + framing */}
      <section className="bg-white px-10 pt-16 pb-10 text-center">
        <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-3">
          Help &amp; FAQ
        </p>
        <h1 className="font-serif text-[46px] font-light leading-[1.13] text-ch mb-4">
          How can we <em className="italic text-tr">help?</em>
        </h1>
        <p className="text-[15px] text-cm max-w-[560px] mx-auto leading-[1.75]">
          Whether you are feeling completely overwhelmed or have a specific
          question, this section is designed to help. Use our search bar or
          browse common questions below.
        </p>
      </section>

      {/* Search + browse */}
      <section className="bg-pl px-10 pt-10 pb-16">
        <Container width="narrow">
          <FaqBrowser categories={categories} />

          <p className="text-center text-[13px] text-cl leading-[1.7] mt-12">
            Still have a question?{" "}
            <Link href="/where-to-start" className="text-tr hover:underline">
              See where to start
            </Link>{" "}
            or reach out to a provider directly from their profile.
          </p>
        </Container>
      </section>
    </>
  );
}
