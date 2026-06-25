import { auth } from "@/auth";
import {
  getWaitlistSignups,
  WAITLIST_INTEREST_LABELS,
} from "@/lib/api/waitlist";

// CSV export of the full waitlist, admin-gated. Returned as a download so
// the list can be pulled straight into an email tool (Resend broadcasts,
// Mailchimp, etc.) on launch day.
export const dynamic = "force-dynamic";

// Wrap a field for CSV: quote and double any embedded quotes. Guards
// against commas / newlines in stored data breaking the column layout.
function csvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const signups = await getWaitlistSignups();

  const header = ["email", "interest", "joined_at", "updated_at"];
  const rows = signups.map((s) =>
    [
      s.email,
      WAITLIST_INTEREST_LABELS[s.interest],
      s.createdAt.toISOString(),
      s.updatedAt.toISOString(),
    ]
      .map(csvField)
      .join(","),
  );
  const csv = [header.map(csvField).join(","), ...rows].join("\r\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="codaco-waitlist.csv"',
      "Cache-Control": "no-store",
    },
  });
}
