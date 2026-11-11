import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 text-center">
      <h1 className="text-5xl font-semibold tracking-tight">Pulso</h1>
      <p className="max-w-md text-balance text-lg text-muted-foreground">
        Peso, plata y lo que te late. Todo en un solo lado.
      </p>
      <Button asChild size="lg">
        <Link href="/login">Entrar</Link>
      </Button>
    </main>
  );
}
