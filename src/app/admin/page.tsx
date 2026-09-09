import Link from "next/link";
import { getAdminContext } from "@/lib/admin";
import ActionForm from "./action-form";
import styles from "../pastoral.module.css";

type Prayer = { id: string; name: string; status: string };

export default async function AdminPage() {
  const { supabase, profile, profileError } = await getAdminContext();
  let message = "";
  let church: { name: string; slug: string } | null = null;
  const prayers: Prayer[] = [];

  if (profileError) message = "Não foi possível carregar seu vínculo. Tente novamente.";
  else if (!profile) message = "Sua conta ainda não está vinculada a uma igreja. Solicite a associação ao responsável pelo Prayer Cloud.";
  else {
    const { data, error } = await supabase.from("churches").select("name, slug").eq("id", profile.church_id).maybeSingle();
    church = data;
    if (error || !church) message = "Não foi possível carregar sua igreja. Tente novamente.";
    else {
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await supabase.from("prayer_requests")
          .select("id, name, status").eq("church_id", profile.church_id)
          .order("created_at", { ascending: false }).order("id").range(offset, offset + 499);
        if (error) { message = "Não foi possível carregar os pedidos. Tente novamente."; break; }
        prayers.push(...data);
        if (data.length < 500) break;
      }
    }
  }

  return (
    <main className={styles.adminPage}>
      <div className={styles.adminContent}>
      <header className={styles.adminHeader}>
        <div className={styles.heading}>
          <p className={styles.brand}>Prayer Cloud</p>
          <h1 className={styles.title}>Painel administrativo</h1>
          {church && <p className={styles.church}>{church.name}</p>}
        </div>
        <div className={styles.adminActions}>
          {church?.slug && <Link href={`/${church.slug}/mural`} className={styles.secondaryButton}>Abrir mural</Link>}
          <ActionForm />
        </div>
      </header>
      <section className={styles.panel} aria-labelledby="prayers-title">
        <h2 id="prayers-title" className={styles.sectionTitle}>Pedidos de oração</h2>
      {message ? <p className={styles.alert} role="alert">{message}</p> : <>
        <p className={styles.counter} role="status">Nomes ativos em oração: <strong>{prayers.filter((prayer) => prayer.status === "active").length}</strong></p>
        {prayers.length === 0 && <p className={styles.empty}>Ainda não há pedidos de oração.</p>}
        <ul className={styles.prayerList}>
          {prayers.map((prayer) => <li key={prayer.id} className={`${styles.prayerCard} ${prayer.status === "active" ? "" : styles.archived}`}>
            <div className={styles.prayerInfo}><p className={styles.prayerName}>{prayer.name}</p>
              <p className={styles.status}>{prayer.status === "active" ? "Ativo" : "Arquivado"}</p></div>
            {prayer.status === "active" && <ActionForm prayerId={prayer.id} />}
          </li>)}
        </ul>
      </>}
      </section>
      </div>
    </main>
  );
}
