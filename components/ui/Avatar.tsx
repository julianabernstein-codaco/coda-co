type AvatarSize = "sm" | "md" | "lg";
type AvatarTone = "sage" | "terracotta";

const sizeClass: Record<AvatarSize, string> = {
  sm: "avatar-sm",
  md: "avatar-md",
  lg: "avatar-lg",
};

interface AvatarProps {
  initials: string;
  size?: AvatarSize;
  tone?: AvatarTone;
  className?: string;
}

export function Avatar({
  initials,
  size = "md",
  tone = "sage",
  className = "",
}: AvatarProps) {
  return (
    <span
      className={`avatar ${sizeClass[size]} ${tone === "terracotta" ? "avatar-tr" : ""} ${className}`.trim()}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
