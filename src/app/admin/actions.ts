"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export async function archivePrayer(_state: { error: string }, formData: FormData) {
  const { supabase, profile, profileError } = await getAdminContext();
  if (profileError || !profile) return { error: "Sua conta não tem uma igreja disponível." };
  const id = formData.get("id");
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { error: "Pedido inválido." };
  }
  try {
    const { data, error } = await supabase.from("prayer_requests")
      .update({ status: "archived" }).eq("id", id)
      .eq("church_id", profile.church_id).eq("status", "active").select("id");
    if (error || !data?.length) return { error: "Não foi possível arquivar. Atualize a página e tente novamente." };
  } catch {
    return { error: "Não foi possível conectar. Tente novamente." };
  }
  revalidatePath("/admin");
  return { error: "" };
}

export async function logout() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) return { error: "Não foi possível sair. Tente novamente." };
  } catch {
    return { error: "Não foi possível conectar. Tente novamente." };
  }
  redirect("/login");
}
