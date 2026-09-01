import type { Metadata } from "next";
import bcrypt from "bcryptjs";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { log } from "@/lib/log";
import { PREVIEW_COOKIE_NAME, previewToken, timingSafeEqual } from "@/lib/preview-gate";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSitePrivateState } from "@/lib/site-private";

// One shared password protects the whole site, so an unlimited-guess form
// is the weakest link in the gate — and it's exactly the control the team
// leans on during an incident. Same 15-minute window as login, slightly
// looser since a whole team may be unlocking at once from one office IP.
const UNLOCK_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 } as const;

export const metadata: Metadata = {
  title: "Preview access — CodaCo",
  robots: { index: false, follow: false },
};

// Constrain `next=` to relative same-origin paths so a malicious link
// can't bounce visitors to an external URL after they unlock.
function safeNext(raw: string | undefined): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

async function tryUnlock(formData: FormData) {
  "use server";
  const submitted = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/"));

  const envPassword = process.env.PREVIEW_PASSWORD;
  const sitePrivate = await getSitePrivateState();

  // Gate isn't engaged at all — nothing to unlock.
  if (!envPassword && !sitePrivate.enabled) redirect(next);

  const ip = await clientIp();
  const limited = await rateLimit(`preview-unlock:${ip}`, UNLOCK_LIMIT);
  if (!limited.ok) {
    log.warn("preview_gate.rate_limited", { ip });
    redirect(`/preview-access?error=throttled&next=${encodeURIComponent(next)}`);
  }

  // Whichever trigger is live decides which secret to check, and the cookie
  // is derived from that same secret. The env password is compared as digests
  // so neither its length nor a matching prefix shows up in response timing;
  // the DB path gets bcrypt's own constant-time compare.
  let unlockSecret: string | null = null;
  if (envPassword && timingSafeEqual(await previewToken(submitted), await previewToken(envPassword))) {
    unlockSecret = envPassword;
  } else if (
    sitePrivate.enabled &&
    sitePrivate.passwordHash &&
    (await bcrypt.compare(submitted, sitePrivate.passwordHash))
  ) {
    unlockSecret = sitePrivate.passwordHash;
  }

  if (!unlockSecret) {
    log.warn("preview_gate.unlock_failed", { ip });
    redirect(`/preview-access?error=1&next=${encodeURIComponent(next)}`);
  }

  const jar = await cookies();
  jar.set(PREVIEW_COOKIE_NAME, await previewToken(unlockSecret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  log.info("preview_gate.unlocked", { ip });
  redirect(next);
}

export default async function PreviewAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next: rawNext, error } = await searchParams;
  const next = safeNext(rawNext);

  return (
    <div className="min-h-screen bg-pl flex items-center justify-center px-6 py-16">
      <Container width="narrow">
        <div className="card-surface p-10 text-center">
          <div className="font-serif text-[36px] font-medium leading-none mb-2">
            <span className="text-tr">Coda</span>
            <span className="text-sg">Co</span>
          </div>
          <p className="text-overline text-cl mb-7">Private preview</p>
          <h1 className="font-serif text-[24px] font-light text-ch mb-3">
            This site is in private development.
          </h1>
          <p className="text-[16px] text-cm mb-7 leading-relaxed">
            Enter the preview password to continue, or visit our{" "}
            <Link href="/homepage" className="text-tr underline hover:text-tr-d">
              public welcome page
            </Link>
            .
          </p>

          <form action={tryUnlock} className="flex flex-col gap-3 text-left">
            <input type="hidden" name="next" value={next} />
            <label className="text-[14px] text-cm" htmlFor="preview-password">
              Preview password
            </label>
            <input
              id="preview-password"
              type="password"
              name="password"
              required
              autoFocus
              autoComplete="off"
              className="border border-line-strong rounded-[8px] px-4 py-3 text-[16px] text-ch outline-none focus:border-tr"
            />
            {error === "throttled" ? (
              <p className="text-[15px] text-tr">
                Too many attempts. Please try again in a little while.
              </p>
            ) : error ? (
              <p className="text-[15px] text-tr">
                That password isn&apos;t right. Try again.
              </p>
            ) : null}
            <button type="submit" className="btn-primary btn-md mt-1">
              Continue
            </button>
          </form>
        </div>
      </Container>
    </div>
  );
}
