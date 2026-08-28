// Marks a free, admin-curated community listing (volunteer-led end-of-life
// resources like Death Cafés) so it reads as a curated resource rather than
// a paid vendor. Used on cards and the vendor profile hero.
export function CommunityBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-tr-p border border-tr-l text-tr-d ${className}`}
    >
      Community resource
    </span>
  );
}
