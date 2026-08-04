"use client";

interface AddIdeaPanelProps {
  title: string;
  content: string;
  isCreating: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onCreate: () => void;
}

export function AddIdeaPanel({
  title,
  content,
  isCreating,
  onTitleChange,
  onContentChange,
  onCreate,
}: AddIdeaPanelProps) {
  return (
    <section className="rounded-3xl border border-cyan-500/30 bg-zinc-950 p-6">
      <h2 className="text-2xl font-bold">
        Nueva idea
      </h2>

      <input
        value={title}
        onChange={(event) =>
          onTitleChange(event.target.value)
        }
        placeholder="Título de la idea"
        className="mt-5 w-full rounded-2xl border border-zinc-700 bg-black p-4 outline-none focus:border-cyan-300"
      />

      <textarea
        value={content}
        onChange={(event) =>
          onContentChange(event.target.value)
        }
        placeholder="Describe la idea..."
        className="mt-4 min-h-32 w-full resize-none rounded-2xl border border-zinc-700 bg-black p-4 outline-none focus:border-cyan-300"
      />

      <button
        type="button"
        onClick={onCreate}
        disabled={!title.trim() || isCreating}
        className="mt-4 rounded-full bg-cyan-300 px-6 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isCreating ? "Creando..." : "Crear idea"}
      </button>
    </section>
  );
}