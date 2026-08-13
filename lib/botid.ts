import { checkBotId } from "botid/server";
import { log } from "@/lib/log";

// Server-side half of Vercel BotID. Call at the top of a guest-facing money
// action; the action's page path must also be listed in
// instrumentation-client.ts or checkBotId() has no proof-of-human headers to
// read and will treat every caller as unverified.
//
// Fail-open on infra errors: a BotID outage must never block a real buyer
// mid-checkout — Stripe Radar is the backstop on the payment itself. We only
// turn away a *confident* bot classification. In dev/preview without the
// Vercel challenge wired up, checkBotId() bypasses (isBot: false), so local
// flows are unaffected.
export async function isBotRequest(context: string): Promise<boolean> {
  try {
    const { isBot } = await checkBotId();
    if (isBot) log.warn("botid.blocked", { context });
    return isBot;
  } catch (err) {
    log.error("botid.check_failed", { context, err });
    return false;
  }
}
