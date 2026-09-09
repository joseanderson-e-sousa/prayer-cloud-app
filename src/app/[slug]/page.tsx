import Link from "next/link";
import { getChurchBySlug } from "@/lib/church";
import PrayerForm from "../prayer-form";
import styles from "./public-prayer.module.css";

export default async function ChurchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const church = await getChurchBySlug(slug);

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <header className={styles.brand}>
          <strong>Prayer Cloud</strong>
          <p>{church.name}</p>
        </header>
        <section className={styles.invitation} aria-labelledby="prayer-title">
          <h1 id="prayer-title" className={styles.title}>
            ESTAMOS ORANDO
            <span>por você!</span>
          </h1>
          <p className={styles.subtitle}>Envie um nome para oração</p>
          <div className={styles.card}>
            <PrayerForm key={church.id} churchId={church.id} />
            <p className={styles.notice}>Seu pedido será exibido no mural de oração.</p>
          </div>
        </section>
        <footer className={styles.footer}>
          <blockquote>
            “Orai uns pelos outros.”
            <cite>Tiago 5:16</cite>
          </blockquote>
          <Link href={`/${encodeURIComponent(church.slug)}/mural`} className={styles.wallLink}>
            Ver mural de oração <span aria-hidden="true">↗</span>
          </Link>
        </footer>
      </div>
    </main>
  );
}
