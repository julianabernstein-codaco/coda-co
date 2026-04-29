import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { GoodsForm } from "@/components/vendor/GoodsForm";

export const metadata: Metadata = {
  title: "List goods — CodaCo",
};

export default function ListGoodsPage() {
  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "List with us", href: "/list-with-us" },
          { label: "List goods" },
        ]}
      />
      <GoodsForm />
    </>
  );
}
