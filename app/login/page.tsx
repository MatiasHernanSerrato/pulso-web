import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { LoginForm } from "./login-form";

export const metadata = {
  title: "Entrar | Pulso",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="gap-1">
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <CardDescription>
            Con tu mail y la contrasena que pusiste al crear la cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <LoginForm />
          <p className="text-center text-xs text-muted-foreground">
            No tenes cuenta?{" "}
            <Link href="/signup" className="underline underline-offset-4">
              Crear una
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
