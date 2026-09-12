import { catalogIssues } from "@/lib/content";

export function GET() {
  const issues = catalogIssues();
  return Response.json({ ok: issues.length === 0, count: issues.length, issues });
}
