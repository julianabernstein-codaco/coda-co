import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FaqList } from "@/components/list-with-us/FaqList";
import { getGuidanceTopic, guidanceTopics } from "@/components/faq/content";
import { Container } from "@/components/ui/Container";

interface TopicPageProps {
  params: Promise<{ topic: string }>;
}

export function generateStaticParams() {
  return guidanceTopics.map((topic) => ({ topic: topic.slug }));
}

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { topic } = await params;
  const found = getGuidanceTopic(topic);
  if (!found) return {};
  return {
    title: `${found.heading} — CodaCo`,
    description: found.blurb,
  };
}

export default async function GuidanceTopicPage({ params }: TopicPageProps) {
  const { topic } = await params;
  const found = getGuidanceTopic(topic);
  if (!found) notFound();

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Guidance", href: "/guidance" },
          { label: found.heading },
        ]}
      />

      {/* Hero */}
      <section className="bg-white px-10 pt-16 pb-10 text-center">
        <p className="text-[11px] tracking-[.14em] uppercase text-sg-d mb-3">
          Guidance &amp; support
        </p>
        <h1 className="font-serif text-[40px] font-light leading-[1.15] text-ch max-w-[640px] mx-auto mb-4">
          {found.heading}
        </h1>
        <p className="text-[15px] text-cm max-w-[560px] mx-auto leading-[1.75]">
          {found.blurb}
        </p>
      </section>

      {/* Questions */}
      <section className="bg-pl px-10 pt-8 pb-16">
        <Container width="narrow">
          <FaqList faqs={found.faqs} />

          <p className="text-center text-[13px] text-cl leading-[1.7] mt-12">
            &larr; Back to{" "}
            <Link href="/guidance" className="text-sg-d hover:underline">
              all guidance topics
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}
