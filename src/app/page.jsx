import HeroBanner from "@/components/home/HeroBanner";
import AlternatingCategoryGrid from "@/components/product/AlternatingCategoryGrid";


export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    // THE FIX: Removed pt-24 so the banner sits flush against the bottom of the header
    <main className="pb-10 bg-ethoBg min-h-screen"> 
      <HeroBanner />
      <AlternatingCategoryGrid /> 
    </main>
  );
}