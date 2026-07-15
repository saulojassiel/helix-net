"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { universeService } from "@/services/UniverseService";

export default function SeedExperience() {
  const [idea, setIdea] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();

  async function handlePlantSeed() {
    try {
      const question = idea.trim();

      if (question.length < 5) {
        alert("Escribe una idea de al menos 5 caracteres.");
        return;
      }

      setIsCreating(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        alert("Debes iniciar sesión.");
        router.push("/login");
        return;
      }

      const universe = await universeService.plantSeed({
        question,
        authorId: user.id,
      });

      router.push(`/universe/${universe.id}`);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo crear el universo."
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <section className="w-full max-w-3xl text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
          Helix
        </p>

        <h1 className="mt-6 text-4xl font-bold md:text-6xl">
          ¿Qué quieres hacer evolucionar hoy?
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
          Planta una intención y crea un nuevo universo.
        </p>

        <textarea
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          placeholder="Ejemplo: Quiero explorar cómo nace una conciencia antes del lenguaje..."
          className="mt-10 min-h-44 w-full resize-none rounded-3xl border border-cyan-500/30 bg-zinc-950/80 p-6 text-lg outline-none transition focus:border-cyan-300"
        />

        <button
          type="button"
          onClick={handlePlantSeed}
          disabled={!idea.trim() || isCreating}
          className="mt-6 rounded-full bg-cyan-300 px-8 py-4 font-bold text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCreating ? "Sembrando..." : "Sembrar idea"}
        </button>
      </section>
    </main>
  );
}