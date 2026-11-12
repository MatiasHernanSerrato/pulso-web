import { redirect } from "next/navigation";

import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { gql } from "@/lib/api";
import { getSession } from "@/lib/session";

type MeQuery = {
  me: {
    id: string;
    email: string;
  };
};

const ME = /* GraphQL */ `
  query Me {
    me {
      id
      email
    }
  }
`;

async function getViewerEmail(token: string): Promise<string> {
  try {
    const data = await gql<MeQuery>(ME, undefined, token);
    return data.me.email;
  } catch {
    // si la api esta caida, devolvemos algo para que la UI no se rompa
    return "vos";
  }
}

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const email = await getViewerEmail(session.token);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header email={email} />
        <div className="flex-1 px-6 py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
