import type { Metadata, Viewport } from "next";
import { Fira_Sans, Fira_Code } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { LanguageProvider } from "@/lib/language";
import { Footer } from "@/components/footer";
import { SkipLink } from "@/components/skip-link";
import { DemoBanner } from "@/components/demo-banner";

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
        <LanguageProvider>
          <SkipLink />
          <DemoBanner />
          <SiteNav />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
