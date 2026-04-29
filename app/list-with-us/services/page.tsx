import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ServicesForm } from "@/components/vendor/ServicesForm";

export const metadata: Metadata = {
  title: "List services — CodaCo",
};

export default function ListServicesPage() {
  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "List with us", href: "/list-with-us" },
          { label: "List services" },
        ]}
      />
      <ServicesForm />
    </>
  );
}
