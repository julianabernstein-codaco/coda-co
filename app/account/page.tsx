import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/db";
import { ChangePasswordForm } from "./ChangePasswordForm";

export const metadata: Metadata = {
  title: "Account — CodaCo",
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/account");

  // A credential account has a password to change; an account created via
  // another sign-in method (future OAuth) wouldn't. Gate the form on it.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  const hasPassword = Boolean(user?.passwordHash);

  const display = session.user.name?.trim() || session.user.email;

  return (
    <>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Account" }]} />

      <section className="bg-pl2 px-10 py-10 min-h-screen">
        <Container width="narrow">
          <div className="mb-7">
            <p className="text-[13px] tracking-[.14em] uppercase text-tr mb-1.5">Account</p>
            <h1 className="font-serif text-[32px] font-light text-ch">Account settings</h1>
            <p className="text-[15px] text-cl mt-1.5">
              Signed in as <span className="text-ch">{display}</span>.
            </p>
          </div>

          <div className="mb-4">
            <h2 className="font-serif text-[22px] text-ch mb-1">Change password</h2>
            <p className="text-[14px] text-cl">
              Enter your current password, then choose a new one.
            </p>
          </div>

          {hasPassword ? (
            <ChangePasswordForm />
          ) : (
            <div className="bg-white rounded-[10px] border border-line p-6">
              <p className="text-[15px] text-cl leading-relaxed">
                This account doesn&apos;t use a password to sign in, so there&apos;s
                nothing to change here.
              </p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
