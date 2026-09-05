import Link from "next/link";
import { getChurchBySlug } from "@/lib/church";
import PrayerWall from "./prayer-wall";

export default async function Mural({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const church = await getChurchBySlug(slug);
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 text-center">
      <p className="mb-4 text-xl font-semibold">{church.name}</p>
      <h1 className="text-4xl font-bold">Estamos orando por você!</h1>
      <PrayerWall key={church.id} churchId={church.id} />
      <Link href={`/${encodeURIComponent(church.slug)}`} className="mt-10 inline-block underline">Enviar um nome para oração</Link>
    </main>
  );
}
