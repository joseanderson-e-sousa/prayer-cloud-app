import styles from "../pastoral.module.css";

export default function Loading() {
  return <main className={styles.adminPage}>
    <div className={styles.adminContent}>
      <header className={styles.adminHeader}>
        <div><p className={styles.brand}>Prayer Cloud</p>
          <h1 className={styles.title}>Painel administrativo</h1></div>
      </header>
      <div className={styles.panel}><p role="status">Carregando painel...</p></div>
    </div>
  </main>;
}
