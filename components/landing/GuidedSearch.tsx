"use client";

import { useState } from "react";
import Link from "next/link";

interface GuidedSearchProps {
  open: boolean;
}

interface SubPanel {
  id: "recently" | "planning" | "memorial" | "learn";
  title: string;
  desc: string;
  featured?: boolean;
}

const tiles: SubPanel[] = [
  {
    id: "recently",
    title: "Someone I love just died",
    desc: "I don't know where to start",
    featured: true,
  },
  {
    id: "planning",
    title: "Planning ahead",
    desc: "Documents, workbooks, directives",
  },
  {
    id: "memorial",
    title: "Memorial & burial",
    desc: "Urns, shrouds, ash jewelry",
  },
  {
    id: "learn",
    title: "Learning & exploring",
    desc: "Books, humor, community",
  },
];

interface TagLink {
  label: string;
  href?: string;
}

const subTags: Record<SubPanel["id"], TagLink[]> = {
  recently: [],
  planning: [
    { label: "Advance care templates", href: "/shop?category=planning" },
    { label: "EOL workbooks", href: "/shop?category=planning" },
    { label: "Estate attorneys", href: "/services?type=attorney" },
    { label: "Death doulas", href: "/services?type=doula" },
  ],
  memorial: [
    { label: "Urns & vessels", href: "/shop?category=urns" },
    { label: "Ash jewelry", href: "/shop?category=jewelry" },
    { label: "Burial shrouds", href: "/shop?category=shrouds" },
    { label: "Custom keepsakes", href: "/shop?category=memorial" },
  ],
  learn: [
    { label: "Books on death" },
    { label: "Dark humor gifts" },
    { label: "Briefly Perfectly Human" },
    { label: "Smoke Gets in Your Eyes" },
  ],
};

export function GuidedSearch({ open }: GuidedSearchProps) {
  const [activeSub, setActiveSub] = useState<SubPanel["id"] | null>(null);

  if (!open) return null;

  return (
    <div className="bg-white border border-tr-p rounded-[12px] p-6 max-w-[620px] mx-auto mt-5 text-left">
      <h3 className="font-serif text-[21px] font-normal text-ch mb-4">
        What brings you to CodaCo today?
      </h3>

      <div className="grid grid-cols-2 gap-2.5">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => setActiveSub(tile.id)}
            className={[
              "rounded-[8px] p-3.5 text-left cursor-pointer transition-all duration-200",
              tile.featured
                ? "bg-tr-vp border-[1.5px] border-tr-p hover:border-tr"
                : "bg-pl border border-[rgba(44,40,37,.09)] hover:border-tr-l hover:bg-tr-vp",
            ].join(" ")}
          >
            <span className="block text-[13px] font-medium text-ch">
              {tile.title}
            </span>
            <span className="block text-[12px] text-cl mt-0.5">{tile.desc}</span>
          </button>
        ))}
      </div>

      {activeSub === "recently" && (
        <div className="mt-3">
          <p className="text-[13px] text-cm mb-3">
            We're so sorry for your loss. Here is a gentle guide to what might
            help right now.
          </p>
          <Link
            href="/where-to-start"
            className="block bg-tr text-white text-center py-2.5 px-5 rounded-[20px] text-[13px] no-underline hover:bg-tr-d transition-colors"
          >
            See the full guide: where to start →
          </Link>
          <BackButton onClick={() => setActiveSub(null)} />
        </div>
      )}

      {activeSub && activeSub !== "recently" && (
        <div className="mt-3">
          <p className="text-[13px] text-cm mb-2">
            {activeSub === "planning"
              ? "Planning ahead:"
              : activeSub === "memorial"
              ? "Memorial items:"
              : "Explore & learn:"}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {subTags[activeSub].map((tag) =>
              tag.href ? (
                <Link
                  key={tag.label}
                  href={tag.href}
                  className="bg-sg-p text-sg-d border border-sg-l px-3 py-[5px] rounded-[18px] text-[12px] no-underline hover:bg-sg-l hover:text-white transition-colors"
                >
                  {tag.label}
                </Link>
              ) : (
                <span
                  key={tag.label}
                  className="bg-sg-p text-sg-d border border-sg-l px-3 py-[5px] rounded-[18px] text-[12px] cursor-pointer hover:bg-sg-l hover:text-white transition-colors"
                >
                  {tag.label}
                </span>
              )
            )}
          </div>
          <BackButton onClick={() => setActiveSub(null)} />
        </div>
      )}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="block mt-3 text-[12px] text-cl bg-transparent border-0 p-0 cursor-pointer hover:text-tr"
    >
      ← Back
    </button>
  );
}
