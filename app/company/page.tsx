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

type Person = {
  name: string;
  initials: string;
  role: string;
  bio: string[];
  tone: "sage" | "terracotta";
  photo?: string;
  photoPosition?: string;
};

const people: Person[] = [
  {
    name: "Julie Bernstein",
    initials: "JB",
    role: "Co-founder",
    bio: [
      "Juliana Bernstein is a geriatric physician associate turned entrepreneur who has spent nearly two decades helping people face death with dignity, agency, and even joy. After sixteen years in geriatric and palliative medicine, she launched Oregon's first event planning company dedicated to living funerals and celebrations of life - gatherings that welcome the blend of joy and sorrow that can exist together at the end of a life. CodaCo Market was a natural next direction—a marketplace for everything families need, but rarely know exists, when a loved one is dying.",
      "Julie holds a B.A. from Brown University and a Master's degree from Oregon Health & Science University.",
    ],
    tone: "terracotta",
    photo: "/vendors/cofounder.JMB.photo.jpg",
  },
  {
    name: "Naomi Levy",
    initials: "NL",
    role: "Co-founder",
    bio: [
      "Naomi Levy arrived at CodaCo after 17 years in Product and Project Management of economic forecasts. In 2019 she launched a home organizing side business to help others implement practical solutions for managing their lives and beloved belongings. At CodaCo she brings an organized and compassionate approach to the complex world of death & dying.",
      "Naomi believes death shouldn't be a taboo topic in America but rather something we prepare for together as a community.",
      "Naomi holds a B.A. in Economics from New York University.",
    ],
    tone: "sage",
    photo: "/vendors/cofounder.nl.photo.JPG",
    photoPosition: "50% 22%",
  },
  {
    name: "Alison Shmerling, MD, MPH",
    initials: "AS",
    role: "Advisor",
    bio: [
      "Dr. Alison Shmerling holds degrees from Northwestern University and Tufts University School of Medicine, and practices medicine in underserved care settings. Her passion is the intersection of underserved care and healthcare technology, building programs to change the way healthcare is delivered.",
      "She first held an appreciation for death and dying when losing her grandmother, who passed away peacefully at home surrounded by loved ones. In contrast to deaths often witnessed in the hospital setting, this experience demonstrated CodaCo's mission: to make death and dying something that can be planned, supported, and experienced as the beautiful part of life that it is.",
    ],
    tone: "terracotta",
  },
];

export default function CompanyPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white px-10 pt-[4.5rem] pb-12 text-center">
        <p className="text-[13px] tracking-[.14em] uppercase text-tr mb-3">
          Our company
        </p>
        <h1 className="font-serif italic text-[44px] font-light leading-[1.25] text-ch max-w-[760px] mx-auto mb-8">
          Meet the founders
        </h1>
        <p className="text-[17px] text-cl max-w-[560px] mx-auto leading-[1.78]">
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

          <div className="flex flex-wrap justify-center gap-6">
            {people.map((f, i) => (
              <Card
                key={i}
                padding="md"
                className="w-full sm:w-[calc(50%-0.75rem)]"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <VendorPhoto
                    src={f.photo}
                    alt={f.name}
                    initials={f.initials}
                    size="xl"
                    tone={f.tone}
                    objectPosition={f.photoPosition}
                  />
                  <div>
                    <h3 className="font-serif text-[22px] font-light text-ch">
                      {f.name}
                    </h3>
                    <p className="text-[13px] tracking-[.14em] uppercase text-tr mt-1">
                      {f.role}
                    </p>
                  </div>
                  <div className="space-y-3 text-[16px] text-ink leading-[1.7] text-left">
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
