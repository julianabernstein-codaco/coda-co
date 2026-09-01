import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { GuidanceHub } from "@/components/faq/GuidanceHub";
import { guidanceSections } from "@/components/faq/content";
import { ZipHelpCta } from "@/components/guidance/ZipHelpCta";
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
          <em className="italic text-sg-d">the end of life</em>
        </h1>
        <p className="text-[17px] text-cm max-w-[560px] mx-auto leading-[1.75]">
          Whatever you&apos;re facing, start with the topic that fits — or search
          for a specific question. There&apos;s no wrong place to begin.
        </p>
      </section>

      {/* Topic hub */}
      <section className="bg-pl px-10 pt-10 pb-16">
        <Container width="mid">
          <GuidanceHub sections={guidanceSections} />

          {/* Closing CTA — the hand-off from reading to finding a person.
              Mirrors the closing callout on /planning-ahead. */}
          <div className="mt-14">
            <div className="bg-sg-vp border border-sg-p rounded-[12px] px-8 py-8 text-center">
              <p className="text-[17px] text-ch max-w-[520px] mx-auto mb-3 leading-[1.8]">
                When you are losing a loved one, even the smallest action or
                decision can feel overwhelming.
              </p>
              <p className="text-[15px] text-ink max-w-[520px] mx-auto mb-6 leading-[1.75]">
                We collect resources and people who can help &mdash; and we
                believe that every one of these people is really excellent at
                what they do.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <ZipHelpCta lifeStage="active-dying,throughout" />
                <Link
                  href="/services?lifeStage=active-dying,throughout"
                  className="btn-ghost btn-lg bg-white text-sg-d hover:text-sg-d hover:border-sg"
                >
                  Browse services that can help
                </Link>
              </div>
            </div>
          </div>

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
