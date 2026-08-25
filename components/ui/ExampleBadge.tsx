// Marks a sample/example vendor (and their products/services) so buyers
// aren't misled into thinking a demo listing is a real, transactable one.
// Used on cards, the vendor profile hero, and the PDP.
export function ExampleBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-pl border border-line text-cm ${className}`}
    >
      Example
    </span>
  );
}
