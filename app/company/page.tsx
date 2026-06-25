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
  bio: string[];
  tone: "sage" | "terracotta";
  photo?: string;
};

const founders: Founder[] = [
  {
    name: "Julie Bernstein",
    initials: "JB",
    role: "Co-founder",
    bio: [
      "Julie has spent her career on the side of death most people never see until they're forced to—and has made it her life's work to make that moment less frightening and more human.",
      "A geriatric physician associate for fourteen years, Julie trained at Brown and Oregon Health & Science University, then built what wasn't there: OHSU's first in-hospital geriatric consult program, which she led for six years, and its Office of Advanced Practice, where she served as founding Director. Her work didn't just change how patients were cared for—it moved the institution, helping inspire a major philanthropic gift to the university. Along the way she earned some of her field's top honors, named a leading geriatric clinician and her state's PA of the year. She has spoken nationally on aging, frailty, and end-of-life planning, and published research on the profound impact of geriatric expertise in the hospital setting.",
      "But Julie's real work happened at the bedside. She has helped people plan for death and helped them die. She has ensured patients can be home when home is where they wanted to go, and made sure final wishes were honored.",
      "Then Julie left the hospital to make death joyful, founding a business creating living funerals and celebrations of life, helping people plan events that allow the joy and celebration that stem from a life well lived, even at the end of life. CodaCo Market is what comes next: everything a family needs, all in one place, when someone they love is dying.",
    ],
    tone: "terracotta",
    photo: "/vendors/cofounder.JMB.photo.jpg",
  },
  {
    name: "Founder Name",
    initials: "FN",
    role: "Co-founder",
    bio: [
      "Short bio placeholder — share what drew this founder to the work of supporting families through loss.",
    ],
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
                  <div className="space-y-3 text-[14px] text-ink leading-[1.7] text-left">
                    {f.bio.map((para, j) => (
                      <p key={j}>{para}</p>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
