import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

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
        <Header />
        
        {/* Your individual pages (like page.js) load here inside flex-grow so they push the footer down */}
        <div className="flex-grow">
          {children}
        </div>
        
        <Footer /> {/* 2. Place the Footer at the bottom */}
      </body>
    </html>
  );
}