"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { logoutAction } from "@/app/dashboard/actions";

export function LogoutButton() {
  const [pending, start] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => start(() => logoutAction())}
    >
      {pending ? "Saliendo..." : "Salir"}
    </Button>
  );
}
