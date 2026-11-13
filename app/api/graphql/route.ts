import { NextResponse, type NextRequest } from "next/server";

import { getSession } from "@/lib/session";

// Proxy GraphQL para que el browser no tenga que conocer la API_URL completa
// y para inyectarle el token del usuario desde la cookie httpOnly.
const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/graphql";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { errors: [{ message: "no session" }] },
      { status: 401 },
    );
  }

  const body = await req.text();

  const upstream = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
    body,
    cache: "no-store",
  });

  // pasamos el body tal cual, incluyendo errores graphql
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

export const dynamic = "force-dynamic";
