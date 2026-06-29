// Site footer — used on the Home page (per the reference design).
export default function SiteFooter() {
  return (
    <footer className="mx-auto flex max-w-[1280px] items-center justify-between border-t border-line px-12 py-10 text-[13px] text-fainter">
      <div className="font-mono tracking-[1px]">
        Mankaew<span className="text-accent">.</span> © 2026
      </div>
      <div className="flex gap-6">
        <span>ช่วยเหลือ</span>
        <span>เงื่อนไข</span>
        <span>นโยบายคืนเงิน</span>
        <span>ติดต่อเรา</span>
      </div>
    </footer>
  );
}
