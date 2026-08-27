import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import {
  LegalContents,
  LegalList,
  LegalSection,
  LegalSubhead,
  LegalTable,
  Ref,
} from "@/components/legal/LegalDoc";

export const metadata: Metadata = {
  title: "Privacy policy — CodaCo",
  description:
    "What personal information CodaCo Marketplace collects, why we collect it, who we share it with, and the choices you have.",
};

const EFFECTIVE_DATE = "August 28, 2026";
const LAST_UPDATED = "August 28, 2026";

const SECTIONS = [
  { n: 1, title: "About this policy" },
  { n: 2, title: "Summary" },
  { n: 3, title: "Information we collect" },
  { n: 4, title: "Sensitive information and consumer health data" },
  { n: 5, title: "How we use information" },
  { n: 6, title: "How we share information — generally" },
  { n: 7, title: "Sharing with Vendors — the most important disclosure" },
  { n: 8, title: "Reports, complaints, and enforcement" },
  { n: 9, title: "Vendor-specific privacy notes" },
  { n: 10, title: "Sale, sharing, and targeted advertising" },
  { n: 11, title: "Cookies and tracking technologies" },
  { n: 12, title: "Retention" },
  { n: 13, title: "Your rights and choices" },
  { n: 14, title: "State-specific disclosures" },
  { n: 15, title: "Security" },
  { n: 16, title: "Children" },
  { n: 17, title: "Third-party links" },
  { n: 18, title: "Changes to this policy" },
  { n: 19, title: "Contact us" },
];

const section = (n: number) => SECTIONS.find((s) => s.n === n)!;

