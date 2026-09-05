"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(_state: { error: string }, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return { error: "Informe email e senha." };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: "Não foi possível entrar. Verifique seu email e senha e tente novamente." };
  } catch {
    return { error: "Não foi possível conectar. Tente novamente." };
  }
  redirect("/admin");
}
