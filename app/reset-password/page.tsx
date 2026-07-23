import type { Metadata } from "next";
import Link from "next/link";
import { verifyPasswordResetToken } from "@/lib/auth/password-reset";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set a new password — CodaCo",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  // Validate the token up front so an expired or bad link shows a clear
  // notice instead of an inviting form the submit would only reject.
  const email = token ? await verifyPasswordResetToken(token) : null;
  const valid = Boolean(token && email);

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Sign in", href: "/login" },
          { label: "Set a new password" },
        ]}
      />

      <section className="bg-tr-vp px-10 py-16">
        <Container width="narrow">
          <div className="text-center mb-7">
            <p className="text-[13px] tracking-[.14em] uppercase text-tr mb-1.5">CodaCo</p>
            <h1 className="font-serif text-[32px] font-light text-ch mb-1">Set a new password</h1>
            <p className="text-[15px] text-cl">
              {valid
                ? "Choose a new password for your account."
                : "This reset link is invalid or has expired."}
            </p>
          </div>

          {valid ? (
            <ResetPasswordForm token={token!} />
          ) : (
            <div className="bg-white rounded-[10px] border border-line p-6 space-y-4 text-center">
              <p className="text-[15px] text-cl leading-relaxed">
                Reset links expire one hour after they&apos;re sent and can only be used
                once. Request a fresh one to continue.
              </p>
              <Link
                href="/forgot-password"
                className="inline-block h-10 px-6 leading-10 bg-tr text-white text-[16px] font-medium rounded-full hover:bg-tr-d transition-colors no-underline"
              >
                Request a new link
              </Link>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
