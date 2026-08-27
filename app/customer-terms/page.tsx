import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import {
  LegalContents,
  LegalList,
  LegalSection,
  Ref,
  type LegalSectionMeta,
} from "@/components/legal/LegalDoc";

export const metadata: Metadata = {
  title: "Customer terms of use — CodaCo",
  description:
    "What you can expect from CodaCo and what we expect from you. CodaCo is a directory of independent providers — we are not one of them.",
};

const EFFECTIVE_DATE = "August 28, 2026";
const LAST_UPDATED = "August 28, 2026";

// "Welcome" is deliberately absent — it sits above the contents card, so
// listing it there would be a link that scrolls backwards.
const SECTIONS: LegalSectionMeta[] = [
  { n: 1, title: "What CodaCo does, and does not do" },
  { n: 2, title: "Please check before you commit" },
  { n: 3, title: "Nothing here is professional advice" },
  { n: 4, title: "If you are in crisis" },
  { n: 5, title: "Contacting a provider" },
  { n: 6, title: "Paying a provider" },
  { n: 7, title: "Using the site properly" },
  { n: 8, title: "Reviews and anything you post" },
  { n: 9, title: "Our site and our content" },
  { n: 10, title: "What we can and cannot promise" },
  { n: 11, title: "Limits on our responsibility" },
  { n: 12, title: "Releases, and how disagreements are handled" },
  { n: 13, title: "Other things" },
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

const SITE_LINK = (
  <a
    href="https://www.codaco.market"
    className="text-tr no-underline hover:underline"
  >
    www.codaco.market
  </a>
);

const PRIVACY_LINK = (
  <Link href="/privacy" className="text-tr no-underline hover:underline">
    Privacy Policy
  </Link>
);

export default function CustomerTermsPage() {
  return (
    <>
      <Breadcrumb
        crumbs={[{ label: "Home", href: "/" }, { label: "Customer terms of use" }]}
      />

      {/* Hero */}
      <section className="bg-white px-10 pt-16 pb-8 text-center">
        <p className="text-[13px] tracking-[.14em] uppercase text-tr mb-3">
          Legal
        </p>
        <h1 className="font-serif text-[42px] font-light leading-[1.15] text-ch mb-4">
          Customer terms of use
        </h1>
        <p className="text-[17px] text-cm max-w-[560px] mx-auto leading-[1.75]">
          For people using CodaCo to find services
        </p>
        <p className="text-[13px] text-cl mt-3">
          {SITE_LINK} &middot; Effective {EFFECTIVE_DATE} &middot; Last updated{" "}
          {LAST_UPDATED}
        </p>
      </section>

      <section className="bg-pl px-10 pt-8 pb-20">
        <Container width="narrow">
          <LegalSection title="Welcome">
            <p>
              CodaCo is a directory. We list independent businesses and
              practitioners &mdash; grief counselors, funeral homes, death
              doulas, estate professionals, and others &mdash; so you can find
              them and get in touch.
            </p>
            <p>
              We are not one of those providers. We do not arrange funerals,
              provide counseling, give legal or financial advice, or perform any
              of the services you will find listed here. Other businesses do
              that. We just help you find them.
            </p>
            <p>
              These Terms explain what you can expect from us and what we expect
              from you. By using {SITE_LINK}, you agree to them. If you do not
              agree, please do not use the site.
            </p>
          </LegalSection>

          <Card className="mt-12">
            <LegalContents sections={SECTIONS} />
          </Card>

          <LegalSection {...section(1)}>
            <p>
              <strong className="text-ch font-medium">We do:</strong> publish
              listings that providers write about themselves, let you search
              them by location and type of service, and pass your message along
              when you choose to contact one.
            </p>
            <p>
              <strong className="text-ch font-medium">We do not:</strong>
            </p>
            <LegalList
              items={[
                "vouch for or guarantee any provider;",
                "take part in your arrangement with a provider, or supervise their work;",
                "set their prices, terms, or refund policies; or",
                "hold your money.",
              ]}
            />
            <p>
              Listings are advertisements. Providers write them. We do not verify
              what they say.
            </p>
            <p>
              Where a provider appears in search results is decided by us and may
              depend on their subscription level, location, their customer
              reviews or how well they match your search. A higher position does
              not necessarily mean a better provider.
            </p>
          </LegalSection>

          <LegalSection {...section(2)}>
            <p>
              We know this is often the last thing anyone wants to deal with. But
              a few minutes here can save a great deal of trouble:
            </p>
            <LegalList
              items={[
                <>
                  <strong className="text-ch font-medium">
                    Confirm the license yourself.
                  </strong>{" "}
                  Funeral directors, crematories, hospices, counselors, and
                  attorneys are licensed by state boards, and those boards
                  publish searchable registers. It takes a minute.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Get the price in writing, itemized.
                  </strong>{" "}
                  For funeral, burial, and cremation services, federal and state
                  law entitles you to a written price list. Please ask for it.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Read the contract before you sign it,
                  </strong>{" "}
                  including what happens if you cancel.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Consider getting advice
                  </strong>{" "}
                  from a lawyer, doctor, clinician, or financial professional
                  where the decision is a big one.
                </>,
              ]}
            />
          </LegalSection>

          <LegalSection {...section(3)}>
            <p>
              Articles, guides, checklists, and other material we publish are
              general information only. These forms are intended to be helpful
              but they are not medical, mental health, legal, tax, financial,
              insurance, or funeral-planning advice, and reading them does not
              create any professional relationship between you and CodaCo.
            </p>
            <p>
              Please do not delay or skip getting proper advice because of
              something you read on our site.
            </p>
          </LegalSection>

          <LegalSection {...section(4)}>
            <p>
              This site is not an emergency service and is not monitored. Nobody
              is watching for urgent messages.
            </p>
            {/* Given the subject matter, this one section is a callout rather
                than prose — someone scanning the page in distress should not
                have to read to find it. */}
            <div className="bg-tr-p border border-tr-l rounded-lg px-6 py-5 space-y-3">
              <p>
                <strong className="text-ch font-medium">
                  Medical emergency:
                </strong>{" "}
                call <strong className="text-ch font-medium">911</strong> (or
                your local emergency number).
              </p>
              <p>
                <strong className="text-ch font-medium">
                  Emotional distress, or thoughts of suicide:
                </strong>{" "}
                call or text <strong className="text-ch font-medium">988</strong>
                , the Suicide &amp; Crisis Lifeline (United States).
              </p>
            </div>
          </LegalSection>

          <LegalSection {...section(5)}>
            <p>
              When you send a message to a provider through our site, we pass it
              to them, along with the contact details and information you gave
              us.
            </p>
            <p>
              From that point, the provider has your information and we cannot
              take it back. They handle it under their own privacy policy. Our
              agreement with them requires them to use it only to respond to you,
              not to sell it, and to follow privacy and anti-spam law &mdash; but
              we cannot guarantee they will, and we are not responsible for what
              they do with it.
            </p>
            <p>
              If you want a provider to delete your information, ask them
              directly. We will give you their contact details and pass your
              request along if you ask, but we cannot make them act.
            </p>
            <p>
              Our {PRIVACY_LINK} explains what we do with your information.
            </p>
          </LegalSection>

          <LegalSection {...section(6)}>
            <p>
              Some providers accept payment through our site. If you pay this
              way:
            </p>
            <LegalList
              variant="plain"
              items={[
                <>
                  <strong className="text-ch font-medium">
                    You are paying the provider, not CodaCo.
                  </strong>{" "}
                  The provider&rsquo;s name will appear on your card or bank
                  statement. The money goes to their account. We never hold it,
                  and we take no share of it.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    We do not see your card details.
                  </strong>{" "}
                  Our payment processor, Stripe, collects them directly. We are
                  told the amount, the date, the card type, the last four digits,
                  and whether it worked.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Only the provider can refund you.
                  </strong>{" "}
                  We cannot issue refunds or reverse a payment. Refunds,
                  cancellations, and rescheduling are governed by the
                  provider&rsquo;s own terms, which you should read before
                  paying.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    If something goes wrong, ask the provider first.
                  </strong>{" "}
                  You can also tell us at {SUPPORT_EMAIL}. We may pass it on and
                  we may take it into account in deciding whether that provider
                  stays on our site &mdash; but we are not able to refund you or
                  resolve the dispute, and we have no obligation to get involved.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Prepaid arrangements are not allowed through our site.
                  </strong>{" "}
                  Providers may only take payment here for services being
                  provided now. If a provider asks you to pay through CodaCo for
                  a funeral or burial to be arranged at some future date, please
                  decline and tell us at {SUPPORT_EMAIL}.
                </>,
              ]}
            />
          </LegalSection>

          <LegalSection {...section(7)}>
            <p>Please do not:</p>
            <LegalList
              items={[
                "use the site to break the law, or to defraud or deceive anyone;",
                "post anything false, abusive, harassing, obscene, or that infringes someone else's rights;",
                "pretend to be someone you are not;",
                "scrape, copy, or harvest listings automatically, or use our data to build a competing directory;",
                "send spam or unwanted marketing to providers you find here; or",
                "interfere with the site's security or operation.",
              ]}
            />
            <p>
              We may remove content, suspend access, or report conduct to the
              authorities if we believe these Terms are being broken.
            </p>
          </LegalSection>

          <LegalSection {...section(8)}>
            <p>
              If you post a review, you keep ownership of it, but you give us
              permission to publish, display, format, and share it in connection
              with the site.
            </p>
            <p>
              Only review providers you have actually dealt with. Do not post
              reviews written by anyone else, and do not accept payment or
              anything else of value for a review.
            </p>
            <p>
              You are reviewing human beings. Please be constructive with your
              reviews. Negative reviews are allowed but we will not tolerate
              harassment, prejudice, or uncivil comments. We maintain the option
              to decline to publish or to remove reviews at our discretion.
            </p>
            <p>
              Reviews are the opinions of the people who write them. They are not
              ours, and we do not adopt or endorse them. We may decline to
              publish or may remove a review, but we are not obliged to check
              them.
            </p>
          </LegalSection>

          <LegalSection {...section(9)}>
            <p>
              The site itself &mdash; its software, design, text, graphics, and
              the CodaCo name and logo &mdash; belongs to us or our licensors.
              You may use the site for its intended purpose. You may not copy it,
              reuse our branding, or take our content for other purposes without
              our written permission.
            </p>
          </LegalSection>

          <LegalSection {...section(10)}>
            <p>
              We provide the site &ldquo;as is.&rdquo; To the fullest extent the
              law allows, we make no warranties of any kind, express or implied,
              including implied warranties of merchantability, fitness for a
              particular purpose, and non-infringement.
            </p>
            <p>In particular, we do not promise that:</p>
            <LegalList
              items={[
                "the site will always work, be available, or be free of errors;",
                "anything in a listing is accurate, current, or true;",
                "any provider is licensed, qualified, competent, insured, honest, or right for you; or",
                "any provider will do what they agreed to do, or do it properly, safely, or lawfully.",
              ]}
            />
            <p>
              Some states do not allow certain warranties to be excluded. Where
              that is the case, this section applies as far as the law allows.
            </p>
          </LegalSection>

          <LegalSection {...section(11)}>
            <p>To the fullest extent the law allows:</p>
            <LegalList
              variant="plain"
              items={[
                <>
                  <strong className="text-ch font-medium">
                    We are not liable for indirect losses.
                  </strong>{" "}
                  This includes lost profits, lost data, lost opportunity, damage
                  to reputation, and emotional distress, however the claim
                  arises, and whether or not we were warned such losses were
                  possible.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Our total liability to you
                  </strong>{" "}
                  for anything arising out of these Terms or the site will not
                  exceed one hundred U.S. dollars ($100), or the total amount you
                  have paid CodaCo in the six (6) months before the claim,
                  whichever is greater.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    These limits apply fully to anything involving a provider
                  </strong>{" "}
                  &mdash; their work, their conduct, and any dispute between you
                  and them.
                </>,
              ]}
            />
            <p>
              Some states do not allow these limits. Where that is the case, our
              liability is limited as far as the law allows.
            </p>
          </LegalSection>

          <LegalSection {...section(12)}>
            <LegalList
              variant="plain"
              items={[
                <>
                  <strong className="text-ch font-medium">
                    12.1 Disputes with providers.
                  </strong>{" "}
                  To the fullest extent the law allows, you release CodaCo from
                  all claims and damages of every kind, known or unknown, arising
                  out of any dispute between you and a provider. If you live in
                  California, you give up the protection of Civil Code &sect;
                  1542, which says a general release does not cover claims you
                  did not know about and which would have affected your decision
                  to settle. You give up any similar rule in any other state.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    12.2 Talk to us first.
                  </strong>{" "}
                  Before bringing any claim against us, please email{" "}
                  {SUPPORT_EMAIL} describing the problem, and give us sixty (60)
                  days to try to resolve it with you.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    12.3 Arbitration.
                  </strong>{" "}
                  If we cannot resolve it, the dispute will be decided by binding
                  arbitration administered by the American Arbitration
                  Association under its Consumer Arbitration Rules, before one
                  arbitrator. You may choose to have it heard in your home county
                  or by video, or in Wilmington, Delaware. The Federal
                  Arbitration Act governs this section.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    12.4 Exceptions.
                  </strong>{" "}
                  Either of us may bring an individual claim in small claims
                  court. Either of us may go to court for urgent relief about
                  intellectual property.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    12.5 No class actions.
                  </strong>{" "}
                  You may only bring a claim on your own behalf, not as part of a
                  class or representative action, and the arbitrator may not
                  combine claims.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    12.6 You can opt out.
                  </strong>{" "}
                  Email {SUPPORT_EMAIL} within thirty (30) days of first agreeing
                  to these Terms, giving your name and the email you used, and
                  this <Ref n={12} /> will not apply to you. Nothing else
                  changes.
                </>,
                <>
                  <strong className="text-ch font-medium">12.7</strong> If
                  arbitration does not apply, disputes will be heard in the state
                  or federal courts in Wilmington, Delaware.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    12.8 Time limit.
                  </strong>{" "}
                  Any claim must be brought within one (1) year of when it
                  arises, unless the law requires longer.
                </>,
              ]}
            />
          </LegalSection>

          <LegalSection {...section(13)}>
            <LegalList
              variant="plain"
              items={[
                <>
                  <strong className="text-ch font-medium">Age.</strong> You must
                  be 18 or over to use the site. It is not intended for children,
                  and we do not knowingly collect information from anyone under
                  13.
                </>,
                <>
                  <strong className="text-ch font-medium">Changes.</strong> We
                  may update these Terms. We will post the new version with a new
                  date, and for significant changes we will give notice on the
                  site. Continuing to use the site after that means you accept
                  the change. If you do not, please stop using the site.
                </>,
                <>
                  <strong className="text-ch font-medium">Links.</strong> We link
                  to other websites, including providers&rsquo; own. We are not
                  responsible for them.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Things outside our control.
                  </strong>{" "}
                  We are not liable for delays or failures caused by events
                  beyond our reasonable control, such as natural disasters,
                  outages, or attacks on our systems.
                </>,
                <>
                  <strong className="text-ch font-medium">
                    Which law applies.
                  </strong>{" "}
                  The law of the State of Delaware, without regard to its
                  conflict-of-law rules.
                </>,
                <>
                  If part of these Terms cannot be enforced, the rest still
                  applies.
                </>,
                <>
                  <strong className="text-ch font-medium">No waiver.</strong> If
                  we do not enforce something straight away, we can still enforce
                  it later.
                </>,
                <>
                  These Terms, together with our {PRIVACY_LINK}, are the whole
                  agreement between you and CodaCo about the site.
                </>,
              ]}
            />
          </LegalSection>

          <div className="border-t border-line-soft pt-10 mt-10 text-[16px] text-cm leading-[1.8]">
            <p>
              <strong className="text-ch font-medium">Contact</strong>
            </p>
            <p>CodaCo Marketplace, Inc &middot; {SUPPORT_EMAIL}</p>
          </div>
        </Container>
      </section>
    </>
  );
}
