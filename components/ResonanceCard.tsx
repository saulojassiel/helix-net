"use client";

import { useState } from "react";

type Resonance = {
  title: string;
  description: string;
  tags: string[];
};

export default function ResonanceCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [resonances, setResonances] = useState<Resonance[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  function createResonance() {
    if (!title.trim()) return;

    setResonances([
      ...resonances,
      {
        title,
        description,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      },
    ]);

    setTitle("");
    setDescription("");
    setTags("");
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-zinc-900 p-6">
      <h2 className="text-2xl font-bold text-purple-300">🧠 Resonancias</h2>

      <p className="mt-3 text-zinc-400">Crea, conecta y expande ideas.</p>

      <button
        onClick={() => setIsOpen(true)}
        className="mt-6 rounded-full bg-purple-400 px-6 py-3 font-bold text-black"
      >
        Crear Resonancia
      </button>

      {isOpen && (
        <div className="mt-6 rounded-2xl border border-purple-500/30 bg-black/40 p-5">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Título"
            className="w-full rounded-xl border border-purple-500/30 bg-black p-3 text-white"
          />

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descripción"
            className="mt-3 h-24 w-full rounded-xl border border-purple-500/30 bg-black p-3 text-white"
          />

          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="Etiquetas: música, IA, Ableton"
            className="mt-3 w-full rounded-xl border border-purple-500/30 bg-black p-3 text-white"
          />

          <button
            onClick={createResonance}
            className="mt-4 rounded-full bg-cyan-300 px-6 py-3 font-bold text-black"
          >
            Crear
          </button>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {resonances.map((resonance, index) => (
          <div
            key={index}
            className="rounded-xl border border-purple-500/20 bg-black/40 p-4"
          >
            <h3 className="font-bold text-purple-200">{resonance.title}</h3>
            <p className="mt-2 text-sm text-zinc-400">{resonance.description}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {resonance.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}