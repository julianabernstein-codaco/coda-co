import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password — CodaCo",
};

export default async function ForgotPasswordPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Sign in", href: "/login" },
          { label: "Reset password" },
        ]}
      />

      <section className="bg-tr-vp px-10 py-16">
        <Container width="narrow">
          <div className="text-center mb-7">
            <p className="text-[13px] tracking-[.14em] uppercase text-tr mb-1.5">CodaCo</p>
            <h1 className="font-serif text-[32px] font-light text-ch mb-1">Reset your password</h1>
            <p className="text-[15px] text-cl">
              Enter your email and we&apos;ll send you a link to set a new one.
            </p>
          </div>
          <ForgotPasswordForm />
        </Container>
      </section>
    </>
  );
}
