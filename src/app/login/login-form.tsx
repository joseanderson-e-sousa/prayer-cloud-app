"use client";

import { useActionState } from "react";
import { login } from "./actions";
import styles from "../pastoral.module.css";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return (
    <form action={action} className={styles.loginCard} aria-busy={pending}>
      <div className={styles.field}>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="username" required
        className={styles.input} />
      </div>
      <div className={styles.field}>
      <label htmlFor="password">Senha</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required
        className={styles.input} />
      </div>
      <button disabled={pending} className={styles.primaryButton}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
      {state.error && <p role="alert" className={styles.alert}>{state.error}</p>}
    </form>
  );
}
