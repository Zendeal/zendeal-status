import { runChecks } from "@/lib/checks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET() {
  const payload = await runChecks();
  return Response.json(payload, {
    status: payload.overall === "outage" ? 503 : 200,
    headers: CORS,
  });
}
