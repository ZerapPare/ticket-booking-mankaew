// Shared presentational primitives for the Organizer + Admin dashboards.

// Page header bar (title + subtitle + optional right-side action)
export function DashboardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between border-b border-line bg-white px-10 py-7">
      <div>
        <h1 className="text-[26px] font-bold">{title}</h1>
        {subtitle && (
          <div className="mt-[2px] text-[14px] text-faint">{subtitle}</div>
        )}
      </div>
      {action}
    </div>
  );
}

// Stat card with label / big value / delta
export function StatCard({ label, value, delta, deltaColor = "#71717a" }) {
  return (
    <div className="rounded-[14px] border border-[#eee] bg-white p-[22px]">
      <div className="mb-[10px] text-[13px] text-faint">{label}</div>
      <div className="text-[28px] font-bold tracking-[-.5px]">{value}</div>
      {delta && (
        <div className="mt-2 text-[12px]" style={{ color: deltaColor }}>
          {delta}
        </div>
      )}
    </div>
  );
}

// Simple vertical bar chart (div bars). data: [{ value, day }], height in px.
export function BarChart({ data, height = 180 }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div
          key={i}
          className="flex h-full flex-1 flex-col items-center justify-end gap-2"
        >
          <div
            className="w-full rounded-t-[5px]"
            style={{
              height: `${Math.round((d.value / max) * height)}px`,
              background: d.fill || (i >= data.length - 3 ? "#7c3aed" : "#ddd6fe"),
            }}
          />
          <span className="text-[10px] text-fainter">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

// Rounded status pill
export function StatusPill({ label, color, bg }) {
  return (
    <span
      className="rounded-full px-3 py-[5px] text-[12px] font-semibold"
      style={{ color, background: bg }}
    >
      {label}
    </span>
  );
}

// Card wrapper used across dashboard sections
export function Panel({ title, action, children, className = "" }) {
  return (
    <div className={`rounded-[14px] border border-[#eee] bg-white p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-[18px] flex items-baseline justify-between">
          {title && <h2 className="text-[17px] font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// Table header row + body wrapper. cols: array of grid template; headers: string[]
export function TableShell({ template, headers, children }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#eee] bg-white">
      <div
        className="grid gap-4 border-b border-[#eee] bg-bg-soft px-6 py-[14px] font-mono text-[12px] uppercase tracking-[1px] text-fainter"
        style={{ gridTemplateColumns: template }}
      >
        {headers.map((h, i) => (
          <span key={i}>{h}</span>
        ))}
      </div>
      {children}
    </div>
  );
}

export function TableRow({ template, children }) {
  return (
    <div
      className="grid items-center gap-4 border-b border-[#f6f6f7] px-6 py-4 last:border-b-0"
      style={{ gridTemplateColumns: template }}
    >
      {children}
    </div>
  );
}
