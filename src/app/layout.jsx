import { Inter } from "next/font/google";
import Script from "next/script"; // <-- IMPORT NEXT.JS SCRIPT
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";
import CookieBanner from '@/components/layout/CookieBanner';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Etho Haiti",
  description: "Premium Culture-Driven Apparel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Added flex flex-col and min-h-screen to ensure the footer always stays at the bottom */}
      <body suppressHydrationWarning className={`${inter.className} antialiased flex flex-col min-h-screen`}>
        
        {/* GOAFFPRO GLOBAL TRACKER */}
        {process.env.NEXT_PUBLIC_GOAFFPRO_KEY && (
          <Script 
            src={`https://api.goaffpro.com/loader.js?shop=${process.env.NEXT_PUBLIC_GOAFFPRO_KEY}`} 
            strategy="afterInteractive" 
          />
        )}

        <Header />
        
        {/* Your individual pages (like page.js) load here inside flex-grow so they push the footer down */}
        <div className="flex-grow">
          {children}
        </div>
        
        <Footer /> {/* 2. Place the Footer at the bottom */}
        <CookieBanner />
      </body>
    </html>
  );
}