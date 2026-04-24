import HeroBanner from "@/components/home/HeroBanner";
import AlternatingCategoryGrid from "@/components/product/AlternatingCategoryGrid";

// MANAGER FIX: Removed 'force-dynamic' to prevent rebuilding the page on every single request.
// Added 'revalidate = 3600' to enable Incremental Static Regeneration (ISR).
// This caches the homepage on Vercel's Edge CDN and updates it in the background every hour.
export const revalidate = 3600;

export default function Home() {
  return (
    // THE FIX: Removed pt-24 so the banner sits flush against the bottom of the header
    <main className="pb-10 bg-ethoBg min-h-screen"> 
      <HeroBanner />
      <AlternatingCategoryGrid /> 
    </main>
  );
}