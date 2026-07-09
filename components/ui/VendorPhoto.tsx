import Image from "next/image";

type VendorPhotoSize = "sm" | "md" | "lg" | "xl";
type VendorPhotoTone = "sage" | "terracotta";

const sizeClass: Record<VendorPhotoSize, string> = {
  sm: "vendor-photo-sm",
  md: "vendor-photo-md",
  lg: "vendor-photo-lg",
  xl: "vendor-photo-xl",
};

// Matches the outer .vendor-photo-{size} dimensions in globals.css. The
// disc inside is 84% of the outer, but the difference doesn't matter for
// picking a source from the next/image device-sizes ladder.
const sizesAttr: Record<VendorPhotoSize, string> = {
  sm: "36px",
  md: "48px",
  lg: "64px",
  xl: "128px",
};

interface VendorPhotoProps {
  src?: string | null;
  alt?: string;
  initials: string;
  size?: VendorPhotoSize;
  tone?: VendorPhotoTone;
  className?: string;
  /**
   * CSS `object-position` for the cropped image (e.g. "50% 25%" to move the
   * visible crop toward the top of the photo). Defaults to centered.
   */
  objectPosition?: string;
  /**
   * Scale the image inside the circle. Values < 1 shrink it, leaving a thin
   * cream ring; the image is kept circular so it never shows square corners.
   */
  objectScale?: number;
}

export function VendorPhoto({
  src,
  alt,
  initials,
  size = "md",
  tone = "sage",
  className = "",
  objectPosition,
  objectScale,
}: VendorPhotoProps) {
  const imgStyle =
    objectPosition || objectScale !== undefined
      ? {
          objectPosition,
          ...(objectScale !== undefined
            ? { transform: `scale(${objectScale})`, borderRadius: "9999px" }
            : {}),
        }
      : undefined;

  return (
    <span
      className={`vendor-photo ${sizeClass[size]} ${tone === "terracotta" ? "vendor-photo-tr" : ""} ${className}`.trim()}
    >
      <span className="vendor-photo-disc">
        {src ? (
          <Image
            src={src}
            alt={alt ?? ""}
            fill
            sizes={sizesAttr[size]}
            className="vendor-photo-img"
            style={imgStyle}
          />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </span>
    </span>
  );
}
