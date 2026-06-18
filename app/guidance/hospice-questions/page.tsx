import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Questions to Ask Potential Hospice Providers — CodaCo",
  description:
    "A gentle checklist of questions to bring to any conversation with a potential hospice provider — covering care, availability, communication, costs, and support.",
};

const groups: { title: string; questions: string[] }[] = [
  {
    title: "Care & services",
    questions: [
      "What hospice services are included in your program?",
      "How often will nurses and other team members visit?",
      "What support is available outside of scheduled visits?",
      "Do you offer specialized care for conditions such as dementia, cancer, heart disease, or COPD (etc.)?",
      "What medications, medical equipment, and supplies are covered?",
    ],
  },
  {
    title: "Availability & response time",
    questions: [
      "Is support available 24 hours a day, 7 days a week? Does a nurse answer directly?",
      "How quickly can a nurse respond to urgent concerns or symptom changes?",
      "What happens if we need help in the middle of the night or on a weekend?",
      "Do you have nurses available for emergency home visits?",
    ],
  },
  {
    title: "Care team & communication",
    questions: [
      "Who will be part of our hospice care team?",
      "How do you communicate updates to family members and caregivers?",
      "Will we have a dedicated nurse or primary point of contact?",
      "How often is the care plan reviewed and updated?",
    ],
  },
  {
    title: "Caregiver support",
    questions: [
      "What training and education do you provide for family caregivers?",
      "Do you offer respite care to give caregivers a temporary break?",
      "What resources are available if caregivers feel overwhelmed?",
    ],
  },
  {
    title: "Quality of care",
    questions: [
      "How do you manage pain and difficult symptoms?",
      "What is a typical nurse caseload at your hospice?",
      "How do you measure patient and family satisfaction?",
      "Are you accredited by a recognized healthcare organization?",
    ],
  },
  {
    title: "Practical considerations",
    questions: [
      "What insurance plans do you accept?",
      "Are there any out-of-pocket costs we should expect?",
      "How quickly can hospice services begin after enrollment?",
      "Can care be provided in a home, assisted living community, or nursing facility?",
    ],
  },
  {
    title: "Emotional & spiritual support",
    questions: [
      "Do you provide counseling, social work, or chaplain services?",
      "How do you support patients and families with different cultural or religious preferences?",
      "Is grief and bereavement support available for family members after a loved one passes away?",
    ],
  },
  {
    title: "Finding the right fit",
    questions: [
      "What makes your hospice program different from others in the area?",
      "Can you describe how you partner with families in making care decisions?",
      "What would you want your own family to know before choosing a hospice provider?",
    ],
  },
];

export default function HospiceQuestionsPage() {
  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Guidance", href: "/guidance" },
          { label: "Questions to ask hospice providers" },
        ]}
      />

      {/* Hero */}
      <section className="bg-white px-10 pt-16 pb-10 text-center">
        <p className="text-[11px] tracking-[.14em] uppercase text-sg-d mb-3">
          Guidance &amp; support
        </p>
        <h1 className="font-serif text-[40px] font-light leading-[1.15] text-ch max-w-[640px] mx-auto mb-4">
          Questions to ask potential hospice providers
        </h1>
        <p className="text-[15px] text-cm max-w-[560px] mx-auto leading-[1.75]">
          Choosing a hospice provider is a personal decision, and it&apos;s okay
          to ask a lot of questions. Use this checklist as a starting point when
          you meet with potential providers.
        </p>
      </section>

      {/* Grouped checklist */}
      <section className="bg-pl px-10 pt-10 pb-16">
        <Container width="narrow">
          <div className="space-y-5">
            {groups.map((group) => (
              <Card key={group.title} padding="md">
                <h2 className="font-serif text-[20px] font-light text-ch mb-3">
                  {group.title}
                </h2>
                <ul className="space-y-2.5">
                  {group.questions.map((q) => (
                    <li
                      key={q}
                      className="flex gap-2.5 text-[14px] text-ink leading-[1.65]"
                    >
                      <span
                        className="text-sg-d mt-[2px] flex-shrink-0"
                        aria-hidden="true"
                      >
                        •
                      </span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <p className="text-center text-[13px] text-cl leading-[1.7] mt-12">
            Back to{" "}
            <Link href="/guidance" className="text-sg-d hover:underline">
              guidance on death &amp; dying
            </Link>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
