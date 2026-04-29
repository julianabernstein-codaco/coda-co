import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Light & dark — CodaCo",
  description:
    "Prints, mugs, cards and gifts that find the levity in life's only guarantee.",
};

export default function LightAndDarkPage() {
  return (
    <section className="bg-white px-10 py-24 text-center">
      <div className="max-w-[560px] mx-auto">
        <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-2">
          Because death is also funny
        </p>
        <h1 className="font-serif text-[42px] font-light text-ch mb-4">
          Light &amp; Dark
        </h1>
        <p className="text-[15px] text-cm leading-[1.7]">
          The full Light &amp; Dark collection is coming soon.
        </p>
      </div>
    </section>
  );
}
