import { CONFIG_ID } from "@/lib/launch";
import { prisma } from "@/lib/db";

// The incident kill switch, read on the request hot path.
//
// `PREVIEW_PASSWORD` (env) can only change on a Vercel redeploy, which runs
// `prisma migrate deploy` first and takes minutes — the wrong shape for "take
// the site private right now". This flag lives in `PlatformConfig` instead,
// alongside `launchedAt` / `giftCardsEnabled`, so an admin flips it from
// /admin/launch and it takes effect within SITE_PRIVATE_TTL_MS with no
// deploy, no migration, and no build.
//
// `proxy.ts` runs for every non-asset request, so this read is cached in
// module scope with a short TTL. One query per instance per TTL, not one per
// request. The TTL is the trade: how stale the switch may be vs. how much DB
// traffic the gate costs. 15s keeps the promise of "private within seconds"
// while making the query rate negligible.

export const SITE_PRIVATE_TTL_MS = 15_000;

export interface SitePrivateState {
  enabled: boolean;
  // bcrypt hash of the bypass password. Null means no password has been set,
  // which the admin action refuses to pair with `enabled: true`.
  passwordHash: string | null;
}

const PUBLIC: SitePrivateState = { enabled: false, passwordHash: null };

let cache: { value: SitePrivateState; at: number } | null = null;
// Dedupes concurrent misses: a cold instance taking 50 concurrent requests
// issues one query, not fifty.
let inflight: Promise<SitePrivateState> | null = null;

export async function getSitePrivateState(): Promise<SitePrivateState> {
  if (cache && Date.now() - cache.at < SITE_PRIVATE_TTL_MS) return cache.value;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const cfg = await prisma.platformConfig.findUnique({
        where: { id: CONFIG_ID },
        select: { sitePrivate: true, sitePrivatePasswordHash: true },
      });
      const value: SitePrivateState = {
        enabled: cfg?.sitePrivate ?? false,
        passwordHash: cfg?.sitePrivatePasswordHash ?? null,
      };
      cache = { value, at: Date.now() };
      return value;
    } catch {
      // Serve the last known value through a DB blip rather than flapping the
      // gate open. With no cached value at all we fall back to "not private":
      // the unlock password lives in the same unreachable row, so engaging the
      // gate here would raise a wall nobody — including the team — could get
      // past, while every page behind it is already failing on its own
      // queries. `PREVIEW_PASSWORD` is unaffected and still gates
      // independently, so this never widens access beyond the env setting.
      return cache?.value ?? PUBLIC;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

// Drops the cached value so an admin toggle applies on the very next request
// instead of waiting out the TTL. Only reaches the instance that served the
// toggle — other instances converge within the TTL, which is the guarantee
// the switch actually makes.
export function clearSitePrivateCache(): void {
  cache = null;
}
