import Link from "next/link";
import { getChurchBySlug } from "@/lib/church";
import PrayerWall from "./prayer-wall";
import FullscreenButton from "./fullscreen-button";
import styles from "./prayer-wall.module.css";

export default async function Mural({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const church = await getChurchBySlug(slug);
  return (
    <main className={styles.wall}>
      <FullscreenButton />
      <header className={styles.header}>
        <div className={styles.brand}><strong>Prayer Cloud</strong><span>{church.name}</span></div>
        <blockquote>Orai uns pelos outros.<cite>Tiago 5:16</cite></blockquote>
      </header>
      <PrayerWall key={church.id} churchId={church.id} />
      <footer className={styles.footer}>
        <p>MAIS QUE PEDIDOS<strong>PESSOAS EM ORAÇÃO</strong></p>
        <Link href={`/${encodeURIComponent(church.slug)}`}>Enviar um nome para oração <span aria-hidden="true">↗</span></Link>
        <p>JUNTOS EM FÉ<strong>POR UM MUNDO MELHOR</strong></p>
      </footer>
    </main>
  );
}
