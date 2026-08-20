import { PINNED_STATES, US_STATES } from "@/lib/data/usStates";

// Shared <option> set for the vendor signup state <select> (GoodsForm +
// ServicesForm). Renders the placeholder, the pinned launch-market states
// (CO, OR) at the top, a divider, then all 50 alphabetically. Value is the
// 2-letter code; the caller owns the <select> (styling + value binding).
export function StateOptions() {
  return (
    <>
      <option value="" disabled>
        State…
      </option>
      {PINNED_STATES.map((s) => (
        <option key={`pinned-${s.code}`} value={s.code}>
          {s.name}
        </option>
      ))}
      <option disabled>──────────</option>
      {US_STATES.map((s) => (
        <option key={s.code} value={s.code}>
          {s.name}
        </option>
      ))}
    </>
  );
}
