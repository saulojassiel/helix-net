export default function Nebula() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute left-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-3xl" />
      <div className="absolute right-1/4 bottom-1/3 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-3xl" />
    </div>
  );
}