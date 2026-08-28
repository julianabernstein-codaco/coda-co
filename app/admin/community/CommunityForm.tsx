"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  ImageUploader,
  type ImageUploaderHandle,
} from "@/components/ui/ImageUploader";
import type { ServiceTypeOption } from "@/lib/api/serviceTypes";
import { createCommunityListing, updateCommunityListing } from "./actions";

const inputCls =
  "w-full border border-line-bold rounded-[8px] px-3 py-2.5 text-[15px] text-ch bg-white outline-none focus:border-tr transition-colors";

const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

export interface CommunityFormInitial {
  orgName: string;
  contactEmail: string;
  city: string;
  state: string;
  zip: string;
  serviceTypeSlug: string;
  locationType: "in_person" | "virtual" | "both";
  bio: string;
  serviceDescription: string;
  website: string;
  currentPhotoSrc?: string | null;
}

// Shared by the create page and the per-listing edit page. Pass `initial`
// + `editSlug` to edit an existing listing; omit both to create a new one.
export function CommunityForm({
  serviceTypes,
  initial,
  editSlug,
}: {
  serviceTypes: ServiceTypeOption[];
  initial?: CommunityFormInitial;
  editSlug?: string;
}) {
  const editing = Boolean(editSlug);
  const uploaderRef = useRef<ImageUploaderHandle>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    const fields = {
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
    };
    startTransition(async () => {
      // Pull the cropped photo from the uploader (null if none picked).
      const blob = await uploaderRef.current?.getCroppedBlob();
      const photo = blob
        ? new File([blob], "photo.webp", { type: blob.type })
        : undefined;
      const res = editSlug
        ? await updateCommunityListing({ slug: editSlug, ...fields, photo })
        : await createCommunityListing({ ...fields, photo });
      if (res.ok) setSavedSlug(res.slug);
      else setError(res.error);
    });
  }

  if (savedSlug) {
    return (
      <div className="bg-white rounded-[10px] border border-sg-l p-6">
        <p className="text-[16px] text-ch font-medium mb-1">
          {editing ? "Changes saved" : "Community listing created"}
        </p>
        <p className="text-[14px] text-cm mb-4">
          {editing
            ? "The public profile has been updated."
            : "It’s published and free forever, with a “Community resource” badge."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/services/${savedSlug}`} className="btn-primary btn-sm no-underline">
            View profile →
          </Link>
          {editing ? (
            <Link href="/admin/community" className="btn-ghost btn-sm no-underline">
              Back to community listings
            </Link>
          ) : (
            <button type="button" onClick={() => setSavedSlug(null)} className="btn-ghost btn-sm">
              Create another
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[10px] border border-line p-6 space-y-5">
      <ImageUploader
        ref={uploaderRef}
        name="photo"
        currentSrc={initial?.currentPhotoSrc ?? null}
        shape="circle"
        label="Photo (optional)"
        hint="A logo or headshot for the listing. Drag to reposition, scroll or use the slider to zoom."
      />

      <Field label="Organization name" hint="Shown as the listing's name.">
        <input name="orgName" required maxLength={120} defaultValue={initial?.orgName} className={inputCls} placeholder="Front Range Death Café" />
      </Field>

      <Field label="Contact email" hint="Client inquiries route here. Also the org's (login-less) account.">
        <input name="contactEmail" type="email" required maxLength={200} defaultValue={initial?.contactEmail} className={inputCls} placeholder="hello@organization.org" autoComplete="off" />
      </Field>

      <div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
        <Field label="City">
          <input name="city" required defaultValue={initial?.city} className={inputCls} placeholder="Boulder" />
        </Field>
        <Field label="State">
          <select name="state" required defaultValue={initial?.state ?? ""} className={inputCls}>
            <option value="" disabled>—</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Zip">
          <input name="zip" required inputMode="numeric" maxLength={10} defaultValue={initial?.zip} className={inputCls} placeholder="80302" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <select name="serviceTypeSlug" required defaultValue={initial?.serviceTypeSlug ?? ""} className={inputCls}>
            <option value="" disabled>Choose a type…</option>
            {serviceTypes.map((t) => (
              <option key={t.slug} value={t.slug}>{t.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Format">
          <select name="locationType" required defaultValue={initial?.locationType ?? "in_person"} className={inputCls}>
            <option value="in_person">In person</option>
            <option value="virtual">Virtual</option>
            <option value="both">In person &amp; virtual</option>
          </select>
        </Field>
      </div>

      <Field label="About the organization" hint="Shown at the top of the public profile.">
        <textarea name="bio" required maxLength={500} rows={4} defaultValue={initial?.bio} className={`${inputCls} resize-y`} placeholder="A volunteer-led monthly gathering to talk openly about death over tea and cake…" />
      </Field>

      <Field label="What they offer (optional)">
        <textarea name="serviceDescription" maxLength={500} rows={3} defaultValue={initial?.serviceDescription} className={`${inputCls} resize-y`} placeholder="Free monthly meetings, no registration required. Newcomers welcome." />
      </Field>

      <Field label="Website (optional)">
        <input name="website" defaultValue={initial?.website} className={inputCls} placeholder="https://" />
      </Field>

      {error && (
        <p className="text-[14px] text-tr-d bg-tr-p border border-tr-l rounded px-3 py-2">{error}</p>
      )}

      <button type="submit" disabled={pending} className="btn-primary btn-md disabled:opacity-60 disabled:cursor-not-allowed">
        {pending ? "Saving…" : editing ? "Save changes" : "Create community listing"}
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
