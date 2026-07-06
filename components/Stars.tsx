export default function Stars() {
  const stars = Array.from({ length: 120 }, (_, i) => {
    const x = Math.sin(i * 12.9898) * 43758.5453;
    const y = Math.sin(i * 78.233) * 24634.6345;
    const s = Math.sin(i * 39.425) * 96234.1234;

    return {
      size: Math.abs(s % 3) + 1,
      left: Math.abs(x % 100),
      top: Math.abs(y % 100),
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white opacity-80"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.left}%`,
            top: `${star.top}%`,
            boxShadow: "0 0 10px #ffffff",
          }}
        />
      ))}
    </div>
  );
}