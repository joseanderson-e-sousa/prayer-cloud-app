import { getAdminContext } from "@/lib/admin";
import ActionForm from "./action-form";

type Prayer = { id: string; name: string; status: string };

export default async function AdminPage() {
  const { supabase, profile, profileError } = await getAdminContext();
  let message = "";
  let church: { name: string } | null = null;
  const prayers: Prayer[] = [];

  if (profileError) message = "Não foi possível carregar seu vínculo. Tente novamente.";
  else if (!profile) message = "Sua conta ainda não está vinculada a uma igreja. Solicite a associação ao responsável pelo Prayer Cloud.";
  else {
    const { data, error } = await supabase.from("churches").select("name").eq("id", profile.church_id).maybeSingle();
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
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Painel administrativo</h1>
        <ActionForm />
      </header>
      {church && <h2 className="mt-6 text-2xl font-semibold">{church.name}</h2>}
      {message ? <p className="mt-6" role="alert">{message}</p> : <>
        <p className="mt-4" role="status">Nomes ativos em oração: {prayers.filter((prayer) => prayer.status === "active").length}</p>
        {prayers.length === 0 && <p className="mt-8">Ainda não há pedidos de oração.</p>}
        <ul className="mt-8 space-y-4">
          {prayers.map((prayer) => <li key={prayer.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4">
            <div className="min-w-0"><p className="break-words text-lg">{prayer.name}</p>
              <p className="text-sm">{prayer.status === "active" ? "Ativo" : "Arquivado"}</p></div>
            {prayer.status === "active" && <ActionForm prayerId={prayer.id} />}
          </li>)}
        </ul>
      </>}
    </main>
  );
}
