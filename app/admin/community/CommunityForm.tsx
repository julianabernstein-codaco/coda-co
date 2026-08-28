"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { ServiceTypeOption } from "@/lib/api/serviceTypes";
import { createCommunityListing } from "./actions";

const inputCls =
  "w-full border border-line-bold rounded-[8px] px-3 py-2.5 text-[15px] text-ch bg-white outline-none focus:border-tr transition-colors";

const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

export function CommunityForm({ serviceTypes }: { serviceTypes: ServiceTypeOption[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await createCommunityListing({
        orgName: String(fd.get("orgName") ?? ""),
        contactEmail: String(fd.get("contactEmail") ?? ""),
        city: String(fd.get("city") ?? ""),
        state: String(fd.get("state") ?? ""),
        zip: String(fd.get("zip") ?? ""),
        serviceTypeSlug: String(fd.get("serviceTypeSlug") ?? ""),
        locationType: String(fd.get("locationType") ?? "in_person") as
          | "in_person"
          | "virtual"
          | "both",
        bio: String(fd.get("bio") ?? ""),
        serviceDescription: String(fd.get("serviceDescription") ?? ""),
        website: String(fd.get("website") ?? ""),
      });
      if (res.ok) setCreatedSlug(res.slug);
      else setError(res.error);
    });
  }

  if (createdSlug) {
    return (
      <div className="bg-white rounded-[10px] border border-sg-l p-6">
        <p className="text-[16px] text-ch font-medium mb-1">Community listing created</p>
        <p className="text-[14px] text-cm mb-4">
          It&apos;s published and free forever, with a &ldquo;Community resource&rdquo; badge.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/services/${createdSlug}`} className="btn-primary btn-sm no-underline">
            View profile →
          </Link>
          <button
            type="button"
            onClick={() => setCreatedSlug(null)}
            className="btn-ghost btn-sm"
          >
            Create another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[10px] border border-line p-6 space-y-5">
      <Field label="Organization name" hint="Shown as the listing's name.">
        <input name="orgName" required maxLength={120} className={inputCls} placeholder="Front Range Death Café" />
      </Field>

      <Field label="Contact email" hint="Client inquiries route here. Also creates the org's (login-less) account.">
        <input name="contactEmail" type="email" required maxLength={200} className={inputCls} placeholder="hello@organization.org" autoComplete="off" />
      </Field>

      <div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
        <Field label="City">
          <input name="city" required className={inputCls} placeholder="Boulder" />
        </Field>
        <Field label="State">
          <select name="state" required defaultValue="" className={inputCls}>
            <option value="" disabled>—</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Zip">
          <input name="zip" required inputMode="numeric" maxLength={10} className={inputCls} placeholder="80302" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <select name="serviceTypeSlug" required defaultValue="" className={inputCls}>
            <option value="" disabled>Choose a type…</option>
            {serviceTypes.map((t) => (
              <option key={t.slug} value={t.slug}>{t.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Format">
          <select name="locationType" required defaultValue="in_person" className={inputCls}>
            <option value="in_person">In person</option>
            <option value="virtual">Virtual</option>
            <option value="both">In person &amp; virtual</option>
          </select>
        </Field>
      </div>

      <Field label="About the organization" hint="Shown at the top of the public profile.">
        <textarea name="bio" required maxLength={500} rows={4} className={`${inputCls} resize-y`} placeholder="A volunteer-led monthly gathering to talk openly about death over tea and cake…" />
      </Field>

      <Field label="What they offer (optional)">
        <textarea name="serviceDescription" maxLength={500} rows={3} className={`${inputCls} resize-y`} placeholder="Free monthly meetings, no registration required. Newcomers welcome." />
      </Field>

      <Field label="Website (optional)">
        <input name="website" className={inputCls} placeholder="https://" />
      </Field>

      {error && (
        <p className="text-[14px] text-tr-d bg-tr-p border border-tr-l rounded px-3 py-2">{error}</p>
      )}

      <button type="submit" disabled={pending} className="btn-primary btn-md disabled:opacity-60 disabled:cursor-not-allowed">
        {pending ? "Creating…" : "Create community listing"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-ch mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[12px] text-cl mt-1">{hint}</p>}
    </div>
  );
}
