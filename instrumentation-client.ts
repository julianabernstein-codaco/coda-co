// Vercel BotID — invisible bot protection, initialized here in Next's
// client instrumentation hook so the challenge runs on every page load
// and can attach proof-of-human headers to the protected requests below.
// The server-side half (checkBotId) lives in lib/botid.ts; a path must be
// listed here or the server check can't see those headers.
//
// We only protect the *guest* gift-card money paths — the card-stuffing /
// card-testing targets. Server actions POST to their own page's path, so we
// protect those paths (POST only). Everything else stays unprotected so the
// rest of the site carries no bot-challenge overhead.
import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    // Solo + group-gift purchase (GiftCardForm lives on /gift-cards).
    { path: "/gift-cards", method: "POST" },
    // Chipping into a group gift (ContributeForm on
    // /gift-cards/contribute/[token]). "*" matches the dynamic token segment.
    { path: "/gift-cards/contribute/*", method: "POST" },
  ],
});
