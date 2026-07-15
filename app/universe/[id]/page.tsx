import { supabase } from "@/lib/supabase";

interface UniversePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UniversePage({
  params,
}: UniversePageProps) {
  const { id } = await params;

  const { data: universe, error } = await supabase
    .from("universes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !universe) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <h1 className="text-3xl font-bold">
          Universo no encontrado
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
        Helix Universe
      </p>

      <h1 className="mt-6 text-4xl font-bold">
        {universe.title}
      </h1>

      <p className="mt-4 text-zinc-400">
        {universe.description}
      </p>

      <p className="mt-8 break-all text-sm text-cyan-200">
        {universe.id}
      </p>
    </main>
  );
}