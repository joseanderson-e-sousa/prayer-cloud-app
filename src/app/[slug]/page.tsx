import Link from "next/link";
import { getChurchBySlug } from "@/lib/church";
import PrayerForm from "../prayer-form";

export default async function ChurchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const church = await getChurchBySlug(slug);

  return (
    <main className="mx-auto w-full max-w-lg px-6 py-16">
      <p className="mb-4 text-xl font-semibold">{church.name}</p>
      <h1 className="text-3xl font-bold">Envie um nome para oração</h1>
      <p className="mt-4">Vamos orar juntos. O nome enviado ficará visível no mural público.</p>
      <PrayerForm key={church.id} churchId={church.id} />
      <Link href={`/${encodeURIComponent(church.slug)}/mural`} className="mt-8 inline-block underline">Ver mural de oração</Link>
    </main>
  );
}