/** Summary bullets — the lead sentence is emphasised, the rest is context. */
const SUMMARY: { lead: string; rest: React.ReactNode }[] = [
  {
    lead: "We never see your payment card or bank details.",
    rest: (
      <>
        All payments are processed by Stripe. Full card numbers, security codes,
        and bank account numbers never touch our systems. If you pay a Vendor
        through the Platform, we do receive limited transaction information
        &mdash; the amount, the date, the card brand and last four digits, and
        whether it succeeded.
      </>
    ),
  },
  {
    lead: "When you pay through the Platform, you are paying the Vendor, not us.",
    rest: (
      <>
        The Vendor is the merchant of record; we never hold your money and take
        no cut.
      </>
    ),
  },
  {
    lead: "You can browse without an account.",
    rest: <>We do not require Customers to register.</>,
  },
  {
    lead: "When you contact a Vendor, we pass your message to that Vendor.",
    rest: (
      <>
        That is the point of the Platform, and it is the most significant
        sharing we do.
      </>
    ),
  },
  {
    lead: "We treat search terms, category selections, and inquiry contents as sensitive,",
    rest: (
      <>
        because on this Platform they can reveal bereavement, illness, or
        end-of-life circumstances.
      </>
    ),
  },
  {
    lead: "If you report a problem with a Vendor, we protect your identity where we can.",
    rest: (
      <>
        See <Ref n={8} />.
      </>
    ),
  },
  {
    lead: "We do not sell your personal information,",
    rest: <>and we do not use it for cross-context behavioral advertising.</>,
  },
  {
    lead: "You have rights to access, correct, delete, and opt out.",
    rest: (
      <>
        <Ref n={13} /> explains how to use them.
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Breadcrumb
        crumbs={[{ label: "Home", href: "/" }, { label: "Privacy policy" }]}
      />

      {/* Hero */}
      <section className="bg-white px-10 pt-16 pb-8 text-center">
        <p className="text-[13px] tracking-[.14em] uppercase text-tr mb-3">
          Legal
        </p>
        <h1 className="font-serif text-[42px] font-light leading-[1.15] text-ch mb-4">
          Privacy policy
        </h1>
        <p className="text-[17px] text-cm max-w-[560px] mx-auto leading-[1.75]">
          CodaCo Marketplace &mdash;{" "}
          <a
            href="https://www.codaco.market"
            className="text-tr no-underline hover:underline"
          >
            www.codaco.market
          </a>
        </p>
        <p className="text-[13px] text-cl mt-3">
          Effective {EFFECTIVE_DATE} &middot; Last updated {LAST_UPDATED}
        </p>
      </section>

      <section className="bg-pl px-10 pt-8 pb-20">
        <Container width="narrow">
          <Card className="mb-12">
            <LegalContents sections={SECTIONS} />
          </Card>

          <LegalSection {...section(1)}>
            <p>
              CodaCo Marketplace, Inc (&ldquo;CodaCo,&rdquo; &ldquo;we,&rdquo;
              &ldquo;us,&rdquo; &ldquo;our&rdquo;) operates the online directory
              and marketplace at{" "}
              <a
                href="https://www.codaco.market"
                className="text-tr no-underline hover:underline"
              >
                www.codaco.market
              </a>{" "}
              (the &ldquo;Platform&rdquo;), where independent third-party
              providers (&ldquo;Vendors&rdquo;) publish listings for services
              and goods relating to grief support, end-of-life planning, funeral
              and memorial arrangements, estate administration, and related
              fields, and where members of the public
              (&ldquo;Customers&rdquo;) can find, contact, and pay them.
            </p>
            <p>
              This Privacy Policy explains what personal information we collect,
              why we collect it, who we share it with, and what choices you
              have. It applies to the Platform and to our related emails and
              communications.
            </p>
            <p>It sits alongside our other documents:</p>
            <LegalTable
              headers={["Document", "Applies to"]}
              rows={[
                [
                  <Link
                    key="customer-terms"
                    href="/customer-terms"
                    className="text-tr no-underline hover:underline"
                  >
                    Customer Terms of Use
                  </Link>,
                  "Customers and other visitors",
                ],
                ["Vendor Subscription Agreement", "Vendors"],
                ["Community Policy", "Vendors"],
                ["Code of Conduct", "Vendors"],
              ]}
            />
            <p>This Policy is incorporated into each of them.</p>
            <p>
              It does not apply to Vendors&rsquo; own practices. When you contact
              or pay a Vendor through the Platform, that Vendor receives your
              information and handles it under its own privacy practices, as an
              independent business responsible for its own compliance. We do not
              control what Vendors do with your information. See <Ref n={7} />.
            </p>
            <p>
              Please read <Ref n={4} /> carefully. Because of the subject matter
              of this Platform, the simple fact that you are here can suggest
              something sensitive about you or someone close to you. We describe
              how we handle that below.
            </p>
            <p>
              <strong className="text-ch font-medium">Where we operate.</strong>{" "}
              The Platform is operated in the United States and is intended for
              users in the United States. It is not directed to people outside
              it.
            </p>
          </LegalSection>

          <LegalSection {...section(2)}>
            <p className="text-[15px] text-cl">
              This summary is for convenience only; the full policy controls.
            </p>
            <LegalList
              variant="plain"
              items={SUMMARY.map(({ lead, rest }) => (
                <>
                  <strong className="text-ch font-medium">{lead}</strong> {rest}
                </>
              ))}
            />
          </LegalSection>

          <LegalSection {...section(3)}>
            <LegalSubhead label="3.1">
              Information Customers give us
            </LegalSubhead>
            <LegalTable
              headers={["What", "When", "Examples"]}
              rows={[
                [
                  "Contact details",
                  "When you submit an inquiry to a Vendor or a form to us",
                  "Name, email, phone, city/ZIP",
                ],
                [
                  "Inquiry contents",
                  "When you message a Vendor",
                  "What you are looking for, timing, free-text description of your situation",
                ],
                [
                  "Search and filter selections",
                  "When you use the Platform",
                  "Service category, geography, availability",
                ],
                [
                  "Account details (optional)",
                  "If you create an account",
                  "Email, password hash, saved Vendors",
                ],
                [
                  "Correspondence",
                  "When you contact support",
                  "Emails, complaint reports, attachments",
                ],
                [
                  "Conduct reports",
                  "If you tell us about a problem with a Vendor",
                  "Your account of what happened, dates, names, any messages or documents you send us",
                ],
                [
                  "Transaction metadata",
                  "If you pay a Vendor through the Platform",
                  "Amount, date and time, card brand and last four digits, success or failure, the Vendor paid, Stripe transaction ID",
                ],
                ["Newsletter signup", "If you subscribe", "Email, preferences"],
              ]}
            />

            <LegalSubhead label="3.2">Information Vendors give us</LegalSubhead>
            <LegalTable
              headers={["What", "Examples"]}
              rows={[
                [
                  "Business and contact information",
                  "Business name, DBA, address, phone, website, contact person",
                ],
                [
                  "Listing content",
                  "Service descriptions, service areas, photos, logos, bios, pricing you choose to display",
                ],
                [
                  "Credential information",
                  "License numbers, issuing authority, certifications, insurance certificates",
                ],
                [
                  "Account and billing identifiers",
                  "Email, password hash, Stripe customer ID, subscription tier, billing history metadata (amount, date, status)",
                ],
                [
                  "Subscription consent records",
                  "Your acceptance of the Vendor Subscription Agreement and your separate consent to automatic renewal, with timestamp, IP address, and the version of the terms shown",
                ],
                ["Correspondence", "Support tickets, disputes, notices"],
                [
                  "Conduct and enforcement records",
                  "Reports we receive about you, our findings, warnings, listing actions, suspensions, and any appeal you file",
                ],
              ]}
            />

            <LegalSubhead label="3.3">
              Information collected automatically
            </LegalSubhead>
            <LegalList
              items={[
                <>
                  <strong className="text-ch font-medium">
                    Device and connection data:
                  </strong>{" "}
                  IP address, browser type and version, operating system, device
                  type, screen size, language, referring URL.
                </>,
                <>
                  <strong className="text-ch font-medium">Usage data:</strong>{" "}
                  pages viewed, listings viewed, searches run, filters applied,
                  clicks, time on page, timestamps.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Cookies and similar technologies:
                  </strong>{" "}
                  see <Ref n={11} />.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Approximate location:
                  </strong>{" "}
                  derived from IP address, and &mdash; only with your permission
                  &mdash; precise location if you choose to use a &ldquo;near
                  me&rdquo; feature.
                </>,
              ]}
            />

            <LegalSubhead label="3.4">
              Information from other sources
            </LegalSubhead>
            <LegalList
              items={[
                <>
                  <strong className="text-ch font-medium">Stripe:</strong> for
                  Vendor subscriptions &mdash; subscription status, payment
                  success or failure, last four digits and card brand, and
                  dispute notifications. For Customer payments to Vendors &mdash;
                  the transaction metadata described in Section 3.1, which we
                  receive as the platform on whose interface the payment was
                  initiated. In neither case do we receive full card numbers,
                  security codes, or bank account numbers.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Public and licensing records:
                  </strong>{" "}
                  business registration records, and checks on whether a
                  Vendor&rsquo;s license remains current, is restricted, or has
                  been subject to disciplinary action.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Service providers:
                  </strong>{" "}
                  analytics, email delivery, fraud and abuse signals.
                </>,
                <>
                  <strong className="text-ch font-medium">Vendors:</strong> if a
                  Vendor tells us about a dispute or complaint, or reports
                  another Vendor under Section 7 of the Code of Conduct, that may
                  include information about you.
                </>,
              ]}
            />

            <LegalSubhead label="3.5">What we do NOT collect</LegalSubhead>
            <LegalList
              items={[
                <>
                  <strong className="text-ch font-medium">
                    Payment card numbers, CVVs, bank account numbers, or full
                    financial account credentials
                  </strong>{" "}
                  &mdash; from anyone. These are captured by Stripe&rsquo;s own
                  hosted payment fields and go directly to Stripe.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Customer funds.
                  </strong>{" "}
                  When you pay a Vendor through the Platform, the charge is
                  created on the Vendor&rsquo;s own Stripe account. We never
                  receive, hold, or disburse your money, and we take no
                  commission.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Government identification numbers
                  </strong>{" "}
                  from Customers.
                </>,
              ]}
            />
            <p>
              We do not ask Customers for medical records, diagnoses, or clinical
              information, and we ask you not to include protected health
              information, Social Security numbers, or financial account numbers
              in free-text inquiry fields.
            </p>
          </LegalSection>

          <LegalSection {...section(4)}>
            <p>
              We want to be direct about something most privacy policies gloss
              over.
            </p>
            <p>
              This Platform exists to help people find grief counselors,
              hospice-adjacent services, funeral providers, death doulas, and
              estate professionals. Because of that, ordinary usage data here
              carries meaning it would not carry elsewhere. A search for hospice
              services, a filter set to &ldquo;bereavement counseling,&rdquo; or
              a free-text message describing a recent death can reveal
              information about health, mortality, mental health, or family
              circumstances &mdash; about you, or about someone you love.
            </p>
            <p>
              Some state laws &mdash; including Washington&rsquo;s My Health My
              Data Act, Nevada&rsquo;s SB 370, and the &ldquo;sensitive
              data&rdquo; provisions of comprehensive state privacy laws &mdash;
              may treat some of this information as consumer health data or
              sensitive personal information.
            </p>
            <p className="text-ch">Our commitments:</p>
            <LegalList
              variant="plain"
              items={[
                <>
                  <strong className="text-ch font-medium">(a)</strong> We treat
                  inquiry contents, service-category selections, and
                  health-adjacent search terms as sensitive, and restrict
                  internal access to employees and contractors who need it.
                </>,
                <>
                  <strong className="text-ch font-medium">(b)</strong> We do not
                  sell consumer health data, and we do not use it for targeted
                  advertising or profiling.
                </>,
                <>
                  <strong className="text-ch font-medium">(c)</strong> We do not
                  knowingly draw inferences about your health status, a
                  diagnosis, or a death in your family beyond what is necessary
                  to route your inquiry to the Vendor you selected and to operate
                  the Platform.
                </>,
                <>
                  <strong className="text-ch font-medium">(d)</strong> Where
                  required by law, we obtain your consent before collecting or
                  sharing consumer health data, and we honor withdrawal of that
                  consent.
                </>,
                <>
                  <strong className="text-ch font-medium">(e)</strong> We apply
                  shortened retention to inquiry contents. See <Ref n={12} />.
                </>,
              ]}
            />
            <p>
              Please do not include clinical details, medication information, or
              account numbers in free-text fields. Tell the Vendor those things
              directly, under the Vendor&rsquo;s own protections, once you have
              chosen to work with them.
            </p>
          </LegalSection>

          <LegalSection {...section(5)}>
            <p>We use personal information to:</p>
            <LegalList
              variant="plain"
              items={[
                <>
                  <strong className="text-ch font-medium">(a)</strong>{" "}
                  <strong className="text-ch font-medium">
                    Operate the Platform
                  </strong>{" "}
                  &mdash; display listings, run searches, route your inquiry to
                  the Vendor you selected, provide the checkout interface, and
                  maintain accounts.
                </>,
                <>
                  <strong className="text-ch font-medium">(b)</strong>{" "}
                  <strong className="text-ch font-medium">
                    Provide Vendor subscriptions
                  </strong>{" "}
                  &mdash; onboarding, billing through Stripe, renewals, renewal
                  and price-change notices, receipts, and account management.
                </>,
                <>
                  <strong className="text-ch font-medium">(c)</strong>{" "}
                  <strong className="text-ch font-medium">Communicate</strong>{" "}
                  &mdash; respond to support requests, send transactional
                  messages, send service and policy notices, and send marketing
                  emails where permitted (with opt-out in every one).
                </>,
                <>
                  <strong className="text-ch font-medium">(d)</strong>{" "}
                  <strong className="text-ch font-medium">
                    Maintain quality and safety
                  </strong>{" "}
                  &mdash; review listings, investigate conduct reports and
                  complaints, check whether Vendor licenses remain current,
                  verify credentials where we choose to, detect fraud, spam,
                  scraping, and abuse, and enforce the Vendor Subscription
                  Agreement, Community Policy, and Code of Conduct.
                </>,
                <>
                  <strong className="text-ch font-medium">(e)</strong>{" "}
                  <strong className="text-ch font-medium">
                    Analyze and improve
                  </strong>{" "}
                  &mdash; understand which categories and regions are
                  underserved, diagnose errors, and improve search relevance,
                  using aggregated or de-identified data where practical.
                </>,
                <>
                  <strong className="text-ch font-medium">(f)</strong>{" "}
                  <strong className="text-ch font-medium">
                    Comply with law
                  </strong>{" "}
                  &mdash; respond to lawful requests, meet tax and recordkeeping
                  obligations, retain consent records where automatic renewal law
                  requires it, and establish or defend legal claims.
                </>,
              ]}
            />
            <p>
              We do not use Customer inquiry contents to train third-party
              artificial intelligence models, and we do not sell them.
            </p>
          </LegalSection>

          <LegalSection {...section(6)}>
            <p>
              We share personal information only as described in this Section
              and Sections <Ref n={7} short /> and <Ref n={8} short />:
            </p>
            <LegalList
              items={[
                <>
                  <strong className="text-ch font-medium">
                    Service providers
                  </strong>{" "}
                  acting on our instructions, under contract, and limited to what
                  they need: hosting, email delivery, analytics, customer support
                  tooling, error monitoring, and security.
                </>,
                <>
                  <strong className="text-ch font-medium">Stripe,</strong> for
                  payment processing.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Professional advisors
                  </strong>{" "}
                  &mdash; lawyers, accountants, auditors &mdash; under duties of
                  confidentiality.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Legal and safety
                  </strong>{" "}
                  &mdash; when we reasonably believe disclosure is required by
                  law or legal process, or necessary to protect the rights,
                  property, or safety of CodaCo, our users, or the public, or to
                  investigate suspected fraud or violation of our terms. Where
                  lawful and practical, we will attempt to notify you of a legal
                  demand for your information.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Licensing authorities and law enforcement,
                  </strong>{" "}
                  as described in <Ref n={8} />.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Corporate transactions
                  </strong>{" "}
                  &mdash; in a merger, acquisition, financing, reorganization, or
                  sale of assets, subject to reasonable confidentiality
                  protections and to this Policy continuing to apply to
                  information transferred.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    With your direction or consent,
                  </strong>{" "}
                  for anything else.
                </>,
              ]}
            />
            <p>
              We do not disclose your personal information to unaffiliated third
              parties for their own independent marketing purposes.
            </p>
          </LegalSection>

          <LegalSection {...section(7)}>
            <p>
              When you submit an inquiry through the Platform, we transmit that
              inquiry to the Vendor you selected. The Vendor receives the name,
              contact details, and message contents you provided, plus the
              service category and general location associated with your request.
            </p>
            <p>Once a Vendor receives your inquiry:</p>
            <LegalList
              items={[
                <>
                  The Vendor becomes an independent controller of that
                  information and is responsible for its own compliance with
                  privacy law.
                </>,
                <>
                  The Vendor handles your information under its own privacy
                  policy, not ours. We encourage you to read it.
                </>,
                <>
                  We cannot delete, correct, or retrieve your information from a
                  Vendor&rsquo;s systems. If you want a Vendor to delete your
                  information, you must ask that Vendor directly. We will provide
                  the Vendor&rsquo;s contact information and, on request, forward
                  your deletion request as a courtesy &mdash; but we cannot
                  compel compliance.
                </>,
              ]}
            />
            <p>
              <strong className="text-ch font-medium">
                Our contractual requirements on Vendors.
              </strong>{" "}
              The Vendor Subscription Agreement requires Vendors to use inquiry
              information only to respond to and service that inquiry, to refrain
              from selling or transferring it, and to comply with applicable
              privacy and anti-spam law. We cannot guarantee compliance, and we
              are not responsible for a Vendor&rsquo;s handling of your
              information.
            </p>
            <p>
              If you pay a Vendor through the Platform, the Vendor also receives
              the information necessary to complete and service that transaction,
              as merchant of record. See Section 3.5 for what we do and do not
              receive.
            </p>
            <p>
              <strong className="text-ch font-medium">Your control.</strong> You
              decide whether to submit an inquiry and which Vendor receives it.
              We do not distribute a single inquiry to multiple Vendors unless
              you expressly select more than one or use a &ldquo;request multiple
              quotes&rdquo; feature.
            </p>
          </LegalSection>

          <LegalSection {...section(8)}>
            <p>
              Our Community Policy and Code of Conduct ask Customers and Vendors
              to tell us when something is wrong. Handling those reports involves
              personal information, and we want to be clear about what happens to
              it.
            </p>
            <p className="text-ch">If you report a Vendor to us:</p>
            <LegalList
              items={[
                <>
                  We will usually need to put the substance of your report to
                  that Vendor so they can respond. We will not identify you to
                  the Vendor unless we are legally required to do so, or unless
                  you tell us we may. Tell us if you would prefer that we not
                  proceed at all.
                </>,
                <>
                  We recognize the limits of that promise. A subpoena, court
                  order, licensing board process, or legal claim brought by the
                  Vendor could compel disclosure. We will resist where we
                  reasonably can and, where lawful and practical, tell you first.
                </>,
                <>
                  We will not penalize or remove a Vendor for making a report in
                  good faith, and we do not treat a Customer differently for
                  reporting.
                </>,
              ]}
            />
            <p>
              <strong className="text-ch font-medium">
                Reports to authorities.
              </strong>{" "}
              Where conduct appears to breach a license condition, a regulation,
              or the law, we may report it to a state licensing board, regulator,
              attorney general, or law enforcement, and that report may include
              information you gave us. In a matter involving risk to a
              person&rsquo;s safety, we may do so without prior notice.
            </p>
            <p>
              <strong className="text-ch font-medium">Records we keep.</strong>{" "}
              Reports, our findings, and any resulting warnings, listing actions,
              suspensions, or terminations are recorded against the
              Vendor&rsquo;s account and retained as set out in <Ref n={12} />.
              Vendors may access and appeal decisions affecting them under
              Section 7A of the Code of Conduct; that right of appeal is not a
              right to obtain a reporter&rsquo;s identity.
            </p>
            <p>
              Nothing here limits your right to report anything to any authority
              yourself, at any time, without telling us.
            </p>
          </LegalSection>

          <LegalSection {...section(9)}>
            <LegalList
              variant="plain"
              items={[
                <>
                  <strong className="text-ch font-medium">
                    Your listing is public.
                  </strong>{" "}
                  Everything in your listing &mdash; business name, address,
                  phone, service area, bio, photos, credentials you display
                  &mdash; is published on the open internet, indexed by search
                  engines, and may be cached or copied by third parties beyond
                  our control.
                </>,
                <>
                  <strong className="text-ch font-medium">Billing.</strong>{" "}
                  CodaCo stores your Stripe customer identifier, subscription
                  tier, and payment status. Card data resides with Stripe.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Consent records.
                  </strong>{" "}
                  We retain records of your acceptance of the Vendor Subscription
                  Agreement and your separate consent to automatic renewal,
                  including timestamp, IP address, and the version of the terms
                  displayed to you. We keep these for at least three years, or
                  one year after your subscription ends, whichever is longer,
                  because automatic renewal law requires it.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Credential information
                  </strong>{" "}
                  you provide is used to assess and monitor your eligibility and
                  may be shown publicly if you include it in your listing.
                  License numbers are often public record, and we may check the
                  status of your license with the issuing authority.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Conduct records.
                  </strong>{" "}
                  Reports about you, our findings, and enforcement actions are
                  retained on your account as described in Sections{" "}
                  <Ref n={8} short /> and <Ref n={12} short />.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Performance data.
                  </strong>{" "}
                  We may show you aggregate metrics about your listing. These
                  reflect Platform-side activity and are not a representation
                  about any individual Customer.
                </>,
              ]}
            />
          </LegalSection>

          <LegalSection {...section(10)}>
            <p>
              Several state laws use broad definitions under which routine
              advertising and analytics cookies can count as a &ldquo;sale&rdquo;
              or &ldquo;share&rdquo; of personal information, or as
              &ldquo;targeted advertising,&rdquo; even when no money changes
              hands.
            </p>
            <p>
              <strong className="text-ch font-medium">Our position:</strong> In
              the twelve months preceding the Last Updated date, CodaCo has not
              sold personal information, has not shared personal information for
              cross-context behavioral advertising, and has not processed
              personal information for targeted advertising or for profiling that
              produces legal or similarly significant effects. We have not sold
              or shared the personal information of consumers we know to be under
              16.
            </p>
          </LegalSection>

          <LegalSection {...section(11)}>
            <LegalTable
              headers={["Category", "Purpose", "Can you turn it off?"]}
              rows={[
                [
                  "Strictly necessary",
                  "Login sessions, security, load balancing, CSRF protection, remembering your cookie choices",
                  "No — the Platform will not function",
                ],
                ["Functional", "Language, saved filters, saved Vendors", "Yes"],
                [
                  "Analytics",
                  "Aggregate usage measurement, error diagnosis",
                  "Yes",
                ],
                ["Advertising", "None currently used", "N/A"],
              ]}
            />
            <p>
              <strong className="text-ch font-medium">
                Essential cookies.
              </strong>{" "}
              When you sign in, we set a cookie that keeps you signed in and a
              second one that protects the forms you submit from being misused.
              While the site is in private preview, a third cookie remembers that
              you&rsquo;ve entered the preview password so you aren&rsquo;t asked
              on every page. These cookies are readable only by our servers, not
              by scripts running in your browser. The site can&rsquo;t function
              without them, so they aren&rsquo;t optional.
            </p>
            <p>
              <strong className="text-ch font-medium">
                Information stored in your browser.
              </strong>{" "}
              Your cart and your saved items are kept in your browser&rsquo;s
              local storage, on your own device. Clearing your browser data
              removes them. If you&rsquo;re signed in, your cart is also saved to
              your account so it follows you between devices.
            </p>
            <p>
              <strong className="text-ch font-medium">Analytics.</strong> We use
              Vercel Web Analytics to understand which pages people visit. It
              doesn&rsquo;t set cookies or store anything on your device, and it
              doesn&rsquo;t follow you to other sites. It counts visits using a
              temporary identifier derived from your network address and browser,
              rotated daily and discarded after 24 hours. We see aggregate
              patterns &mdash; page views, referrers, general regions &mdash; not
              individuals.
            </p>
            <p>
              <strong className="text-ch font-medium">Payments.</strong> Checkout
              and billing take place on pages hosted by Stripe, our payment
              processor. Stripe sets its own cookies on its own pages, for fraud
              prevention, and those are governed by Stripe&rsquo;s privacy notice
              rather than this one.
            </p>
            <p>
              <strong className="text-ch font-medium">
                Service providers.
              </strong>{" "}
              We rely on a small set of companies to host the site, store data,
              process payments, and send email. They may only handle your
              information to provide those services to us, and never for their
              own purposes. That&rsquo;s different from sharing your information
              with third parties, which we don&rsquo;t do.
            </p>
            <p>
              <strong className="text-ch font-medium">Your choices.</strong>{" "}
              Because everything above is either essential to the site or
              doesn&rsquo;t store anything on your device, we don&rsquo;t ask you
              to accept cookies to browse CodaCo. You can block or delete cookies
              through your browser settings at any time &mdash; doing so will
              sign you out and clear your cart and saved items. If we ever add
              analytics or advertising that isn&rsquo;t essential, we&rsquo;ll
              ask for your permission first.
            </p>
            <p>
              <strong className="text-ch font-medium">
                Global Privacy Control.
              </strong>{" "}
              We honor the GPC browser signal as a valid opt-out of sale,
              sharing, and targeted advertising where state law requires. Because
              we do not sell or share, this signal currently has limited
              practical effect, but we recognize it.
            </p>
            <p>
              <strong className="text-ch font-medium">Do Not Track.</strong>{" "}
              There is no common industry standard for DNT, and we do not
              currently respond to DNT headers.
            </p>
          </LegalSection>

          <LegalSection {...section(12)}>
            <p>
              We keep personal information only as long as needed for the
              purposes described in this Policy, then delete or de-identify it.
            </p>
            <LegalTable
              headers={["Category", "Retention"]}
              rows={[
                ["Customer inquiry contents", "12 months from submission"],
                ["Customer account data", "Life of the account, then 30 days"],
                [
                  "Vendor account and listing data",
                  "Life of the subscription, then 90 days, except as below",
                ],
                [
                  "Subscription and auto-renewal consent records",
                  "3 years, or 1 year after the subscription ends, whichever is longer, as automatic renewal law requires",
                ],
                [
                  "Conduct reports and enforcement records",
                  "3 years after the matter closes, or the life of the Vendor account, whichever is longer",
                ],
                ["Billing and tax records", "7 years, as required by law"],
                ["Support correspondence", "2 years"],
                ["Server and security logs", "90 days"],
                [
                  "Records needed for legal claims, disputes, or regulatory obligations",
                  "Until the matter and applicable limitation period conclude",
                ],
              ]}
            />
          </LegalSection>

          <LegalSection {...section(13)}>
            <p>
              Depending on where you live, you may have the right to:
            </p>
            <LegalList
              items={[
                <>
                  <strong className="text-ch font-medium">Know / access</strong>{" "}
                  what personal information we hold about you and how we use and
                  disclose it;
                </>,
                <>
                  <strong className="text-ch font-medium">Correct</strong>{" "}
                  inaccurate personal information;
                </>,
                <>
                  <strong className="text-ch font-medium">Delete</strong>{" "}
                  personal information, subject to legal exceptions;
                </>,
                <>
                  <strong className="text-ch font-medium">Obtain</strong> a
                  portable copy in a machine-readable format;
                </>,
                <>
                  <strong className="text-ch font-medium">Opt out</strong> of
                  sale, sharing, targeted advertising, or certain profiling;
                </>,
                <>
                  <strong className="text-ch font-medium">Limit</strong> the use
                  of sensitive personal information;
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Withdraw consent
                  </strong>{" "}
                  you previously gave;
                </>,
                <>
                  <strong className="text-ch font-medium">Appeal</strong> a
                  denial of a request; and
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Be free from discrimination
                  </strong>{" "}
                  for exercising these rights. We will not deny service, charge
                  different prices, or provide a different quality of service
                  because you exercised a privacy right.
                </>,
              ]}
            />

            <LegalSubhead>How to exercise them</LegalSubhead>
            <p>
              Email{" "}
              <a
                href="mailto:support@codaco.market"
                className="text-tr no-underline hover:underline"
              >
                support@codaco.market
              </a>
              . Include enough detail for us to locate your information (the
              email address you used, and the approximate date of your inquiry).
            </p>
            <LegalList
              variant="plain"
              items={[
                <>
                  <strong className="text-ch font-medium">
                    Verification.
                  </strong>{" "}
                  We will take reasonable steps to verify your identity before
                  acting &mdash; typically by confirming control of the email
                  address associated with the information, or by matching two or
                  more data points. We may decline requests we cannot reasonably
                  verify.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Authorized agents.
                  </strong>{" "}
                  An agent may submit a request with written authorization signed
                  by you; we may still contact you to confirm.
                </>,
                <>
                  <strong className="text-ch font-medium">Timing.</strong> We
                  respond within 45 days, extendable by an additional 45 days
                  with notice. Requests are free unless manifestly unfounded or
                  excessive.
                </>,
                <>
                  <strong className="text-ch font-medium">Appeals.</strong> If we
                  deny your request, you may appeal by replying to our decision
                  with the subject line &ldquo;Privacy Appeal.&rdquo; We will
                  respond within 45 days with a written explanation. If your
                  appeal is denied, you may contact your state attorney general.
                </>,
              ]}
            />
            <p>
              <strong className="text-ch font-medium">
                Two limits worth knowing.
              </strong>{" "}
              First, exercising a right with CodaCo does not reach information
              already delivered to a Vendor &mdash; see <Ref n={7} />. Second, we
              may decline to delete records we are required to retain, including
              automatic renewal consent records and records relating to an open
              conduct matter or legal claim.
            </p>
          </LegalSection>

          <LegalSection {...section(14)}>
            <p>
              The rights in <Ref n={13} /> are available to residents of every
              state with a comprehensive privacy law &mdash; including
              California, Colorado, Connecticut, Virginia, Utah, Texas, Oregon,
              Montana, Minnesota, Rhode Island, and others &mdash; and you
              exercise them the same way regardless of where you live.
            </p>
            <p>
              <strong className="text-ch font-medium">
                California (CCPA/CPRA).
              </strong>{" "}
              The categories of personal information we collect, and the business
              or commercial purposes for each, are described in Sections{" "}
              <Ref n={3} short /> and <Ref n={5} short />. The categories of
              third parties to whom we disclose personal information for business
              purposes are described in Sections <Ref n={6} short />,{" "}
              <Ref n={7} short />, and <Ref n={8} short />. See <Ref n={10} />{" "}
              for our sale and sharing statement. California residents may also
              request the specific pieces of personal information we hold. Under
              the &ldquo;Shine the Light&rdquo; law, we do not disclose personal
              information to third parties for their direct marketing purposes.
            </p>
            <p>
              <strong className="text-ch font-medium">Rhode Island.</strong>{" "}
              Rhode Island&rsquo;s comprehensive privacy law requires controllers
              that disclose personal data to third parties to identify, in this
              notice, the categories of personal data disclosed and the
              categories of third parties receiving it. Those disclosures appear
              in Sections <Ref n={3} short />, <Ref n={6} short />,{" "}
              <Ref n={7} short />, and <Ref n={8} short />.
            </p>
            <p>
              <strong className="text-ch font-medium">
                Washington (My Health My Data Act) and Nevada (SB 370).
              </strong>{" "}
              See <Ref n={4} />. Washington residents also have the right to
              withdraw consent to the collection and sharing of consumer health
              data and to have that data deleted.
            </p>
          </LegalSection>

          <LegalSection {...section(15)}>
            <p>
              We maintain administrative, technical, and physical safeguards
              designed to protect personal information, including encryption in
              transit (TLS), encryption at rest for databases and backups,
              role-based access controls, least-privilege administrative access,
              logging, and periodic review of our service providers. Access to
              inquiry contents and conduct reports is restricted to personnel who
              need it.
            </p>
            <p>
              No system is perfectly secure. We cannot guarantee the security of
              information transmitted to or from the Platform, and you provide
              information at your own risk. If we become aware of a breach
              affecting your personal information, we will notify you and the
              relevant authorities as required by applicable law.
            </p>
          </LegalSection>

          <LegalSection {...section(16)}>
            <p>
              The Platform is intended for adults. We do not knowingly collect
              personal information from children under 13, and we do not
              knowingly sell or share the personal information of anyone under
              16. If you believe a child has provided us information, contact{" "}
              <a
                href="mailto:support@codaco.market"
                className="text-tr no-underline hover:underline"
              >
                support@codaco.market
              </a>{" "}
              and we will delete it. We recognize that minors are sometimes
              affected by the events that bring people to this Platform; the
              Platform is nonetheless not designed for their use, and we ask that
              a parent or guardian make any inquiry.
            </p>
          </LegalSection>

          <LegalSection {...section(17)}>
            <p>
              The Platform links to Vendor websites and other third-party sites.
              This Policy does not apply to them, and we are not responsible for
              their content or practices.
            </p>
          </LegalSection>

          <LegalSection {...section(18)}>
            <p>
              We may update this Policy. We will post the revised version with a
              new &ldquo;Last Updated&rdquo; date and, for material changes,
              provide advance notice by email or a prominent Platform notice at
              least 30 days before the change takes effect. Where required by
              law, we will obtain your consent.
            </p>
          </LegalSection>

          <LegalSection {...section(19)}>
            <LegalList
              variant="plain"
              items={[
                <>
                  <strong className="text-ch font-medium">Inquiries:</strong>{" "}
                  <a
                    href="mailto:support@codaco.market"
                    className="text-tr no-underline hover:underline"
                  >
                    support@codaco.market
                  </a>
                </>,
                <>
                  <strong className="text-ch font-medium">Mail:</strong> CodaCo
                  Marketplace, Inc, 10350 N Vancouver Way, Suite 63209, Portland,
                  OR 97217
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Data controller:
                  </strong>{" "}
                  CodaCo Marketplace, Inc
                </>,
              ]}
            />
          </LegalSection>
        </Container>
      </section>
    </>
  );
}
