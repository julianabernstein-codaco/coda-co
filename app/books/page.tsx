import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Books — CodaCo",
  description: "Honest, beautifully written guides for the journey.",
};

export default function BooksPage() {
  return (
    <section className="bg-white px-10 py-24 text-center">
      <div className="max-w-[560px] mx-auto">
        <p className="text-[11px] tracking-[.14em] uppercase text-sg mb-2">
          The reading room
        </p>
        <h1 className="font-serif text-[42px] font-light text-ch mb-4">
          Books on death &amp; dying
        </h1>
        <p className="text-[15px] text-cm leading-[1.7]">
          A curated reading list is coming soon.
        </p>
      </div>
    </section>
  );
}
