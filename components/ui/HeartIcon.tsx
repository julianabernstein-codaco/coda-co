// Shared wishlist heart. `currentColor` for both stroke and fill so it
// inherits the surrounding text color; pass `filled` for the saved state.
export function HeartIcon({ filled = false, size = 14 }: { filled?: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={filled ? "currentColor" : "none"}
      aria-hidden="true"
    >
      <path
        d="M8 13.6 C8 13.6 2.2 9.9 2.2 5.9 C2.2 3.8 3.9 2.6 5.6 2.6 C6.8 2.6 7.6 3.3 8 4 C8.4 3.3 9.2 2.6 10.4 2.6 C12.1 2.6 13.8 3.8 13.8 5.9 C13.8 9.9 8 13.6 8 13.6 Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
