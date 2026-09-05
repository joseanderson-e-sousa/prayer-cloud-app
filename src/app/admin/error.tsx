"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return <main className="mx-auto px-6 py-16">
    <p role="alert">Não foi possível carregar o painel.</p>
    <button onClick={reset} className="mt-4 rounded-lg border px-4 py-2">Tentar novamente</button>
  </main>;
}
