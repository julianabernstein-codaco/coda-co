import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import {
  PlanningChecklist,
  type ChecklistGroup,
} from "@/components/planning/PlanningChecklist";
import { Container } from "@/components/ui/Container";
import { WaveDivider } from "@/components/ui/WaveDivider";

export const metadata: Metadata = {
  title: "Planning ahead — CodaCo",
  description:
    "A checklist for preparing yourself, your loved ones, and your home for the end of life — advance directives, a will, an inventory of accounts, and a funeral plan.",
};

// A dotted underline link, matching the inline link treatment used on
// /where-to-start.
function InlineLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const className =
    "text-sg-d border-b border-dotted border-current pb-px hover:opacity-80 transition-opacity no-underline";
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

// The checklist copy. Each item's `lead` is the literal opening clause of
// the sentence, bolded so the list scans; `body` carries the rest.
const groups: ChecklistGroup[] = [
  {
    id: "everyone",
    title: "Things that we all should do.",
    items: [
      {
        id: "healthcare-agent",
        lead: "Choose a healthcare agent",
        body: (
          <>
            (also called healthcare proxy, healthcare power of attorney, or
            surrogate) — the person who speaks for you if you cannot speak for
            yourself. Actually ask the person. Do not surprise them with the
            role. Then complete a copy of your state&rsquo;s medical power of
            attorney (POA) form.
          </>
        ),
      },
      {
        id: "advance-directive",
        lead: "Complete an advance directive",
        body: (
          <>
            &ndash; also called a living will. This form records your wishes for
            medical care near the end of life, when you can no longer speak for
            yourself. It will walk you through different scenarios to help
            answer the questions. Forms vary state to state but you should be
            able to find yours fairly easily online. Most need only to be signed
            by a witness to be completed.
          </>
        ),
      },
      {
        id: "dementia-directive",
        lead: "If dementia concerns you,",
        body: (
          <>
            complete a dementia-specific directive covering the stages a
            standard form does not address (a standard living will typically
            only applies when you are terminal or permanently unconscious). One
            option is the{" "}
            <InlineLink href="https://dementia-directive.org/" external>
              Dementia Directive
            </InlineLink>
            .
          </>
        ),
      },
      {
        id: "planning-workbook",
        lead: "Lay out all of your wishes and end of life plans",
        body: (
          <>
            using a helpful workbook. Consider{" "}
            <InlineLink
              href="https://www.theheartwoodcollective.com/workbook"
              external
            >
              this version, from the Heartwood Collective
            </InlineLink>
            .
          </>
        ),
      },
      {
        id: "letter-of-instruction",
        lead: "Consider writing a letter of instruction",
        body: (
          <>
            — not legally binding, but the place for everything that does not
            belong in a will: where things are, why you made the choices you
            made, small requests. There are{" "}
            <InlineLink href="/shop?category=planning">
              workbooks that can help with things like this
            </InlineLink>
            .
          </>
        ),
      },
      {
        id: "asset-inventory",
        lead: "Build a complete inventory of your assets:",
        body: (
          <>
            every bank, brokerage, and retirement account with institution,
            account number, and approximate value. Include the accounts that are
            easy to forget: old employer 401k&rsquo;s, pensions from jobs you
            left decades ago, HSAs, savings bonds, credit union accounts,
            escrow, security deposits.
          </>
        ),
      },
      {
        id: "debt-inventory",
        lead: "Write out a complete inventory of debts:",
        body: (
          <>
            mortgage, home equity line, car loans, credit cards, personal loans,
            medical debt, student loans, tax liabilities, business guarantees.
          </>
        ),
      },
      {
        id: "life-insurance",
        lead: "Inventory your life insurance:",
        body: (
          <>
            every policy, including old group policies through former employers,
            small policies bought by parents decades ago, and any coverage
            attached to a credit card or mortgage.
          </>
        ),
      },
      {
        id: "key-contacts",
        lead: "List key contacts in your professional team:",
        body: (
          <>
            attorney, accountant, financial advisor, insurance agent, primary
            care provider, clergy, closest friends, employer HR. Include their
            website or how to reach them.
          </>
        ),
      },
    ],
  },
  {
    id: "legal",
    title: "Legal recommendations for everyone.",
    items: [
      {
        id: "valid-will",
        lead: "Make a valid will.",
        body: (
          <>
            Use{" "}
            <InlineLink href="/services?type=attorney">
              an estate attorney
            </InlineLink>{" "}
            if your situation has any complexity at all: minor children, a
            blended family, business, property in more than one state, a
            beneficiary with a disability, an estranged relative, or significant
            assets.
          </>
        ),
      },
      {
        id: "financial-poa",
        lead: "Sign a durable financial power of attorney",
        body: (
          <>
            so someone can manage money if you lose the capacity to make
            financial decisions, such as in dementia. Decide whether it takes
            effect immediately or only on incapacity.
          </>
        ),
      },
      {
        id: "review-will",
        lead: "Review or renew your will",
        body: (
          <>
            after marriage, divorce, a birth, a death, a major change in your
            assets (businesses, a new house) or a move to a new state.
          </>
        ),
      },
    ],
  },
];

