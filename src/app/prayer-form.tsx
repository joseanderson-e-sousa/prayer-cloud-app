"use client";

import { useRef, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

export default function PrayerForm({ churchId }: { churchId: string }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const submitting = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    setSuccess(false);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Digite um nome para enviar.");
      return;
    }
    submitting.current = true;
    setLoading(true);
    try {
      const { error } = await supabase.from("prayer_requests").insert({
        name: trimmedName,
        church_id: churchId,
        status: "active",
      });
      if (error) throw error;
      setName("");
      setSuccess(true);
    } catch {
      setError("Não foi possível confirmar o envio. Confira o mural antes de tentar novamente.");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4" aria-busy={loading}>
      <label htmlFor="name" className="block font-medium">Nome para oração</label>
      <input id="name" name="name" type="text" value={name}
        onChange={(event) => { setName(event.target.value); setSuccess(false); setError(""); }}
        required disabled={loading} aria-describedby={error ? "form-error" : undefined}
        className="w-full rounded-lg border px-4 py-3 disabled:opacity-50" />
      <button type="submit" disabled={loading}
        className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-50">
        {loading ? "Enviando..." : "Enviar nome"}
      </button>
      {error && <p id="form-error" role="alert">{error}</p>}
      {success && <p role="status">Nome enviado com sucesso! Estamos orando por você.</p>}
    </form>
  );
}
