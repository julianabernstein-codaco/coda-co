import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { VendorPhoto } from "@/components/ui/VendorPhoto";
import { Card } from "@/components/ui/Card";
import { WaveDivider } from "@/components/ui/WaveDivider";

export const metadata: Metadata = {
  title: "Meet the founders — CodaCo",
  description:
    "The people behind CodaCo Market — building a welcoming home for the goods and services that help families navigate loss.",
};

type Founder = {
  name: string;
  initials: string;
  role: string;
  bio: string;
  tone: "sage" | "terracotta";
  photo?: string;
};

const founders: Founder[] = [
  {
    name: "Julie Bernstein",
    initials: "JB",
    role: "Co-founder",
    bio: "Julie is a geriatric physician associate turned entrepreneur who has spent nearly two decades helping people face death with dignity, agency, and even joy. After sixteen years in geriatric and palliative medicine and three more in the business for living funerals and celebrations of life, she founded CodaCo Market—a marketplace for everything families need, but rarely know exists, when a loved one is dying.",
    tone: "terracotta",
    photo: "/vendors/cofounder.JMB.photo",
  },
  {
    name: "Founder Name",
    initials: "FN",
    role: "Co-founder",
    bio: "Short bio placeholder — share what drew this founder to the work of supporting families through loss.",
    tone: "sage",
  },
];

export default function CompanyPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white px-10 pt-[4.5rem] pb-12 text-center">
        <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-3">
          Our company
        </p>
        <h1 className="font-serif italic text-[44px] font-light leading-[1.25] text-ch max-w-[760px] mx-auto mb-8">
          Meet the founders
        </h1>
        <p className="text-[15px] text-cl max-w-[560px] mx-auto leading-[1.78]">
          CodaCo Market was built by people who believe loss deserves to be met
          with care.
        </p>
      </section>

      <WaveDivider topColor="var(--color-white)" bottomColor="var(--color-tr-vp)" />

      {/* Founders */}
      <section className="bg-tr-vp px-10 pt-2 pb-16">
        <Container width="mid">
          <SectionHeader
            eyebrow="Who we are"
            title="The people behind CodaCo"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {founders.map((f, i) => (
              <Card key={i} padding="md">
                <div className="flex flex-col items-center text-center gap-4">
                  <VendorPhoto
                    src={f.photo}
                    alt={f.name}
                    initials={f.initials}
                    size="xl"
                    tone={f.tone}
                  />
                  <div>
                    <h3 className="font-serif text-[22px] font-light text-ch">
                      {f.name}
                    </h3>
                    <p className="text-[11px] tracking-[.14em] uppercase text-tr mt-1">
                      {f.role}
                    </p>
                  </div>
                  <p className="text-[14px] text-ink leading-[1.7]">{f.bio}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
