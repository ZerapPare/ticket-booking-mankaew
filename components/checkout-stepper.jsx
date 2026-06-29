// Checkout progress indicator: 1 เลือกที่นั่ง → 2 สรุป → 3 ชำระเงิน → 4 เสร็จสิ้น
// `current` is 1–4. `right` renders optional content on the far right (e.g. hold timer).
const STEPS = ["เลือกที่นั่ง", "สรุป", "ชำระเงิน", "เสร็จสิ้น"];

export default function CheckoutStepper({ current, right = null }) {
  return (
    <div className="mb-6 flex items-center gap-[14px] font-mono text-[12px] tracking-[1px] text-fainter">
      {STEPS.map((label, i) => (
        <span key={label} className="flex items-center gap-[14px]">
          {i > 0 && <span>→</span>}
          <span
            className={
              i + 1 === current ? "font-bold text-accent" : undefined
            }
          >
            {i + 1} {label}
          </span>
        </span>
      ))}
      {right != null && (
        <>
          <div className="flex-1" />
          {right}
        </>
      )}
    </div>
  );
}
