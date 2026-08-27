import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import {
  LegalContents,
  LegalList,
  LegalSection,
  LegalTable,
  Ref,
  type LegalSectionMeta,
} from "@/components/legal/LegalDoc";

export const metadata: Metadata = {
  title: "Community policy — CodaCo",
  description:
    "The standards we hold ourselves and our Vendors to: integrity, honesty, respect, and care for people at the worst moments of their lives.",
};

const EFFECTIVE_DATE = "August 28, 2026";
const LAST_UPDATED = "August 28, 2026";

// "Why we wrote this" is deliberately absent — it sits above the contents
// card, so listing it there would be a link that scrolls backwards.
const SECTIONS: LegalSectionMeta[] = [
  { n: 1, title: "What we stand for" },
  { n: 2, title: "What we ask of Vendors" },
  { n: 3, title: "Everyone is welcome here" },
  { n: 4, title: "What will get you removed" },
  { n: 5, title: "How we enforce this" },
  { n: 6, title: "Telling us about a problem" },
  { n: 7, title: "How this fits with our other documents" },
];

const section = (n: number) => SECTIONS.find((s) => s.n === n)!;

const SUPPORT_EMAIL = (
  <a
    href="mailto:support@codaco.market"
    className="text-tr no-underline hover:underline"
  >
    support@codaco.market
  </a>
);

