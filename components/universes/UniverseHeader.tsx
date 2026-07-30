interface UniverseHeaderProps {
  title: string;
  description: string | null;
}

export default function UniverseHeader({
  title,
  description,
}: UniverseHeaderProps) {
  return (
    <header>
      <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
        Helix Universe
      </p>

      <h1 className="mt-6 text-4xl font-bold">
        {title}
      </h1>

      {description && (
        <p className="mt-4 text-zinc-400">
          {description}
        </p>
      )}
    </header>
  );
}