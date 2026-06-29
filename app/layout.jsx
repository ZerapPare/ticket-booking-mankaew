import { Anuphan, Space_Mono } from "next/font/google";
import "./globals.css";
import { BookingProvider } from "@/lib/booking-context";

const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-anuphan",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata = {
  title: "Mankaew — จองบัตรคอนเสิร์ตและเทศกาล",
  description:
    "Mankaew แพลตฟอร์มกดบัตรคอนเสิร์ต เทศกาล และอีเวนต์ พร้อมระบบจัดคิวและบัตรอิเล็กทรอนิกส์",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="th"
      className={`${anuphan.variable} ${spaceMono.variable} h-full`}
    >
      <body className="min-h-full">
        <BookingProvider>{children}</BookingProvider>
      </body>
    </html>
  );
}
