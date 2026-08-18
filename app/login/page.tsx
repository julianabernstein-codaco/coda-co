import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — CodaCo",
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string; switch?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next: nextParam, switch: switchParam } = await searchParams;
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/";

  const session = await auth();
  // `switch=1` means the caller sent a signed-in user here on purpose —
  // their account lacks access to `next` (an admin page reached from an
  // email, say). Redirecting them onward would bounce straight back, so
  // show the form and let them sign in as someone else.
  const wantsSwitch = switchParam === "1";
  if (session?.user && !wantsSwitch) redirect(next);
  const signedInAs = wantsSwitch ? (session?.user?.email ?? null) : null;

  return (
    <>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Sign in" }]} />

      <section className="bg-tr-vp px-10 py-16">
        <Container width="narrow">
          <div className="text-center mb-7">
            <p className="text-[13px] tracking-[.14em] uppercase text-tr mb-1.5">CodaCo</p>
            <h1 className="font-serif text-[32px] font-light text-ch mb-1">Sign in</h1>
            <p className="text-[15px] text-cl">Continue to your account.</p>
          </div>
          {signedInAs && (
            <p className="mb-4 rounded-[10px] border border-tr-l bg-tr-p px-4 py-3 text-[15px] text-cm">
              You&apos;re signed in as{" "}
              <span className="font-medium text-ch">{signedInAs}</span>, which
              doesn&apos;t have access to that page. Sign in with an admin
              account to continue.
            </p>
          )}
          <LoginForm next={next} />
        </Container>
      </section>
    </>
  );
}
