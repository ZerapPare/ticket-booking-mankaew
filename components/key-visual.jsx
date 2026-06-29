/*
  Gradient placeholder for an event poster / key visual.
  Per dist/docs/README.md every image is a placeholder — replace this with a real
  <Image> (Supabase Storage poster_url) once assets exist. Keeping the gradient +
  diagonal stripe + mono badge so the layout/spacing stays pixel-faithful.
*/
export default function KeyVisual({
  grad,
  label = "KEY VISUAL",
  className = "",
  children,
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: grad }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg,transparent 0 12px, rgba(0,0,0,.022) 12px 13px)",
        }}
      />
      {label && (
        <div className="absolute left-3 top-3 rounded bg-white/[.72] px-2 py-1 font-mono text-[10px] tracking-wide text-[#52525b]">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
