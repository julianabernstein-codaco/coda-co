"use client";

import { useState } from "react";
import Link from "next/link";

interface SubPanel {
  id: string;
  label: string;
  content: {
    heading: string;
    body: string;
    links: { label: string; href: string }[];
  };
}

const subPanels: SubPanel[] = [
  {
    id: "recently",
    label: "Someone just died",
    content: {
      heading: "If someone just died",
      body: "You don't have to do anything immediately except be present. If the death was expected and at home, you have time. A death doula can help you navigate the next steps.",
      links: [
        { label: "Find a death doula near me →", href: "/services?type=doula" },
        { label: "Find a home funeral guide →", href: "/services?type=home-funeral" },
      ],
    },
  },
  {
    id: "planning",
    label: "I'm planning ahead",
    content: {
      heading: "Planning ahead",
      body: "The greatest gift you can give your family is clear documentation of your wishes — an advance directive, a will, and a list of your accounts.",
      links: [
        { label: "Browse planning workbooks →", href: "/shop?category=planning" },
        { label: "Find an estate attorney →", href: "/services?type=attorney" },
      ],
    },
  },
  {
    id: "memorial",
    label: "I want to create a memorial",
    content: {
      heading: "Honoring someone",
      body: "Meaningful objects and rituals help. A handmade urn, an ash pendant, a memorial portrait — these are ways of keeping someone present.",
      links: [
        { label: "Shop urns & vessels →", href: "/shop?category=urns" },
        { label: "Shop memorial goods →", href: "/shop?category=memorial" },
      ],
    },
  },
  {
    id: "learn",
    label: "I want to learn more",
    content: {
      heading: "Learning about death",
      body: "Understanding death — the process, the options, the rights you have — makes it less frightening and helps you support others better.",
      links: [
        { label: "Read our guide →", href: "/where-to-start" },
        { label: "Browse all services →", href: "/services" },
      ],
    },
  },
];

export function GuidedSearch() {
  const [open, setOpen] = useState(false);
  const [activeSub, setActiveSub] = useState<string | null>(null);

  const activePanel = subPanels.find((p) => p.id === activeSub);

  return (
    <div className="mt-4">
      <button
        onClick={() => {
          setOpen((o) => !o);
          setActiveSub(null);
        }}
        className="text-[13px] text-tr border-b border-dotted border-tr-l pb-px cursor-pointer hover:text-tr-d transition-colors bg-transparent border-0"
      >
        {open ? "Hide guided search ↑" : "Not sure where to start? Get guided →"}
      </button>

      {open && (
        <div className="mt-4 bg-white rounded-[14px] border border-[rgba(44,40,37,.1)] p-6 shadow-sm">
          <p className="text-[14px] font-medium text-ch mb-4">What brings you here today?</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {subPanels.map((panel) => (
              <button
                key={panel.id}
                onClick={() => setActiveSub(activeSub === panel.id ? null : panel.id)}
                className={[
                  "px-4 py-2 rounded-full text-[13px] border transition-all cursor-pointer",
                  activeSub === panel.id
                    ? "bg-tr text-white border-tr"
                    : "bg-white text-cm border-[rgba(44,40,37,.2)] hover:border-tr hover:text-tr",
                ].join(" ")}
              >
                {panel.label}
              </button>
            ))}
          </div>

          {activePanel && (
            <div className="bg-tr-vp rounded-[10px] px-5 py-4 border border-tr-p">
              <h3 className="font-serif text-[20px] font-light text-ch mb-2">
                {activePanel.content.heading}
              </h3>
              <p className="text-[13px] text-cm leading-relaxed mb-4">
                {activePanel.content.body}
              </p>
              <div className="flex flex-wrap gap-3">
                {activePanel.content.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-[13px] text-tr border-b border-dotted border-tr-l pb-px hover:text-tr-d transition-colors no-underline"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
