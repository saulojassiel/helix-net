"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Resonance = {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  created_at: string;
};

export default function ResonanceCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [resonances, setResonances] = useState<Resonance[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadResonances() {
      setLoading(true);
      setMessage("");

      const { data, error } = await supabase
        .from("resonances")
        .select("id, title, description, tags, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setMessage("No se pudieron cargar las resonancias.");
        setLoading(false);
        return;
      }

      setResonances(data ?? []);
      setLoading(false);
    }

    void loadResonances();
  }, []);

  const filteredResonances = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return resonances;

    return resonances.filter((resonance) => {
      const resonanceTags = resonance.tags ?? [];

      return (
        resonance.title.toLowerCase().includes(query) ||
        (resonance.description ?? "").toLowerCase().includes(query) ||
        resonanceTags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [resonances, search]);

  async function createResonance() {
    const cleanTitle = title.trim();

    if (!cleanTitle || saving) return;

    const cleanTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("resonances")
      .insert({
        title: cleanTitle,
        description: description.trim(),
        tags: cleanTags,
      })
      .select("id, title, description, tags, created_at")
      .single();

    if (error) {
      console.error(error);
      setMessage("No se pudo guardar la resonancia.");
      setSaving(false);
      return;
    }

    setResonances((current) => [data, ...current]);
    setTitle("");
    setDescription("");
    setTags("");
    setIsOpen(false);
    setSaving(false);
    setMessage("Resonancia guardada en la nube.");
  }

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-zinc-900 p-6 shadow-[0_0_30px_#7c3aed40]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-purple-300">
            🧠 Resonancias
          </h2>

          <p className="mt-2 text-zinc-400">
            {resonances.length} guardadas en Supabase
          </p>
        </div>

        <button
          onClick={() => setIsOpen((current) => !current)}
          className="rounded-full bg-purple-400 px-6 py-3 font-bold text-black transition hover:scale-105"
        >
          {isOpen ? "Cancelar" : "Crear Resonancia"}
        </button>
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar por título, descripción o etiqueta..."
        className="mt-6 w-full rounded-xl border border-purple-500/30 bg-black p-3 text-white outline-none"
      />

      {isOpen && (
        <div className="mt-6 rounded-2xl border border-purple-500/30 bg-black/40 p-5">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Título"
            className="w-full rounded-xl border border-purple-500/30 bg-black p-3 text-white outline-none"
          />

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descripción"
            className="mt-3 h-24 w-full rounded-xl border border-purple-500/30 bg-black p-3 text-white outline-none"
          />

          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="Etiquetas: helix, ia, futuro"
            className="mt-3 w-full rounded-xl border border-purple-500/30 bg-black p-3 text-white outline-none"
          />

          <button
            onClick={createResonance}
            disabled={saving || !title.trim()}
            className="mt-4 rounded-full bg-cyan-300 px-6 py-3 font-bold text-black transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar en Supabase"}
          </button>
        </div>
      )}

      {message && (
        <p className="mt-4 text-sm text-cyan-300">
          {message}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {loading && (
          <p className="text-zinc-400">Cargando resonancias...</p>
        )}

        {!loading && filteredResonances.length === 0 && (
          <p className="text-zinc-400">
            No hay resonancias que coincidan.
          </p>
        )}

        {filteredResonances.map((resonance) => (
          <article
            key={resonance.id}
            className="rounded-xl border border-purple-500/20 bg-black/40 p-4"
          >
            <h3 className="font-bold text-purple-200">
              {resonance.title}
            </h3>

            <p className="mt-2 text-sm text-zinc-400">
              {resonance.description || "Sin descripción"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {(resonance.tags ?? []).map((tag) => (
                <span
                  key={`${resonance.id}-${tag}`}
                  className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}