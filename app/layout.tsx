import type { Metadata, Viewport } from "next";
import { Fira_Sans, Fira_Code } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RateRadar — Bandingkan harga hotel lintas OTA",
  description:
    "Bandingkan harga kamar yang sama di Booking.com, Agoda, Traveloka dan tiket.com dalam satu layar, lengkap dengan riwayat harga dan pemantauan rate parity untuk hotelier.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Zoom is never disabled — pinch-zoom is an accessibility requirement.
  maximumScale: 5,
};

/** Applies the stored theme before first paint so there is no flash of the wrong theme. */
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem("rr-theme");
    if (t === "dark" || t === "light") document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${firaSans.variable} ${firaCode.variable} antialiased`}>
        <a href="#main" className="skip-link">
          Lompat ke konten utama
        </a>
        {process.env.NEXT_PUBLIC_STATIC_EXPORT === "true" && (
          <p className="bg-primary px-4 py-1.5 text-center text-xs font-medium text-on-primary">
            Demo mode — showing sample data. This static build has no live backend; run the app
            locally for real-time pricing.
          </p>
        )}
        <SiteNav />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="border-t border-border mt-16 bg-surface">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 text-sm text-subtle-fg">
            <p className="max-w-3xl">
              RateRadar adalah layanan pembanding harga. Kami tidak menerima pembayaran dan tidak
              memesan atas nama pengguna — setiap pemesanan diselesaikan di situs OTA terkait.
              Harga bersifat indikatif dan dapat berubah.
            </p>
            <p className="mt-3">© {new Date().getFullYear()} RateRadar</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
