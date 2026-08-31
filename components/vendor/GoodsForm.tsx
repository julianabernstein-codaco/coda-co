"use client";

import { useRef, useState, useTransition } from "react";
import { saveSignupDraft, submitGoodsApplication } from "@/app/list-with-us/actions";
import {
  ImageUploader,
  type ImageUploaderHandle,
} from "@/components/ui/ImageUploader";
import { StateOptions } from "@/components/vendor/StateOptions";
import { StepsBar } from "@/components/ui/StepsBar";
import {
  goodsPlanIncludes,
  goodsPlans,
  planPriceLabel,
  planRenewalNote,
} from "@/lib/data/plans";
import { normalizeZip } from "@/lib/geo/zip";

type PlanId = "starter" | "standard" | "pro";

// Keep only JSON-serializable primitives/string-arrays for the signup
// draft — drops the item-photo File and any other non-plain values so we
// don't re-upload image bytes on every step.
function draftData(d: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(d)) {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    } else if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
      out[k] = v;
    }
  }
  return out;
}

const STEPS = [
  { label: "Your shop" },
  { label: "About you & first item" },
  { label: "Choose a plan" },
];

// Server enforces these in app/list-with-us/actions.ts. Keep in sync.
const BIO_MAX = 500;
const ITEM_DESC_MAX = 1000;

export interface ProductTypeOption {
  slug: string;
  name: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  companyName: string;
  instagram: string;
  facebook: string;
  website: string;
  city: string;
  state: string;
  zip: string;
  bio: string;
  itemTitle: string;
  itemType: string;
  // Kept as a string so the field can be empty; parsed at submit time.
  itemPrice: string;
  itemDescription: string;
  requiresCustomOrder: boolean;
}

// The text fields `field()` can bind to — everything but the checkbox.
type TextField = {
  [K in keyof FormData]: FormData[K] extends string ? K : never;
}[keyof FormData];

