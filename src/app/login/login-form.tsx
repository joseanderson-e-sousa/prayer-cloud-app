"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return (
    <form action={action} className="mt-8 space-y-4" aria-busy={pending}>
      <label htmlFor="email" className="block font-medium">Email</label>
      <input id="email" name="email" type="email" autoComplete="username" required
        className="w-full rounded-lg border px-4 py-3" />
      <label htmlFor="password" className="block font-medium">Senha</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required
        className="w-full rounded-lg border px-4 py-3" />
      <button disabled={pending} className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-50">
        {pending ? "Entrando..." : "Entrar"}
      </button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
