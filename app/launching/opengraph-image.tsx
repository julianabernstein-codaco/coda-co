import { ImageResponse } from "next/og";

// Social-share preview card (1200×630). Rendered with system fonts only —
// no external font fetch — so it builds without network access. Next also
// reuses this as the Twitter image when no twitter-image file is present.
// Brand hex literals are inline here (image generation can't read the CSS
// `@theme` tokens); this file is outside the className drift rules.

export const runtime = "nodejs";
export const alt =
  "CodaCo — a curated marketplace for death and dying. Launching soon in Boulder, CO & Portland, OR.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FAF9F7",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 34,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#C1634F",
            marginBottom: 28,
          }}
        >
          Launching soon
        </div>

        <div style={{ display: "flex", fontSize: 96, fontWeight: 600, lineHeight: 1 }}>
          <span style={{ color: "#C1634F" }}>Coda</span>
          <span style={{ color: "#7A9E82" }}>Co</span>
        </div>

        <div
          style={{
            fontSize: 36,
            fontStyle: "italic",
            color: "#2C2825",
            marginTop: 28,
            textAlign: "center",
          }}
        >
          A curated marketplace for death and dying
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 44,
            fontSize: 30,
            color: "#2C2825",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <span
            style={{
              backgroundColor: "#ffffff",
              border: "2px solid #D4876F",
              borderRadius: 9999,
              padding: "10px 26px",
            }}
          >
            Boulder, CO
          </span>
          <span
            style={{
              backgroundColor: "#ffffff",
              border: "2px solid #D4876F",
              borderRadius: 9999,
              padding: "10px 26px",
            }}
          >
            Portland, OR
          </span>
        </div>
      </div>
    ),
    size,
  );
}
