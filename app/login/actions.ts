"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { gql } from "@/lib/api";
import { setSession } from "@/lib/session";

const LoginSchema = z.object({
  email: z.string().email("Mail invalido"),
  password: z.string().min(8, "Minimo 8 caracteres"),
});

export type LoginState = {
  error?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
};

type LoginResult = {
  login: {
    token: string;
    user: { id: string; email: string };
  };
};

const LOGIN_MUTATION = /* GraphQL */ `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
      }
    }
  }
`;

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: LoginState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "email" || key === "password") {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  try {
    const data = await gql<LoginResult>(LOGIN_MUTATION, parsed.data);
    await setSession({
      token: data.login.token,
      userId: data.login.user.id,
    });
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "No pude entrar, probá de nuevo",
    };
  }

  redirect("/dashboard");
}
