"use client";

import { useActionState } from "react";
import { archivePrayer, logout } from "./actions";
import styles from "../pastoral.module.css";

export default function ActionForm({ prayerId }: { prayerId?: string }) {
  const [state, action, pending] = useActionState(prayerId ? archivePrayer : logout, { error: "" });
  return (
    <form action={action} aria-busy={pending} className={styles.actionForm}>
      {prayerId && <input type="hidden" name="id" value={prayerId} />}
      <button disabled={pending} className={styles.secondaryButton}>
        {pending ? "Aguarde..." : prayerId ? "Arquivar" : "Sair"}
      </button>
      {state.error && <p role="alert" className={styles.alert}>{state.error}</p>}
    </form>
  );
}
