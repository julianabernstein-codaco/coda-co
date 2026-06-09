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
              burial at sea is available at the{" "}
              <a
                href="https://www.epa.gov/ocean-dumping/burial-sea"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tr hover:underline"
              >
                EPA website
              </a>
              .
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
      {
        q: "What are the rules around funerals where I live?",
        a: (
          <div className="space-y-3">
            <p>
              While laws around the transport and disposition of human bodies
              varies by state, there is a federal Funeral Rule in place to
              protect the consumer who is planning and paying for a funeral.
              These rules exist to protect people from unfair upselling and
              unclear pricing structures at a funeral home and are enforced by
              the Federal Trade Commission. The Funeral Rule makes it possible
              for you to choose only the goods and services from a funeral home
              that you want or need. The rule allows you to compare prices
              between funeral homes and makes it possible to select arrangements
              you want to use for a home funeral. In short, you do not have to
              buy a package, and you do not have to use a funeral home if you
              prefer a home funeral.
            </p>
            <p>The US Funeral Rule gives you the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium text-ch">
                  Buy only the funeral arrangements you want.
                </span>{" "}
                You have a protected right to buy separate goods (such as
                caskets) and services (such as embalming or a memorial service).
                You do not have to accept a package that includes any items you
                do not want.
              </li>
              <li>
                <span className="font-medium text-ch">
                  Hear price information over the telephone.
                </span>{" "}
                Funeral directors are required to give you pricing information
                over the telephone if you ask for it, and you do not need to
                give them your name, telephone number or address first. Some
                funeral homes will mail their price lists, and some post them
                online.
              </li>
              <li>
                <span className="font-medium text-ch">
                  Receive a written, itemized price list when you visit a
                  funeral home.
                </span>{" "}
                The funeral home must give you a General Price List that is yours
                to keep. It lists all the items and services the home offers, and
                the cost of each one.
              </li>
              <li>
                <span className="font-medium text-ch">
                  See a written casket price list before you see the actual
                  caskets.
                </span>{" "}
                It can be overwhelming to shop for a casket. Funerals must
                provide you a written casket price list if you ask, and this is a
                great place to start &ndash; you can see this list before you see
                the caskets. You can also ask about lower-priced caskets that are
                listed but may not be on display.
              </li>
              <li>
                <span className="font-medium text-ch">
                  Get a price list for outer burial containers.
                </span>{" "}
                Outer burial containers, such as concrete vaults lining a grave,
                are not required by state law anywhere in the U.S., but many
                cemeteries require them to prevent the grave from caving in
                during a funeral or after the ground settles. If the funeral home
                sells containers, but doesn&apos;t list their prices on the
                general price list, you have the right to look at a separate
                container price list before you see the containers. If you
                don&apos;t see the lower-priced containers listed, ask about
                them.
              </li>
              <li>
                <span className="font-medium text-ch">
                  Receive a written statement after you decide what you want, and
                  before you pay.
                </span>{" "}
                This statement should show exactly what you are buying and the
                cost of each individual item. The funeral home is required to
                give you this once you have made your selection and before paying
                for items.
              </li>
              <li>
                <span className="font-medium text-ch">
                  If you choose cremation for your loved one, you do not need to
                  buy a casket.
                </span>{" "}
                You may use an alternative container. No state or local law
                requires the use of a casket for cremation. If a funeral home
                offers cremation, it must also tell you that alternative
                containers are available. They may be out of unfinished wood,
                fiberboard or cardboard.
              </li>
              <li>
                <span className="font-medium text-ch">
                  You may provide the funeral home with a casket or urn you buy
                  elsewhere.
                </span>{" "}
                The funeral provider cannot refuse to handle a casket or urn you
                bought somewhere else, or charge you a fee to use it. You may
                order a casket or urn to be delivered to the funeral home and the
                home cannot require you to be there when the casket or urn is
                delivered to them.
              </li>
              <li>
                <span className="font-medium text-ch">
                  Embalming is never required.
                </span>{" "}
                No state law requires embalming for every death. Some states
                require embalming or refrigeration if the body is not buried or
                cremated within a certain time; some states don&apos;t require it
                at all. In most cases, refrigeration or other cooling is an
                acceptable alternative. In addition, you may choose services like
                direct cremation and immediate burial, which don&apos;t require
                any form of preservation. Many funeral homes have a policy
                requiring embalming if the body is to be publicly viewed, but
                this is not required by law in most states. Ask if the funeral
                home offers private family viewing without embalming. If some
                form of preservation is a practical necessity, ask the funeral
                home if refrigeration is available.
              </li>
            </ul>
            <p className="text-cl">
              Source:{" "}
              <a
                href="https://consumer.ftc.gov/articles/ftc-funeral-rule"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tr hover:underline"
              >
                Federal Trade Commission Advice: The Funeral Rule
              </a>
            </p>
          </div>
        ),
        searchText:
          "What are the rules around funerals where I live? Laws around transport and disposition of human bodies vary by state, but there is a federal Funeral Rule enforced by the Federal Trade Commission to protect consumers from unfair upselling and unclear pricing at a funeral home. You do not have to buy a package or use a funeral home if you prefer a home funeral. The US Funeral Rule gives you the right to: buy only the funeral arrangements you want; hear price information over the telephone; receive a written itemized General Price List when you visit a funeral home; see a written casket price list before you see the actual caskets; get a price list for outer burial containers and concrete vaults; receive a written statement before you pay; choose cremation without buying a casket and use an alternative container of unfinished wood, fiberboard or cardboard; provide the funeral home with a casket or urn you buy elsewhere without a fee. Embalming is never required; refrigeration is often an acceptable alternative; direct cremation and immediate burial require no preservation. Source: Federal Trade Commission Advice The Funeral Rule.",
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
