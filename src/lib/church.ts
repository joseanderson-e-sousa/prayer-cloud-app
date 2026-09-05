import "server-only";

import { notFound } from "next/navigation";
import { supabase } from "./supabase";

type Church = { id: string; name: string; slug: string };

export async function getChurchBySlug(slug: string): Promise<Church> {
  const { data, error } = await supabase
    .from("churches")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle<Church>();

  if (error) throw new Error("Não foi possível carregar a igreja.");
  if (!data) notFound();
  return data;
}