export default function CommunityPolicyPage() {
  return (
    <>
      <Breadcrumb
        crumbs={[{ label: "Home", href: "/" }, { label: "Community policy" }]}
      />

      {/* Hero */}
      <section className="bg-white px-10 pt-16 pb-8 text-center">
        <p className="text-[13px] tracking-[.14em] uppercase text-tr mb-3">
          Legal
        </p>
        <h1 className="font-serif text-[42px] font-light leading-[1.15] text-ch mb-4">
          Community policy
        </h1>
        <p className="text-[17px] text-cm max-w-[560px] mx-auto leading-[1.75]">
          CodaCo Marketplace &mdash; for Vendors
        </p>
        <p className="text-[13px] text-cl mt-3">
          <a
            href="https://www.codaco.market"
            className="text-tr no-underline hover:underline"
          >
            www.codaco.market
          </a>{" "}
          &middot; Effective {EFFECTIVE_DATE} &middot; Last updated{" "}
          {LAST_UPDATED}
        </p>
      </section>

      <section className="bg-pl px-10 pt-8 pb-20">
        <Container width="narrow">
          <LegalSection title="Why we wrote this">
            <p>
              People come to CodaCo on some of the worst days of their lives. A
              parent has died. A diagnosis has arrived. Someone is trying to
              make arrangements while barely holding it together, often in a
              hurry, often for the first time, and often while being asked to
              spend a great deal of money.
            </p>
            <p>
              They have very little capacity to shop carefully, compare options,
              or push back. That asymmetry is the defining feature of this
              market, and it is why an ordinary marketplace policy is not enough
              here.
            </p>
            <p>
              This document describes the kind of community we are trying to
              build and the standards we hold ourselves and our Vendors to. The
              Code of Conduct sets out the specific commitments that follow from
              it.
            </p>
          </LegalSection>

          <Card className="mt-12">
            <LegalContents sections={SECTIONS} />
          </Card>

          <LegalSection {...section(1)}>
            <LegalList
              variant="plain"
              items={[
                <>
                  <strong className="text-ch font-medium">Integrity.</strong>{" "}
                  Doing the right thing when nobody is watching, when it costs
                  you a sale, and when the person in front of you would not know
                  the difference. In this field, most people will never be in a
                  position to evaluate what you did. That is precisely why it
                  matters.
                </>,
                <>
                  <strong className="text-ch font-medium">Honesty.</strong>{" "}
                  Saying what is true about your credentials, your prices, your
                  availability, and your limits. Honesty includes saying
                  &ldquo;that is not something I do&rdquo; or &ldquo;you may not
                  need this.&rdquo;
                </>,
                <>
                  <strong className="text-ch font-medium">Respect.</strong> For
                  customers, for their families and traditions, for the dead,
                  and for one another. Grief takes forms that can look strange
                  from the outside. Respect means meeting people where they are
                  rather than where you expect them to be.
                </>,
                <>
                  <strong className="text-ch font-medium">Care.</strong>{" "}
                  Attention to the person, not only the transaction. The pace,
                  the tone, and the patience you bring often matter as much as
                  the service itself.
                </>,
              ]}
            />
          </LegalSection>

          <LegalSection {...section(2)}>
            <LegalList
              variant="plain"
              items={[
                <>
                  <strong className="text-ch font-medium">
                    On the Platform:
                  </strong>{" "}
                  describe yourself accurately, price transparently, respond
                  promptly and kindly, and keep your Listing current.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    In your own work:
                  </strong>{" "}
                  hold to these standards whether or not a customer found you
                  through CodaCo, and whether or not anyone would find out. We
                  are not interested in Vendors who behave one way here and
                  another way elsewhere.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    In your community:
                  </strong>{" "}
                  you are part of the local fabric of care around death and
                  grief &mdash; alongside hospitals, hospices, clergy, social
                  workers, and other providers. We ask you to be a constructive
                  part of it. Show care toward the people around you.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Toward each other:
                  </strong>{" "}
                  see Section 5 of the Code of Conduct. In short, we would
                  rather Vendors help each other than undercut each other, and
                  we expect you to hold your peers to the same standards you
                  accept for yourself.
                </>,
              ]}
            />
          </LegalSection>

          <LegalSection {...section(3)}>
            <p>
              We serve people of every background. Customers come to CodaCo of
              every race, ethnicity, nationality, religion and none, age,
              disability, sex, sexual orientation, gender identity and
              expression, marital and family status, veteran status,
              socioeconomic circumstance, and cultural or funerary tradition.
              All of them deserve to be treated with the same care.
            </p>
            <p>
              Bias and prejudice have no place on this Platform. We do not
              tolerate slurs, demeaning or stereotyping language, harassment, or
              degrading treatment of anyone &mdash; a customer, another Vendor,
              or a member of our team &mdash; on any of these grounds.
            </p>
            <p>
              Serving a particular community is not bias. Many of the best
              providers in this field are rooted in a specific tradition &mdash;
              a Jewish burial society, a Catholic funeral home, a Muslim ghusl
              and kafan service, a Black-owned funeral home with generations of
              history in its neighborhood, an LGBTQ+-affirming grief practice, a
              Spanish-language counseling service. Specialization of this kind
              is a strength, and describing it plainly in your Listing helps
              people find what they are actually looking for.
            </p>
            <p>
              The line we draw is between <em>what you offer</em> and{" "}
              <em>how you treat people</em>. You may describe the traditions,
              rites, languages, and communities you specialize in, and you may
              decline work that falls genuinely outside your expertise,
              capacity, or religious practice. What you may not do is treat
              someone with contempt or demeaning conduct.
            </p>
            <p>
              Your legal obligations are your own. Public accommodation, civil
              rights, and anti-discrimination laws apply to your business
              independently of this policy, and they vary by state and locality.
              Nothing here expands or limits them. If you are unsure how they
              apply to your practice, consult your own counsel &mdash; CodaCo
              cannot advise you on this.
            </p>
            <p>
              If you decline to serve someone, do it promptly, courteously, and
              &mdash; where you can &mdash; with a referral to someone who can
              help. Whatever the reason, nobody should be left worse off for
              having asked.
            </p>
          </LegalSection>

          <LegalSection {...section(4)}>
            <p>
              The following are prohibited and are grounds for immediate
              termination for cause under Section 12.2 of the Vendor
              Subscription Agreement, without refund:
            </p>
            <LegalList
              variant="plain"
              items={[
                <>
                  <strong className="text-ch font-medium">(a)</strong> Slurs,
                  harassment, threats, or demeaning conduct directed at a
                  customer, Vendor, or CodaCo personnel on the basis of any
                  characteristic listed in <Ref n={3} />.
                </>,
                <>
                  <strong className="text-ch font-medium">(b)</strong>{" "}
                  Exploiting grief, fear, urgency, guilt, or religious
                  obligation to sell &mdash; including telling someone that a
                  more expensive option honors their loved one better, or that a
                  legally optional product or service is required.
                </>,
                <>
                  <strong className="text-ch font-medium">(c)</strong>{" "}
                  Misrepresenting your credentials, licensure, affiliations,
                  prices, or the nature of what you provide.
                </>,
                <>
                  <strong className="text-ch font-medium">(d)</strong>{" "}
                  Concealing prices from someone entitled to see them, or
                  charging materially more than you disclosed.
                </>,
                <>
                  <strong className="text-ch font-medium">(e)</strong> Taking
                  money for work you do not perform, or abandoning arrangements
                  mid-course.
                </>,
                <>
                  <strong className="text-ch font-medium">(f)</strong>{" "}
                  Mishandling remains, or treating the dead or their families
                  with disrespect.
                </>,
                <>
                  <strong className="text-ch font-medium">(g)</strong>{" "}
                  Retaliating against a customer for a complaint or an honest
                  review, including threats of legal action intended to suppress
                  honest feedback.
                </>,
                <>
                  <strong className="text-ch font-medium">(h)</strong>{" "}
                  Harassment of, or coordinated action against, another Vendor.
                </>,
                <>
                  <strong className="text-ch font-medium">(i)</strong> Using
                  customer information obtained here for anything other than
                  responding to that customer.
                </>,
              ]}
            />
            <p>
              We will also act on serious conduct that occurs off-Platform where
              it bears directly on your fitness to serve people in these
              circumstances &mdash; a suspended license, a regulatory sanction,
              or a criminal matter involving fraud, abuse, or exploitation.
            </p>
          </LegalSection>

          <LegalSection {...section(5)}>
            <p>
              We are a small team and we do not monitor everything. We rely
              substantially on customers and Vendors telling us when something
              is wrong.
            </p>
            <p>
              <strong className="text-ch font-medium">What we do:</strong>{" "}
              investigate reports in good faith, ask for your side before acting
              where circumstances allow, and respond proportionately &mdash; a
              conversation for a first misunderstanding, a formal warning for a
              real lapse, suspension or removal for serious or repeated conduct.
            </p>
            <p>
              <strong className="text-ch font-medium">
                What we do not do:
              </strong>{" "}
              we do not adjudicate contract disputes between you and a customer,
              determine whether you committed malpractice, or act as a licensing
              authority. Where a matter belongs with a state board, a regulator,
              or a court, we will say so, and we may report it.
            </p>
            <p>
              Immediate removal is reserved for conduct in <Ref n={4} /> and for
              anything presenting a risk to public safety.
            </p>
            <p>
              We may be wrong. If you believe we have acted on incomplete or
              inaccurate information, write to {SUPPORT_EMAIL} and we will take
              a second look. See Section 7 of the Code of Conduct.
            </p>
          </LegalSection>

          <LegalSection {...section(6)}>
            <p>
              Report to {SUPPORT_EMAIL}. Include what happened, when, and any
              names, messages, or documents that help.
            </p>
            <p>
              We will protect you where we can. We do not disclose the identity
              of a reporter to the person reported unless we must, and we will
              not terminate or penalize a Vendor for making a report in good
              faith. A report made dishonestly, or to damage a competitor, is
              itself a breach of this policy.
            </p>
            <p>
              Nothing in this policy prevents you from reporting anything to a
              state licensing board, regulator, law enforcement, or any other
              authority &mdash; at any time, without telling us first. See
              Section 6 of the Code of Conduct.
            </p>
          </LegalSection>

          <LegalSection {...section(7)}>
            <LegalTable
              headers={["Document", "What it does"]}
              rows={[
                [
                  "Vendor Subscription Agreement",
                  "The binding contract — fees, renewal, licensure warranties, termination, indemnity",
                ],
                [
                  "This Community Policy",
                  <>
                    Our values, and the conduct prohibitions in <Ref n={4} />
                  </>,
                ],
                [
                  "Code of Conduct",
                  "The specific commitments every Vendor makes",
                ],
                [
                  <Link
                    key="customer-terms"
                    href="/customer-terms"
                    className="text-tr no-underline hover:underline"
                  >
                    Customer Terms of Use
                  </Link>,
                  "Governs Customers, not Vendors",
                ],
                [
                  <Link
                    key="privacy"
                    href="/privacy"
                    className="text-tr no-underline hover:underline"
                  >
                    Privacy Policy
                  </Link>,
                  "How CodaCo handles personal information",
                ],
              ]}
            />
            <p>
              <Ref n={4} /> of this policy and the whole of the Code of Conduct
              are incorporated into the Vendor Subscription Agreement and are
              enforceable as part of it. Sections <Ref n={1} short />&ndash;
              <Ref n={3} short /> describe our values and the spirit in which we
              read everything else; they are not separate contractual
              obligations, but they inform how we interpret conduct under{" "}
              <Ref n={4} />.
            </p>
            <p>
              Where this policy and the Vendor Subscription Agreement conflict,
              the Agreement governs.
            </p>
          </LegalSection>

          <p className="border-t border-line-soft pt-10 mt-10 text-[16px] text-cm leading-[1.8]">
            Questions: {SUPPORT_EMAIL}
          </p>
        </Container>
      </section>
    </>
  );
}
