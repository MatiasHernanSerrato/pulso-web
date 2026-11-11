const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/graphql";

type GqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string,
): Promise<T> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`api ${res.status}`);
  }

  const payload = (await res.json()) as GqlResponse<T>;
  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? "graphql error");
  }
  if (!payload.data) {
    throw new Error("empty response");
  }
  return payload.data;
}
