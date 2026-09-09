"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { SpotlightRotation, type Prayer } from "./spotlight-rotation";
import styles from "./prayer-wall.module.css";

export default function PrayerWall({ churchId }: { churchId: string }) {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connectionError, setConnectionError] = useState(false);
  const [spotlight, setSpotlight] = useState<{ current: Prayer | null; previous: Prayer | null }>({ current: null, previous: null });
  const central = spotlight.current;
  const previous = prayers.find((prayer) => prayer.id === spotlight.previous?.id && prayer.id !== central?.id);

  // Bound the rendered capsules; every active request remains eligible above.
  const secondary = prayers.filter((prayer) => prayer.id !== central?.id).slice(0, 10);

  useEffect(() => {
    let disposed = false;
    let request = 0;
    const scheduler = new SpotlightRotation();
    let slot: number | undefined;

    function advance() {
      if (disposed) return;
      const next = scheduler.next();
      setSpotlight((previous) => previous.current?.id === next?.id ? previous : { current: next, previous: previous.current });
      slot = next ? window.setTimeout(advance, 6000) : undefined;
    }

    async function refresh() {
      const current = ++request;
      try {
        const names: Prayer[] = [];
        // Paginate to include names beyond the API row limit.
        for (let offset = 0; ; offset += 500) {
          const { data, error } = await supabase.from("prayer_requests")
            .select("id, name").eq("church_id", churchId).eq("status", "active")
            .order("created_at", { ascending: false }).order("id")
            .range(offset, offset + 499);
          if (disposed || current !== request) return;
          if (error) throw error;
          names.push(...data);
          if (data.length < 500) break;
        }
        scheduler.reconcile(names);
        setPrayers(names);
        if (slot === undefined) advance();
        setError("");
      } catch {
        if (!disposed && current === request) setError("Não foi possível atualizar os nomes. Tentaremos novamente automaticamente.");
      } finally {
        if (!disposed && current === request) setLoading(false);
      }
    }

    const channel = supabase.channel(`prayer-wall-${churchId}-${crypto.randomUUID()}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "prayer_requests", filter: `church_id=eq.${churchId}`,
      }, (payload) => {
        if (disposed) return;
        if ("id" in payload.new && payload.new.status === "active") {
          scheduler.noteArrival(String(payload.new.id));
        }
        void refresh();
      })
      .subscribe((status) => {
        if (disposed) return;
        setConnectionError(status !== "SUBSCRIBED");
        if (status === "SUBSCRIBED") void refresh();
      });

    void refresh();
    // Reconcile removals/status changes hidden by the active-only SELECT policy.
    const interval = window.setInterval(() => { void refresh(); }, 60000);
    return () => {
      disposed = true;
      window.clearTimeout(slot);
      window.clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [churchId]);

  return (
    <section className={styles.content} aria-label="Nomes em oração" aria-busy={loading}>
      <div className={styles.scene}>
        <div className={styles.center}>
          <h1 className={styles.title}>ESTAMOS ORANDO<span>por você!</span></h1>
          <div className={styles.spotlight} aria-live="off">
            {previous && <p key={`out-${central?.id}-${previous.id}`} className={styles.leaving} aria-hidden="true">{previous.name}</p>}
            {central ? <p key={central.id} className={styles.entering}>{central.name}</p> :
              <p className={styles.empty}>{loading ? "Carregando nomes..." : error ? "Aguardando atualização" : "Seja o primeiro a enviar um nome"}</p>}
          </div>
          <p className={styles.caption}>Cada nome, uma vida. Cada vida, uma oração.</p>
        </div>
        <ul className={styles.names} aria-label="Outros nomes em oração">
          {secondary.map((prayer, index) => <li key={prayer.id} className={styles.capsule} style={{
            "--column": index % 2 === 0 ? 1 : 3,
            "--row": Math.floor(index / 2) + 1,
            "--delay": `${index * -1.7}s`,
            "--duration": `${11 + index % 4}s`,
          } as CSSProperties}>{prayer.name}</li>)}
        </ul>
      </div>
      <div className={styles.summary}>
        <p className={styles.count} role="status"><strong>{loading ? "—" : prayers.length}</strong> {prayers.length === 1 ? "nome em oração" : "nomes em oração"}</p>
        <div className={styles.notices}>
          {error && <p role="alert">{error}</p>}
          {connectionError && <p role="status">Reconectando ao mural. Atualização automática a cada minuto.</p>}
        </div>
      </div>
    </section>
  );
}
