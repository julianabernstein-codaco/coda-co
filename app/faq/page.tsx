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
    heading: "Funerals & body disposition",
    faqs: [
      {
        q: "What choices do I have for body disposition (e.g. burial, cremation, natural burial)?",
        a: (
          <div className="space-y-3">
            <p>
              There are many ways to lay a body to rest. Here is a brief
              explanation about the most common types of body disposition:
            </p>
            <p>
              <span className="font-medium text-ch">
                Green Burial (also called Natural Burial):
              </span>{" "}
              This is a popular alternative to &lsquo;traditional burial.&rsquo;
              In a green burial, a body is placed in its natural state (no
              embalming) into a biodegradable casket or natural fiber shroud.
              The body is then placed directly into the earth, allowing it to
              decompose naturally. Green burials are legal in all 50 US states,
              though there are some regulations around where they can take
              place. Many states have green burial cemeteries or &lsquo;hybrid&rsquo;
              cemeteries which offer both traditional and green burials.
            </p>
            <p>
              <span className="font-medium text-ch">Traditional Burial:</span>{" "}
              A traditional burial may include embalming (where blood is drained
              from a body and replaced with formaldehyde or other chemicals for
              preservation), a casket (wooden, metal, other) and a grave is
              generally lined with concrete (forming the burial vault) before
              the body is laid to rest. Temporarily delays decomposition,
              keeping the body intact for several days or up to a week.
            </p>
            <p>
              <span className="font-medium text-ch">Burial at Sea:</span> A
              loved one&apos;s body or their cremated remains can be buried at
              sea. This form of burial is regulated by the Environmental
              Protection Agency and must take place at least three nautical
              miles from shore. There are several rules around body and casket
              preparation for burial at sea, and the EPA must be notified of a
              burial within 30 days following the event. More information about
              burial at sea is available at the EPA website.
            </p>
            <p>
              <span className="font-medium text-ch">Traditional Cremation:</span>{" "}
              In traditional cremation, a body is incinerated (burned) and the
              remaining bone fragments are crushed into ashes. Ashes can then be
              returned to loved ones to be buried, kept in an urn, and/or
              scattered in a beloved location.
            </p>
            <p>
              <span className="font-medium text-ch">
                Natural Organic Reduction (also called Terramation):
              </span>{" "}
              Terramation is a process that allows for natural decomposition in
              urban areas, where green cemeteries and natural burial may not be
              readily available. In this process, bodies are laid to rest within
              a closed vessel along with organic material (such as straw,
              alfalfa and wood chips) to transform into nutrient-rich soil over
              several weeks. The soil can then be returned to loved ones to be
              used in plantings or to regenerate conservation areas.
            </p>
            <p>
              <span className="font-medium text-ch">
                Aquamation (also called Water Cremation):
              </span>{" "}
              Aquamation is a process that uses water and an alkaline solution
              to break down a body. This process leaves only bone fragments. As
              in fire cremation, these fragments can then be crushed into ashes
              and returned to a loved one.
            </p>
            <p>
              <span className="font-medium text-ch">Anatomical donation:</span>{" "}
              Some people choose (before death) to donate their body to science.
              Bodies may go to universities, medical schools, or research
              organizations for scientific study and medical training. Most
              programs will cover the costs of transportation, cremation after
              study, and the return of ashes to the family.
            </p>
          </div>
        ),
        searchText:
          "There are many ways to lay a body to rest. Green Burial Natural Burial is a popular alternative to traditional burial. In a green burial, a body is placed in its natural state (no embalming) into a biodegradable casket or natural fiber shroud. The body is then placed directly into the earth, allowing it to decompose naturally. Green burials are legal in all 50 US states. Many states have green burial cemeteries or hybrid cemeteries. Traditional Burial may include embalming, a casket, and a concrete-lined grave forming the burial vault. Burial at Sea: a body or cremated remains can be buried at sea, regulated by the Environmental Protection Agency at least three nautical miles from shore, EPA notified within 30 days. Traditional Cremation: a body is incinerated and bone fragments crushed into ashes, buried, kept in an urn, or scattered. Natural Organic Reduction Terramation allows natural decomposition in urban areas, bodies laid in a closed vessel with straw alfalfa wood chips to transform into nutrient-rich soil. Aquamation Water Cremation uses water and an alkaline solution to break down a body, leaving bone fragments crushed into ashes. Anatomical donation: donate your body to science, universities, medical schools, or research organizations.",
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
