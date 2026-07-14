"use client";

import { useState } from "react";

export default function SeedExperience() {
  const [idea, setIdea] = useState("");

  function handlePlantSeed() {
    const trimmedIdea = idea.trim();

    if (trimmedIdea.length < 5) {
      alert("Escribe una idea de al menos 5 caracteres.");
      return;
    }

    console.log("Semilla:", trimmedIdea);
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
          Planta una intención. Helix la convertirá en la primera semilla de
          un nuevo universo creativo.
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
          className="mt-6 rounded-full bg-cyan-300 px-8 py-4 font-bold text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!idea.trim()}
        >
          Sembrar idea
        </button>
      </section>
    </main>
  );
}