import SiteHeader from "@/components/site-header";

// Layout for routes that share the sticky header chrome:
// home, events, event detail, seats, cart, payment, account.
export default function ShopLayout({ children }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
