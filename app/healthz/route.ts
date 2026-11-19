import { NextResponse } from "next/server";

// healthz para que vercel y los uptime checks pregunten algo barato.
// No tocamos la api desde aca a proposito: si pulso-api esta caido no
// quiero que la web aparezca caida tambien en status pages.

export const dynamic = "force-dynamic";
export const runtime = "edge";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "pulso-web",
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
      region: process.env.VERCEL_REGION ?? "local",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
