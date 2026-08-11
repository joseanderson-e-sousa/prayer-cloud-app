import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: prayers, error } = await supabase
    .from("prayer_requests")
    .select("id, name, created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          Estamos orando por você!
        </h1>

        <p className="mt-3 text-lg">
          Nomes em oração: {prayers?.length ?? 0}
        </p>
      </div>

      <div className="mt-10 text-center">
        {prayers?.map((prayer) => (
          <p
            key={prayer.id}
            className="my-3 text-2xl"
          >
            {prayer.name}
          </p>
        ))}
      </div>

      {error && (
        <p className="mt-6 text-center">
          Não foi possível carregar os nomes.
        </p>
      )}
    </main>
  );
}