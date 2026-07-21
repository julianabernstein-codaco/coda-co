interface Step {
  label: string;
}

interface StepsBarProps {
  steps: Step[];
  current: number; // 0-indexed
}

export function StepsBar({ steps, current }: StepsBarProps) {
  return (
    <div className="flex items-center px-10 py-4 bg-white border-b border-[rgba(44,40,37,.07)] overflow-x-auto">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={[
                  "w-7 h-7 rounded-full flex items-center justify-center text-[15px] font-medium border transition-colors",
                  done
                    ? "bg-tr border-tr text-white"
                    : active
                    ? "bg-white border-tr text-tr"
                    : "bg-white border-[rgba(44,40,37,.2)] text-cl",
                ].join(" ")}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className={[
                  "text-[15px] whitespace-nowrap",
                  done || active ? "text-ch font-medium" : "text-cl",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={[
                  "h-px w-10 mx-3",
                  done ? "bg-tr" : "bg-[rgba(44,40,37,.15)]",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
