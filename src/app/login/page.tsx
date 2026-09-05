import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (user && !error) redirect("/admin");
  return (
    <main className="mx-auto w-full max-w-lg px-6 py-16">
      <p className="mb-4 text-xl font-semibold">Prayer Cloud</p>
      <h1 className="text-3xl font-bold">Acesso do pastor</h1>
      <LoginForm />
    </main>
  );
}
