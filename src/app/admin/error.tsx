"use client";

import styles from "../pastoral.module.css";

export default function AdminError({ reset }: { reset: () => void }) {
  return <main className={styles.adminPage}>
    <div className={styles.adminContent}>
      <header className={styles.adminHeader}>
        <div><p className={styles.brand}>Prayer Cloud</p>
          <h1 className={styles.title}>Painel administrativo</h1></div>
      </header>
      <div className={styles.panel}>
        <p role="alert" className={styles.alert}>Não foi possível carregar o painel.</p>
        <button onClick={reset} className={styles.secondaryButton}>Tentar novamente</button>
      </div>
    </div>
  </main>;
}
