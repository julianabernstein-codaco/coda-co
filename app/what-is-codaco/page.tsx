import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WaveDivider } from "@/components/ui/WaveDivider";

export const metadata: Metadata = {
  title: "What is CodaCo? — A curated marketplace for death and dying",
  description:
    "The death of a loved one is a massively overwhelming time. CodaCo helps you sift through the people, services, and goods that can help — planning tools, estate attorneys, doulas, beautiful goods, and gentle guidance.",
};

// Each thing you'll find on the site: a bold lead-in, a plain-language
// description, and a single action link into the relevant part of the
// marketplace. Copy supplied by the CodaCo team.
const offerings: {
  title: string;
  body: string;
  cta: string;
  href: string;
}[] = [
  {
    title: "Planning tools",
    body: "There are lots of ways to plan ahead, and we have collected some of the most helpful tools. From end of life planning workbooks to death cafes in your hometown — safe spaces to talk openly about death, dying, grief, and planning ahead — you can find useful resources here.",
    cta: "Find planning tools",
    href: "/shop?category=planning",
  },
  {
    title: "Active, thoughtful, caring support through death and dying",
    body: "Every death is unique. But there are professionals who know how to help, no matter the circumstances — people who are familiar with death and dying and companies that exist to help in this space. We can help you find support near you.",
    cta: "Find support",
    href: "/services",
  },
  {
    title: "Beautiful goods",
    body: "There are lots of ways to honor and remember our loved ones. From burial shrouds to memorial portraits, we have collected some of the most beautiful, thoughtful, handmade goods to honor someone you have lost and keep their memory close by.",
    cta: "Find goods",
    href: "/shop",
  },
  {
    title: "Information",
    body: "Sometimes what we need most is gentle, direct information about what to do next, or what we can expect around the time of death and dying. Our Guidance page answers some of the most common questions about death, dying and the resources to help.",
    cta: "Read our guidance",
    href: "/guidance",
  },
  {
    title: "Help creating wills and trusts",
    body: "We list only recommended lawyers and firms to help you plan your will, or find help understanding how your money and assets will be safely transferred to the right people when you die.",
    cta: "Find an estate attorney",
    href: "/services?type=attorney",
  },
  {
    title: "A way to support a friend or colleague",
    body: "It can be really hard to know what to do when someone you know has lost a loved one. CodaCo gift cards allow you to support in a way that is helpful and meaningful — and way more practical than flowers.",
    cta: "Give a gift card",
    href: "/gift-cards",
  },
];

export default function WhatIsCodaCoPage() {
  return (
    <>
      {/* Hero — the plain-language intro */}
      <section className="bg-white px-10 pt-[4.5rem] pb-12 text-center">
        <p className="text-[13px] tracking-[.14em] uppercase text-tr mb-3">
          What is CodaCo?
        </p>
        <h1 className="font-serif italic text-[44px] font-light leading-[1.25] text-ch max-w-[760px] mx-auto mb-6">
          Death can be overwhelming.
          <br />
          <span className="text-tr">CodaCo is here to help.</span>
        </h1>
        <p className="text-[16px] text-cm max-w-[620px] mx-auto leading-[1.78]">
          There are so many resources to make the end of a life easier to
          navigate — but most of us don&rsquo;t know about them until after we
          need them. CodaCo brings helpful, trusted practitioners and beautiful
          goods all into one place, so you can find just what helps near the end
          of life — your own or a loved one&rsquo;s.
        </p>
      </section>

      <WaveDivider topColor="var(--color-white)" bottomColor="var(--color-tr-vp)" />

      {/* What you'll find on this site */}
      <section className="bg-tr-vp px-10 pt-2 pb-16">
        <Container width="mid">
          <SectionHeader
            eyebrow="A guide"
            title="What you'll find on this site"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {offerings.map((item) => (
              <Card key={item.title} className="flex flex-col">
                <h3 className="font-serif text-[22px] font-light text-ch mb-2.5 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[16px] text-cm leading-[1.72] mb-5 flex-1">
                  {item.body}
                </p>
                <Link
                  href={item.href}
                  className="inline-block text-[15px] text-tr border-b border-dotted border-tr-l no-underline hover:text-tr-d self-start"
                >
                  {item.cta} →
                </Link>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <WaveDivider topColor="var(--color-tr-vp)" bottomColor="var(--color-white)" />

      {/* Invitation to start */}
      <section className="bg-white px-10 py-16 text-center">
        <Link href="/services" className="btn-primary btn-md no-underline">
          Find support near you
        </Link>
      </section>
    </>
  );
}