export function GoodsForm({
  productTypes,
  paidOpen = true,
}: {
  productTypes: ProductTypeOption[];
  paidOpen?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<PlanId>("starter");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const uploaderRef = useRef<ImageUploaderHandle>(null);
  // The uploader unmounts when the seller moves past Step 2, so the cropped
  // photo is pulled out and held here on the way to the plan step.
  const [itemPhoto, setItemPhoto] = useState<File | null>(null);
  const [data, setData] = useState<FormData>({
    firstName: "",
    lastName: "",
    companyName: "",
    instagram: "",
    facebook: "",
    website: "",
    city: "",
    state: "",
    zip: "",
    bio: "",
    itemTitle: "",
    itemType: "",
    itemPrice: "",
    itemDescription: "",
    requiresCustomOrder: false,
  });

  // Reads the current crop out of the uploader, falling back to whatever was
  // captured last time — going back to Step 2 remounts the uploader empty,
  // but the photo they already picked is still good.
  async function captureItemPhoto(): Promise<File | null> {
    const blob = await uploaderRef.current?.getCroppedBlob();
    if (!blob) return itemPhoto;
    const file = new File([blob], "item.webp", { type: blob.type });
    setItemPhoto(file);
    return file;
  }

  function field(key: TextField) {
    return {
      value: data[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setData((d) => ({ ...d, [key]: e.target.value })),
    };
  }

  // Company name is required, so it's the shop name. The name fallback only
  // covers a half-filled preview render before the seller reaches it.
  const shopName =
    data.companyName.trim() || `${data.firstName} ${data.lastName}`.trim();

  async function handleSubmit() {
    setSubmitError(null);
    // Captured on the way out of Step 2; re-read in case they came back.
    const photo = itemPhoto;
    if (!photo) {
      setSubmitError("Add a photo of your item.");
      setStep(1);
      return;
    }
    startTransition(async () => {
      const result = await submitGoodsApplication({
        displayName: shopName,
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName,
        website: data.website,
        instagram: data.instagram,
        bio: data.bio,
        city: data.city,
        state: data.state,
        zip: data.zip,
        planId: plan,
        requiresCustomOrder: data.requiresCustomOrder,
        firstItem: {
          title: data.itemTitle,
          productTypeSlug: data.itemType,
          startingPrice: Number(data.itemPrice),
          description: data.itemDescription,
          photo,
        },
      });
      // The action redirects on success, so we only land here on a
      // validation failure with the error returned in the payload.
      if (result?.error) setSubmitError(result.error);
    });
  }

  return (
    <div>
      <StepsBar steps={STEPS} current={step} />

      <section className="bg-tr-vp px-10 py-10">
        <div className="max-w-[780px] mx-auto flex gap-8">
          {/* Main form */}
          <div className="flex-1 min-w-0">
            {step === 0 && (
              <div className="bg-white rounded-[14px] border border-line p-8">
                <h2 className="font-serif text-[24px] font-light text-ch mb-1">
                  Step 1 — Set up your shop
                </h2>
                <p className="text-[15px] text-cl mb-6">
                  This is how buyers will know and trust you. You can edit it any
                  time, and you&apos;ll add your individual goods — with photos and
                  prices — right after this.
                </p>

                <FormField label="Company name" required>
                  <input className={inputCls} placeholder="Earthen Studio" {...field("companyName")} />
                  <p className="text-[13px] text-cl mt-1.5">
                    This is the shop name buyers will see.
                  </p>
                </FormField>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <FormField label="First name" required>
                    <input className={inputCls} placeholder="First name" {...field("firstName")} />
                  </FormField>
                  <FormField label="Last name" required>
                    <input className={inputCls} placeholder="Last name" {...field("lastName")} />
                  </FormField>
                </div>
                <FormField label="Website">
                  <input className={inputCls} placeholder="https://" {...field("website")} />
                </FormField>
                <FormField label="Instagram">
                  <input className={inputCls} placeholder="@yourhandle" {...field("instagram")} />
                </FormField>
                <FormField label="Facebook page">
                  <input className={inputCls} placeholder="facebook.com/yourpage" {...field("facebook")} />
                </FormField>
                <div className="grid grid-cols-[2fr_1fr_1fr] gap-4">
                  <FormField label="City" required>
                    <input className={inputCls} placeholder="Portland" {...field("city")} />
                  </FormField>
                  <FormField label="State" required>
                    <select className={inputCls} {...field("state")}>
                      <StateOptions />
                    </select>
                  </FormField>
                  <FormField label="Zip" required>
                    <input
                      className={inputCls}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={10}
                      placeholder="97201"
                      {...field("zip")}
                    />
                  </FormField>
                </div>
                <div className="border border-line-strong rounded-[10px] bg-pl2 p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-tr mt-1 flex-shrink-0"
                      checked={data.requiresCustomOrder}
                      onChange={() =>
                        setData((d) => ({
                          ...d,
                          requiresCustomOrder: !d.requiresCustomOrder,
                        }))
                      }
                    />
                    <span className="text-[15px] text-cm">
                      Some of my goods require significant personalization or
                      communication with clients outside of a simple purchase.
                      E.g. shipping of cremated remains, images, textiles or
                      other goods specific to a person who has died.{" "}
                      <span className="font-medium text-ch">
                        Check here if a customer cannot simply purchase a good
                        from you directly on this site.
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="bg-white rounded-[14px] border border-line p-8">
                <h2 className="font-serif text-[24px] font-light text-ch mb-1">
                  Step 2 — About you and your first item
                </h2>
                <p className="text-[15px] text-cl mb-6">
                  Our team reviews this first item before your shop goes live.
                  Once it&apos;s approved, everything you list after it
                  publishes instantly.
                </p>

                <FormField label="About you (shown on your shop page)" required>
                  <textarea
                    className={`${inputCls} min-h-[110px] resize-y`}
                    placeholder="Tell buyers about yourself and your work…"
                    maxLength={BIO_MAX}
                    {...field("bio")}
                  />
                  <div className="text-[13px] text-cl mt-1 text-right tabular-nums">
                    {data.bio.length} / {BIO_MAX}
                  </div>
                </FormField>

                <div className="border-t border-line pt-5 mt-6 mb-4">
                  <h3 className="font-serif text-[19px] text-ch">
                    Your first item
                  </h3>
                  <p className="text-[14px] text-cl mt-0.5">
                    One item is enough to get started — you can add the rest
                    from your dashboard.
                  </p>
                </div>

                <FormField label="Item title" required>
                  <input
                    className={inputCls}
                    placeholder="Hand-thrown ceramic urn"
                    {...field("itemTitle")}
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Product type" required>
                    <select className={inputCls} {...field("itemType")}>
                      <option value="" disabled>
                        Choose…
                      </option>
                      {productTypes.map((t) => (
                        <option key={t.slug} value={t.slug}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Starting price (USD)" required>
                    <input
                      className={inputCls}
                      type="number"
                      step="0.01"
                      min="0"
                      inputMode="decimal"
                      placeholder="0.00"
                      {...field("itemPrice")}
                    />
                  </FormField>
                </div>
                <FormField label="Description">
                  <textarea
                    className={`${inputCls} min-h-[110px] resize-y`}
                    placeholder="Materials, sizing, how it's made, what makes it special…"
                    maxLength={ITEM_DESC_MAX}
                    {...field("itemDescription")}
                  />
                  <div className="text-[13px] text-cl mt-1 text-right tabular-nums">
                    {data.itemDescription.length} / {ITEM_DESC_MAX}
                  </div>
                </FormField>

                <ImageUploader
                  ref={uploaderRef}
                  name="itemPhoto"
                  shape="square"
                  label="Item photo *"
                  hint="Required — this is the photo buyers see in the shop. JPEG, PNG, or WebP, under 5 MB."
                />
                {itemPhoto && (
                  <p className="text-[13px] text-sg-d mt-2">
                    Photo added. Pick another file to replace it.
                  </p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-[14px] border border-line p-8">
                <h2 className="font-serif text-[24px] font-light text-ch mb-1">
                  Step 3 — Choose a plan
                </h2>
                <p className="text-[15px] text-cl mb-6">
                  Start free. Upgrade anytime.
                </p>

                <div className="border border-line-strong rounded-[10px] bg-pl2 p-4 mb-4">
                  <div className="text-[14px] font-medium text-ch mb-2">All plans include</div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    {goodsPlanIncludes.map((f) => (
                      <li key={f} className="text-[14px] text-cm flex items-center gap-1.5">
                        <span className="text-sg">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  {goodsPlans.map((p) => {
                    const selected = plan === p.id;
                    const locked = !paidOpen && p.billingType !== "free";
                    return (
                      <button
                        key={p.id}
                        type="button"
                        disabled={locked}
                        aria-disabled={locked}
                        onClick={locked ? undefined : () => setPlan(p.id)}
                        className={[
                          "block w-full text-left border rounded-[10px] p-4 transition-all",
                          locked
                            ? "opacity-50 cursor-not-allowed border-line-strong"
                            : selected
                              ? "border-tr bg-tr-vp cursor-pointer"
                              : "border-line-strong hover:border-tr cursor-pointer",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[17px] font-medium text-ch">{p.name}</span>
                          <span className="text-[17px] font-medium text-tr">{planPriceLabel(p)}</span>
                          {p.popular && !locked && (
                            <span className="text-[12px] bg-tr text-white px-2 py-0.5 rounded-full">
                              Most popular
                            </span>
                          )}
                          {locked && (
                            <span className="text-[12px] text-cm px-2 py-0.5 rounded-full border border-line">
                              Available at launch
                            </span>
                          )}
                        </div>
                        <ul className="space-y-1">
                          {p.features.map((f) => (
                            <li key={f} className="text-[14px] text-cm flex items-center gap-1.5">
                              <span className="text-sg">✓</span> {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[13px] text-cl mt-3">{planRenewalNote}</p>

                <div className="mt-5 bg-sg-vp rounded-[8px] px-4 py-3 text-[15px] text-cm border border-sg-p">
                  After this, your dashboard opens so you can add more goods.
                  Your first item goes to our team for review — approving it
                  puts your shop and that listing live, and everything you add
                  afterwards publishes instantly.
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  setSubmitError(null);
                  setStep((s) => s - 1);
                }}
                disabled={step === 0}
                className="px-6 py-2.5 rounded-full border border-[rgba(44,40,37,.2)] text-[15px] text-ink cursor-pointer hover:border-ch transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Back
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  onClick={async () => {
                    // Validate each step's required fields here so the seller
                    // fixes them in place rather than bouncing back from the
                    // final submit (the State <select> and the product-type
                    // one both default to empty, which is easy to miss).
                    if (step === 0) {
                      if (!data.companyName.trim()) {
                        setSubmitError("Add a company name for your shop.");
                        return;
                      }
                      if (!data.firstName.trim() || !data.lastName.trim()) {
                        setSubmitError("Add your first and last name.");
                        return;
                      }
                      if (!data.city.trim() || !data.state.trim()) {
                        setSubmitError("Choose your city and state.");
                        return;
                      }
                      if (!normalizeZip(data.zip)) {
                        setSubmitError("Enter a valid 5-digit zip code so buyers can find you.");
                        return;
                      }
                    }
                    if (step === 1) {
                      if (!data.bio.trim()) {
                        setSubmitError("Add a short bio in the About you field.");
                        return;
                      }
                      if (!data.itemTitle.trim()) {
                        setSubmitError("Give your first item a title.");
                        return;
                      }
                      if (!data.itemType) {
                        setSubmitError("Pick a product type for your item.");
                        return;
                      }
                      const price = Number(data.itemPrice);
                      if (!data.itemPrice.trim() || !Number.isFinite(price) || price < 0) {
                        setSubmitError("Enter a starting price for your item.");
                        return;
                      }
                      // Pull the crop out before the uploader unmounts.
                      if (!(await captureItemPhoto())) {
                        setSubmitError("Add a photo of your item.");
                        return;
                      }
                    }
                    setSubmitError(null);
                    const next = step + 1;
                    setStep(next);
                    // Best-effort: record progress so we can see who started
                    // but didn't finish. Fire-and-forget — never blocks the step.
                    void saveSignupDraft({
                      kind: "goods",
                      step: next,
                      data: draftData(data as unknown as Record<string, unknown>),
                    });
                  }}
                  className="px-8 py-2.5 rounded-full bg-tr text-white text-[15px] cursor-pointer hover:bg-tr-d transition-colors"
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={pending}
                  className="px-8 py-2.5 rounded-full bg-tr text-white text-[15px] cursor-pointer hover:bg-tr-d transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {pending ? "Creating…" : "Create my shop →"}
                </button>
              )}
            </div>

            {submitError && (
              <p className="mt-3 text-[15px] text-tr-d bg-tr-p border border-tr-l rounded px-3 py-2">
                {submitError}
              </p>
            )}
          </div>

          {/* Sidebar preview */}
          <div className="w-[220px] flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-[12px] border border-line p-4 sticky top-[88px]">
              <div className="text-[13px] tracking-[.08em] uppercase text-cl mb-3">
                Shop preview
              </div>
              <div className="h-[90px] rounded-[8px] bg-tr-p flex items-center justify-center mb-3">
                <svg width="32" height="38" viewBox="0 0 60 70" fill="none">
                  <path d="M30 8 C18 8 10 20 10 38 C10 52 18 62 30 62 C42 62 50 52 50 38 C50 20 42 8 30 8Z" stroke="#C1634F" strokeWidth="1.8" fill="none" />
                </svg>
              </div>
              <div className="text-[15px] font-medium text-ch mb-1 truncate">
                {shopName || "Your shop name"}
              </div>
              <div className="text-[13px] text-cl truncate">
                {[data.city.trim(), data.state.trim()].filter(Boolean).join(", ") ||
                  "Your location"}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="block text-[14px] font-medium text-ch mb-1.5">
        {label}
        {required && <span className="text-tr ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-[rgba(44,40,37,.18)] rounded-[8px] px-3 py-2.5 text-[16px] text-ch bg-white outline-none focus:border-tr transition-colors";
