import type { ReactNode } from "react";

/*
 * Building blocks for long-form legal documents (privacy policy, terms,
 * community policy). They exist because a legal page is one repeated
 * pattern — numbered section, prose, the odd two- or three-column table —
 * repeated twenty times, and inlining that markup is how a document drifts
 * away from the rest of the site.
 */

/** Anchor id for a numbered section — shared by headings, the contents list, and <Ref>. */
export function sectionAnchor(n: number) {
  return `section-${n}`;
}

interface LegalSectionProps {
  n: number;
  title: string;
  children: ReactNode;
}

export function LegalSection({ n, title, children }: LegalSectionProps) {
  // scroll-mt-24 clears the sticky nav when a contents link jumps here.
  return (
    <section
      id={sectionAnchor(n)}
      className="scroll-mt-24 border-t border-line-soft pt-10 mt-10 first:border-t-0 first:pt-0 first:mt-0"
    >
      <h2 className="font-serif text-[27px] font-light leading-[1.25] text-ch mb-4">
        <span className="text-tr">{n}.</span> {title}
      </h2>
      <div className="space-y-4 text-[16px] text-cm leading-[1.8]">{children}</div>
    </section>
  );
}

export function LegalSubhead({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <h3 className="font-serif text-[20px] font-light text-ch pt-3">
      {label && <span className="text-tr">{label} </span>}
      {children}
    </h3>
  );
}

/** Inline cross-reference: renders "Section 7" (or just "7") linked to that anchor. */
export function Ref({ n, short = false }: { n: number; short?: boolean }) {
  return (
    <a
      href={`#${sectionAnchor(n)}`}
      className="text-tr no-underline hover:underline"
    >
      {short ? n : `Section ${n}`}
    </a>
  );
}

export function LegalList({
  items,
  variant = "bullet",
}: {
  items: ReactNode[];
  variant?: "bullet" | "plain";
}) {
  return (
    <ul
      className={
        variant === "bullet"
          ? "list-disc pl-5 space-y-2.5 marker:text-tr-l"
          : "list-none pl-0 space-y-3"
      }
    >
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[440px] border-collapse text-left text-[15px] leading-[1.65]">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="border-b border-line-bold pb-2 pr-5 text-[12px] font-medium uppercase tracking-[.12em] text-cl"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="align-top border-b border-line last:border-b-0">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`py-3 pr-5 ${j === 0 ? "text-ch" : "text-cm"}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LegalContents({
  sections,
}: {
  sections: { n: number; title: string }[];
}) {
  return (
    <nav aria-label="Contents">
      <p className="text-overline text-cl mb-3">Contents</p>
      {/* Multi-column rather than a grid so the numbering reads down each
          column (1…10, then 11…19) instead of jumping left-to-right. */}
      <ol className="list-none pl-0 sm:columns-2 gap-x-8 space-y-1.5 text-[15px]">
        {sections.map((section) => (
          <li key={section.n} className="break-inside-avoid">
            <a
              href={`#${sectionAnchor(section.n)}`}
              className="flex gap-2 text-cm no-underline hover:text-tr transition-colors"
            >
              <span className="w-4 shrink-0 text-right tabular-nums text-cl">
                {section.n}
              </span>
              <span>{section.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
