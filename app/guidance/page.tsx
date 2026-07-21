import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { GuidanceHub } from "@/components/faq/GuidanceHub";
import { guidanceTopics } from "@/components/faq/content";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Guidance & support — CodaCo",
  description:
    "Gentle guidance on death and dying — when someone dies, funerals and body disposition, death doulas, hospice care, and death cleaning. Browse a topic or search.",
};

export default function GuidancePage() {
  return (
    <>
      <Breadcrumb
        crumbs={[{ label: "Home", href: "/" }, { label: "Guidance" }]}
      />

      {/* Hero — warm, brief */}
      <section className="bg-white px-10 pt-16 pb-10 text-center">
        <p className="text-[13px] tracking-[.14em] uppercase text-sg-d mb-3">
          Guidance &amp; support
        </p>
        <h1 className="font-serif text-[46px] font-light leading-[1.13] text-ch mb-4">
          Support around{" "}
          <em className="italic text-sg-d">death &amp; dying</em>
        </h1>
        <p className="text-[17px] text-cm max-w-[560px] mx-auto leading-[1.75]">
          Whatever you&apos;re facing, start with the topic that fits — or search
          for a specific question. There&apos;s no wrong place to begin.
        </p>
      </section>

      {/* Topic hub */}
      <section className="bg-pl px-10 pt-10 pb-16">
        <Container width="mid">
          <GuidanceHub topics={guidanceTopics} />

          <p className="text-center text-[15px] text-cl leading-[1.7] mt-12">
            For help with an order or your account, visit the{" "}
            <Link href="/faq" className="text-sg-d hover:underline">
              Help Center
            </Link>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