export default function PlanningAheadPage() {
  return (
    <>
      <Breadcrumb
        crumbs={[{ label: "Home", href: "/" }, { label: "Planning ahead" }]}
      />

      {/* Hero */}
      <section className="bg-white px-10 pt-14 pb-10 text-center">
        <Container width="narrow">
          <p className="text-[13px] tracking-[.14em] uppercase text-sg-d mb-2">
            A gentle guide
          </p>
          <h1 className="font-serif text-[46px] font-light leading-[1.13] text-ch mb-5">
            Planning ahead
          </h1>
          <p className="text-[17px] text-cm leading-[1.8] text-left">
            Welcome and congratulations on thinking about the steps you might
            take &ndash; wherever you are in your life&rsquo;s journey &ndash;
            to prepare yourself, your loved ones, and your home for the eventual
            end of life. Well done, you, for being curious and wanting to be
            prepared.
          </p>
        </Container>
      </section>

      {/* The pull-quote framing: why the list matters */}
      <section className="bg-white px-10 pb-12">
        <Container width="narrow">
          <div className="bg-sg-p border border-sg-l rounded-[12px] px-7 py-6">
            <p className="text-[17px] text-ch leading-[1.85] m-0">
              The greatest gift you can leave your family is a clear record of
              your wishes: what you&rsquo;d want medically if you couldn&rsquo;t
              speak for yourself, how your savings and assets should be passed
              on (and where those accounts actually are), what should happen to
              your body, and what you&rsquo;d like most at your memorial or
              funeral. An advance directive, a will, a list of your accounts,
              and a funeral or body disposition plan can save your family months
              of difficulty.{" "}
              <em className="italic text-sg-d">
                And for most of this, you don&rsquo;t need an attorney.
              </em>
            </p>
          </div>
        </Container>
      </section>

      <WaveDivider />

      {/* The checklist, introduced by the line that hands off to it */}
      <section className="bg-pl px-10 pt-6 pb-16">
        <Container width="narrow">
          <p className="text-[17px] text-cm leading-[1.8] mb-7">
            We have created a list below intended to guide you through some of
            the things we all should be doing to ease the burden on the people
            we leave behind, whenever our own end comes.
          </p>
          <PlanningChecklist groups={groups} />
        </Container>
      </section>

      <WaveDivider />

      {/* Closing CTA */}
      <section className="bg-white px-10 pt-6 pb-20">
        <Container width="narrow">
          <div className="bg-tr-vp border border-tr-p rounded-[12px] px-8 py-8 text-center">
            <h2 className="font-serif text-[26px] font-light text-ch mb-3">
              You don&apos;t have to do all of it at once.
            </h2>
            <p className="text-[15px] text-ink max-w-[480px] mx-auto mb-6 leading-[1.75]">
              Pick one line from the list and do that. If you get stuck, a death
              doula or an end-of-life planner can sit with you and work through
              the rest &mdash; every provider listed on CodaCo has been vetted.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/shop?category=planning" className="btn-primary btn-lg">
                Browse planning workbooks →
              </Link>
              <Link
                href="/services?lifeStage=planning-ahead,throughout"
                className="btn-ghost btn-lg bg-white text-ch"
              >
                Find help planning ahead
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
