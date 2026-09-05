"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Prayer = { id: string; name: string };

export default function PrayerWall({ churchId }: { churchId: string }) {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    let disposed = false;
    let request = 0;

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
        setPrayers(names);
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
      }, () => { void refresh(); })
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
      window.clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [churchId]);

  return (
    <section className="mt-6" aria-label="Nomes em oração" aria-busy={loading}>
      <p className="text-xl" role="status">Nomes ativos em oração: {loading || error ? "—" : prayers.length}</p>
      {loading && <p className="mt-6" role="status">Carregando nomes...</p>}
      {error && <p className="mt-6" role="alert">{error}</p>}
      {connectionError && <p className="mt-4" role="status">Reconectando ao mural. Os nomes também são atualizados a cada minuto.</p>}
      {!loading && !error && prayers.length === 0 && <p className="mt-8">Ainda não há nomes em oração. Envie o primeiro nome.</p>}
      {!error && <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prayers.map((prayer) => <li key={prayer.id} className="break-words rounded-xl border p-6 text-2xl">{prayer.name}</li>)}
      </ul>}
    </section>
  );
}
