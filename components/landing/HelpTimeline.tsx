// Interactive "stepping-stones" timeline for the landing hero's "How can
// we help you today?" box. Four life-stage moments as soft sage dots
// resting on a gentle wave, in the order a life moves through them
// (planning → dying → died → exploring), each label hanging beneath.
//
// Every moment is a real, focusable link that deepens to dark sage and
// lifts on hover/focus. A native SVG <a href> (rather than next/link) keeps
// the whole timeline a single inline SVG image while staying a genuine
// right-clickable, keyboard-navigable link; clicking is a normal document
// navigation to a different route segment.

type Stage = { x: number; y: number; l1: string; l2: string; href: string };

const STAGES: Stage[] = [
  {
    x: 60,
    y: 72,
    l1: "I'm planning",
    l2: "ahead",
    href: "/planning-ahead",
  },
  {
    x: 180,
    y: 140,
    l1: "Someone is",
    l2: "dying",
    href: "/services?lifeStage=throughout,active-dying,planning-ahead",
  },
  { x: 300, y: 72, l1: "Someone", l2: "has died", href: "/where-to-start" },
  { x: 420, y: 140, l1: "I'm just", l2: "exploring", href: "/shop" },
];

const WAVE =
  "M4,106 C24,72 40,72 60,72 S150,140 180,140 S270,72 300,72 S390,140 420,140 S460,106 476,106";

export function HelpTimeline() {
  return (
    <svg
      viewBox="0 0 480 200"
      className="w-full max-w-[440px] h-auto mx-auto block"
    >
      <path
        d={WAVE}
        fill="none"
        stroke="var(--color-sg)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      {STAGES.map((s) => {
        // Dots resting high on the wave (the crests) carry their labels
        // above the timeline; dots in the troughs keep theirs below. This
        // splits the label weight across the wave for vertical balance,
        // rather than piling every label beneath the curve.
        const above = s.y < 106;
        const labelY = above ? s.y - 33 : s.y + 30;
        return (
          <a
            key={s.l2}
            href={s.href}
            aria-label={`${s.l1} ${s.l2}`}
            className="group cursor-pointer no-underline outline-none"
          >
            <g className="transition-transform duration-200 group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5">
              <circle
                cx={s.x}
                cy={s.y}
                r="11"
                className="fill-sg opacity-20 transition-opacity group-hover:opacity-30 group-focus-visible:opacity-30"
              />
              <circle
                cx={s.x}
                cy={s.y}
                r="6.5"
                className="fill-sg transition-colors group-hover:fill-sg-d group-focus-visible:fill-sg-d"
              />
              <text
                x={s.x}
                y={labelY}
                fontSize="13"
                textAnchor="middle"
                className="fill-ch font-semibold transition-colors group-hover:fill-sg-d group-focus-visible:fill-sg-d"
              >
                <tspan x={s.x} dy="0">
                  {s.l1}
                </tspan>
                <tspan x={s.x} dy="15">
                  {s.l2}
                </tspan>
              </text>
            </g>
          </a>
        );
      })}
    </svg>
  );
}
