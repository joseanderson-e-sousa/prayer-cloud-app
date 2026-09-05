"use client";

import { useActionState } from "react";
import { archivePrayer, logout } from "./actions";

export default function ActionForm({ prayerId }: { prayerId?: string }) {
  const [state, action, pending] = useActionState(prayerId ? archivePrayer : logout, { error: "" });
  return (
    <form action={action} aria-busy={pending}>
      {prayerId && <input type="hidden" name="id" value={prayerId} />}
      <button disabled={pending} className="rounded-lg border px-4 py-2 disabled:opacity-50">
        {pending ? "Aguarde..." : prayerId ? "Arquivar" : "Sair"}
      </button>
      {state.error && <p role="alert" className="mt-2">{state.error}</p>}
    </form>
  );
}
