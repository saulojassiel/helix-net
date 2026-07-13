"use client";
import { useState } from "react";
import { createProject } from "@/lib/projects";

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
async function handleCreateProject() {
  try {
    if (!title.trim()) {
      alert("Escribe un título.");
      return;
    }

    await createProject(title, description);

    setTitle("");
    setDescription("");
    setShowForm(false);

    alert("¡Proyecto creado!");
  } catch (error) {
  console.error(error);
  const message =
    error instanceof Error
      ? error.message
      : "Error desconocido";

  alert(message);
  
  alert(JSON.stringify(error, null, 2));
}
}

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold text-cyan-300">
        Mis Proyectos
      </h1>

      <p className="mt-3 text-zinc-400">
        Aquí vivirán todos los universos creativos de HelixNet.
      </p>

      <div className="mt-10 rounded-xl border border-cyan-500/30 p-6">
        <h2 className="text-2xl font-semibold">
          Aún no tienes proyectos
        </h2>

        <p className="mt-2 text-zinc-400">
          Crea tu primer universo creativo.
        </p>

        <button
  onClick={() => setShowForm(true)}
  className="mt-6 rounded-full bg-cyan-300 px-6 py-3 font-bold text-black hover:scale-105 transition"
>
  + Nuevo Proyecto
</button>

      </div>
      {showForm && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/70">
    <div className="w-full max-w-md rounded-xl bg-zinc-900 p-6 border border-cyan-500">

      <h2 className="text-2xl font-bold text-cyan-300">
        Nuevo Proyecto
      </h2>

      <input
         value={title}
  onChange={(e) => setTitle(e.target.value)}
  placeholder="Título"
  className="mt-6 w-full rounded-lg bg-zinc-800 p-3 outline-none"
        
      />

      <textarea
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Descripción"
  className="mt-4 w-full rounded-lg bg-zinc-800 p-3 outline-none"
/>

      <div className="mt-6 flex justify-end gap-3">

        <button
          onClick={() => setShowForm(false)}
          className="rounded-lg border border-zinc-700 px-4 py-2"
        >
          Cancelar
        </button>

        <button
  onClick={handleCreateProject}
  className="rounded-lg bg-cyan-300 px-4 py-2 font-bold text-black"
>
  Crear
</button>

        

      </div>

    </div>
  </div>
)}
    </main>
  );
}