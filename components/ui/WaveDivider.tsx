/**
 * Section divider.
 *
 * The airy page treatment (see `app/globals.css`) removed the old solid color
 * banners in favor of the ombre body background, so this no longer draws a
 * colored wave. It renders a slim, neutral tapered rule — styled by
 * `.section-divider-rule` — that separates sections over the ombre while
 * preserving the previous vertical rhythm.
 *
 * `topColor` / `bottomColor` are accepted for backward compatibility with the
 * existing call sites but are no longer used; they can be dropped in a
 * follow-up cleanup.
 */
interface WaveDividerProps {
  topColor?: string;
  bottomColor?: string;
}

export function WaveDivider(_props: WaveDividerProps = {}) {
  return (
    <div className="section-divider pb-[60px] -mb-[60px]" aria-hidden="true">
      <div className="section-divider-rule h-[60px]" />
    </div>
  );
}
