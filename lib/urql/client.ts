import {
  cacheExchange,
  createClient,
  fetchExchange,
  ssrExchange,
  type Client,
  type SSRExchange,
} from "@urql/core";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/graphql";

type AuthContext = {
  token?: string;
};

export type UrqlClientPair = {
  client: Client;
  ssr: SSRExchange;
};

// Para RSC + server actions: creamos un cliente por request con el token del
// usuario, evitando que la cache se comparta entre sesiones.
export function makeServerClient(ctx: AuthContext = {}): UrqlClientPair {
  const ssr = ssrExchange({ isClient: false });
  const client = createClient({
    url: API_URL,
    exchanges: [cacheExchange, ssr, fetchExchange],
    suspense: false,
    requestPolicy: "cache-first",
    fetchOptions: () => ({
      headers: ctx.token ? { Authorization: `Bearer ${ctx.token}` } : {},
      // next cachea POST por default; forzamos no-store para RSC fetches
      cache: "no-store",
    }),
  });
  return { client, ssr };
}

// Para client components: hidrata el SSR data que viene del server.
let browserClient: UrqlClientPair | null = null;

export function getBrowserClient(initialState?: unknown): UrqlClientPair {
  if (browserClient) return browserClient;
  const ssr = ssrExchange({
    isClient: true,
    initialState: initialState as never,
  });
  const client = createClient({
    url: "/api/graphql",
    exchanges: [cacheExchange, ssr, fetchExchange],
    suspense: false,
    requestPolicy: "cache-and-network",
  });
  browserClient = { client, ssr };
  return browserClient;
}

// util para los tests y para reset en dev
export function _resetBrowserClient() {
  browserClient = null;
}
