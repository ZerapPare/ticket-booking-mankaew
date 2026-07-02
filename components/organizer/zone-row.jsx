"use client";

// แถวแก้ไขโซน (ใช้ร่วมกันทั้งหน้าสร้างและหน้าแก้ไขอีเวนต์)
// locked = โซนนี้มียอดขายแล้ว -> ล็อกชนิดที่นั่ง + ปุ่มลบ, แก้ได้เฉพาะชื่อ/ราคา/เพิ่มความจุ
export default function ZoneRow({ z, color, onChange, onRemove, removable, locked = false }) {
  const seated = z.type === "seated";
  return (
    <div className="rounded-[12px] border border-[#eee] p-4">
      <div className="flex items-center gap-3">
        <div
          className="h-[14px] w-[14px] flex-shrink-0 rounded-[4px]"
          style={{ background: color }}
        />
        <input
          value={z.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="ชื่อโซน (เช่น VIP / ZONE A)"
          className="flex-1 rounded-[9px] border border-line-2 px-[13px] py-[10px] text-[14px] font-medium outline-none placeholder:text-fainter focus:border-accent"
        />
        <div className="flex overflow-hidden rounded-[9px] border border-line-2 text-[13px]">
          <TypeTab on={seated} disabled={locked} onClick={() => onChange({ type: "seated" })}>
            มีที่นั่ง
          </TypeTab>
          <TypeTab on={!seated} disabled={locked} onClick={() => onChange({ type: "ga" })}>
            ยืน
          </TypeTab>
        </div>
        {removable && !locked && (
          <button
            onClick={onRemove}
            className="px-1 text-[18px] text-fainter hover:text-[#dc2626]"
            aria-label="ลบโซน"
          >
            ×
          </button>
        )}
      </div>
      <div className="mt-3 flex gap-[10px]">
        <Field label="ราคา (฿)" className="w-[140px]">
          <Input type="number" value={z.price} onChange={(v) => onChange({ price: v })} placeholder="0" />
        </Field>
        {seated ? (
          <>
            <Field label="แถว (A–Z)" className="w-[120px]">
              <Input type="number" value={z.rows} onChange={(v) => onChange({ rows: v })} placeholder="10" />
            </Field>
            <Field label="ที่นั่ง/แถว" className="w-[120px]">
              <Input type="number" value={z.cols} onChange={(v) => onChange({ cols: v })} placeholder="18" />
            </Field>
            <div className="flex flex-1 items-end pb-[12px] text-[13px] text-fainter">
              รวม{" "}
              {Number(z.rows) > 0 && Number(z.cols) > 0
                ? (Number(z.rows) * Number(z.cols)).toLocaleString("en-US")
                : "—"}{" "}
              ที่นั่ง{locked && " • เพิ่มได้เท่านั้น"}
            </div>
          </>
        ) : (
          <Field label={locked ? "จำนวนบัตร (เพิ่มได้เท่านั้น)" : "จำนวนบัตร"} className="w-[220px]">
            <Input
              type="number"
              value={z.capacity}
              onChange={(v) => onChange({ capacity: v })}
              placeholder="500"
            />
          </Field>
        )}
      </div>
    </div>
  );
}

function TypeTab({ on, onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-[10px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      style={{ background: on ? "#7c3aed" : "#fff", color: on ? "#fff" : "#71717a" }}
    >
      {children}
    </button>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <div className="mb-[7px] text-[13px] text-muted">{label}</div>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-[9px] border border-line-2 px-[14px] py-[11px] text-[15px] outline-none placeholder:text-fainter focus:border-accent"
    />
  );
}