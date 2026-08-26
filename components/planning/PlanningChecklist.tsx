"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

// A tickable checklist for /planning-ahead. The items themselves are
// authored in the page (an RSC) and passed down as children, so all the
// copy — including its links — stays server-rendered; this component only
// owns the "which boxes are ticked" state.
//
// Progress is localStorage-backed, deliberately mirroring CartProvider /
// SavedProvider: there's no per-user checklist table (see
// docs/data-model-evolution.md), so ticks live in the browser. Item ids are
// stable slugs, so reordering or re-wording an item keeps its tick; deleting
// one drops it on the next save.

export interface ChecklistItem {
  id: string;
  // The bolded opening clause — the item's "title" as it reads in the
  // sentence, so the list scans without rewriting the copy.
  lead: string;
  body: ReactNode;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  items: ChecklistItem[];
}

const STORAGE_KEY = "coda-planning-checklist";

export function PlanningChecklist({ groups }: { groups: ChecklistGroup[] }) {
  const [done, setDone] = useState<string[]>([]);
  // False until localStorage has been read on mount. The first paint always
  // renders every box empty so the server and client markup agree; ticks
  // appear once hydrated.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setDone(parsed.filter((v): v is string => typeof v === "string"));
        }
      }
    } catch {
      // ignore — a corrupt or unavailable store just means "nothing ticked"
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
    } catch {
      // ignore — private browsing / full quota
    }
  }, [done, hydrated]);

  const toggle = useCallback((id: string) => {
    setDone((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  }, []);

  const allIds = useMemo(
    () => groups.flatMap((g) => g.items.map((i) => i.id)),
    [groups],
  );
  const total = allIds.length;
  const completed = hydrated ? allIds.filter((id) => done.includes(id)).length : 0;

  return (
    <div>
      <ChecklistProgress
        completed={completed}
        total={total}
        onClear={() => setDone([])}
      />

      {groups.map((group) => (
        <section key={group.id} className="mt-9">
          <h2 className="font-serif text-[28px] font-light text-ch mb-4">
            {group.title}
          </h2>
          <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
            {group.items.map((item) => (
              <ChecklistRow
                key={item.id}
                item={item}
                checked={hydrated && done.includes(item.id)}
                onToggle={() => toggle(item.id)}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ChecklistProgress({
  completed,
  total,
  onClear,
}: {
  completed: number;
  total: number;
  onClear: () => void;
}) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="card-surface px-5 py-4">
      <div className="flex items-baseline justify-between gap-4 flex-wrap mb-2.5">
        <p className="text-[15px] text-cm m-0">
          <span className="text-sg-d font-semibold">{completed}</span> of {total}{" "}
          {completed === 1 ? "step" : "steps"} done
        </p>
        {completed > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[13px] text-cl hover:text-tr transition-colors cursor-pointer bg-transparent border-0 p-0"
          >
            Clear all
          </button>
        )}
      </div>
      <div
        className="h-1.5 rounded-pill bg-sg-p overflow-hidden"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Planning checklist progress"
      >
        <div
          className="h-full bg-sg rounded-pill transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[13px] text-cl mt-2.5 mb-0 leading-relaxed">
        Tick things off as you go — your progress is saved in this browser, on
        this device only. Nothing is sent to us.
      </p>
    </div>
  );
}

function ChecklistRow({
  item,
  checked,
  onToggle,
}: {
  item: ChecklistItem;
  checked: boolean;
  onToggle: () => void;
}) {
  // The box and the bolded lead clause are the toggle; the rest of the item
  // is plain text. Wrapping the whole row in a <label> would be a nicer hit
  // target, but several items carry links — and a click on a link inside a
  // label also activates the control — so the toggle stops at the lead.
  const inputId = `planning-${item.id}`;
  return (
    <li
      className={`card-surface card-surface-hover-sg flex gap-3 py-4 transition-opacity ${
        checked ? "opacity-75" : ""
      }`}
    >
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="sr-only peer"
      />
      <label htmlFor={inputId} className="shrink-0 cursor-pointer py-1 pr-0.5">
        <span
          aria-hidden="true"
          className={`flex items-center justify-center w-[19px] h-[19px] rounded-[5px] border-[1.5px] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-sg peer-focus-visible:ring-offset-2 ${
            checked ? "bg-sg-d border-sg-d" : "bg-white border-sg-l"
          }`}
        >
          {checked && (
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 6.3 L4.8 8.6 L9.5 3.6"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </label>
      <p
        className={`text-[16px] leading-[1.75] m-0 ${
          checked ? "text-cl" : "text-cm"
        }`}
      >
        <label
          htmlFor={inputId}
          className={`font-semibold cursor-pointer transition-colors ${
            checked ? "text-cm" : "text-ch hover:text-sg-d"
          }`}
        >
          {item.lead}
        </label>{" "}
        {item.body}
      </p>
    </li>
  );
}
