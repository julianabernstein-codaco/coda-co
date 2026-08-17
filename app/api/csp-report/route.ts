import { NextResponse } from "next/server";
import { log } from "@/lib/log";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Collector for Content-Security-Policy violation reports. The policy in
// lib/security-headers.ts ships as Report-Only and names this route in its
// `report-uri`, so violations land here as structured log lines instead of
// breaking pages. Read them in Vercel logs by filtering event=csp.violation
// before flipping CSP_ENFORCE to true.
//
// Public and unauthenticated by necessity — browsers post reports with no
// credentials. The preview gate in proxy.ts already lets /api/* through.

// Report bodies from the report-uri directive are wrapped in a "csp-report"
// key. Only the fields worth logging are typed; the rest are ignored.
interface CspReportBody {
  "csp-report"?: {
    "document-uri"?: string;
    referrer?: string;
    "violated-directive"?: string;
    "effective-directive"?: string;
    "blocked-uri"?: string;
    "source-file"?: string;
    "line-number"?: number;
    disposition?: string;
  };
}

// Browser extensions inject their own scripts and styles into every page
// and generate a constant drizzle of violations that say nothing about our
// policy. Drop them so the signal stays readable.
const EXTENSION_SCHEMES = [
  "chrome-extension",
  "moz-extension",
  "safari-extension",
  "safari-web-extension",
  "webkit-masked-url",
];

function isExtensionNoise(uri: string | undefined): boolean {
  if (!uri) return false;
  return EXTENSION_SCHEMES.some((scheme) => uri.startsWith(scheme));
}

export async function POST(req: Request) {
  // A public endpoint that writes a log line per request is a cheap way to
  // run up a logging bill. Cap it per IP; dropped reports are no loss when
  // a real violation repeats on every page load anyway.
  const ip = await clientIp();
  const { ok } = rateLimit(`csp-report:${ip}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!ok) return new NextResponse(null, { status: 429 });

  let body: CspReportBody;
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const report = body["csp-report"];
  if (!report) return new NextResponse(null, { status: 400 });

  if (
    isExtensionNoise(report["blocked-uri"]) ||
    isExtensionNoise(report["source-file"])
  ) {
    return new NextResponse(null, { status: 204 });
  }

  log.warn("csp.violation", {
    documentUri: report["document-uri"],
    violatedDirective:
      report["effective-directive"] ?? report["violated-directive"],
    blockedUri: report["blocked-uri"],
    sourceFile: report["source-file"],
    lineNumber: report["line-number"],
    disposition: report.disposition,
  });

  // Browsers ignore the response body; 204 keeps it cheap.
  return new NextResponse(null, { status: 204 });
}
