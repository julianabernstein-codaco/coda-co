import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SavedList } from "@/components/saved/SavedList";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Saved items — CodaCo",
  description: "The products and providers you've saved.",
};

export default function SavedPage() {
  return (
    <>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Saved" }]} />

      <section className="bg-white px-10 pt-10 pb-16">
        <Container width="wide">
          <div className="mb-8">
            <h1 className="font-serif text-[32px] font-light text-ch mb-1">
              Saved items
            </h1>
            <p className="text-[13px] text-cl">
              Products and providers you have saved, kept in this browser.
            </p>
          </div>

          <SavedList />
        </Container>
      </section>
    </>
  );
}
