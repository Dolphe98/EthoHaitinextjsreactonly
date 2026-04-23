import Link from 'next/link';
import Image from 'next/image';
import { fetchAllCategories, fetchProductsByCategory } from '@/services/products';

export default async function AlternatingCategoryGrid() {
  const allCategories = await fetchAllCategories();

  // 1. Locate the exact Parent Categories based on our clean slugs
  const mensParent = allCategories.find(c => c.slug === 'mens-clothing' || c.slug === 'mens');
  const womensParent = allCategories.find(c => c.slug === 'womens-clothing' || c.slug === 'womens');

  // 2. Extract their specific subcategories
  const mensSubs = mensParent ? allCategories.filter(c => c.parent === mensParent.id) : [];
  const womensSubs = womensParent ? allCategories.filter(c => c.parent === womensParent.id) : [];

  // 3. The Zipper Logic
  const zippedCategories = [];
  const maxLength = Math.max(mensSubs.length, womensSubs.length);

  for (let i = 0; i < maxLength; i++) {
    if (mensSubs[i]) {
      zippedCategories.push({
        ...mensSubs[i],
        displayName: `Men's ${mensSubs[i].name}`,
        genderTag: "Men's Collection"
      });
    }
    if (womensSubs[i]) {
      zippedCategories.push({
        ...womensSubs[i],
        displayName: `Women's ${womensSubs[i].name}`,
        genderTag: "Women's Collection"
      });
    }
  }

  // 4. Fetch cover images for the Zipped items
  const categoriesWithImages = await Promise.all(
    zippedCategories.map(async (category) => {
      try {
        const products = await fetchProductsByCategory(category.slug);
        
        // If there are no products in this subcategory yet, skip it!
        if (!products || products.length === 0) return null;

        const product = products[0]; // Use the first product as the cover

        return {
          ...category,
          img1: product?.images?.[0]?.src || null,
          img2: product?.images?.[1]?.src || product?.images?.[0]?.src || null
        };
      } catch (err) {
        return null;
      }
    })
  );

  // 5. Filter out empty/failed categories
  const validCategories = categoriesWithImages.filter(cat => cat !== null && cat.img1 !== null);

  // =====================================================================
  // MANAGER FIX: THE DIAGNOSTIC X-RAY
  // If the grid is empty, print out EXACTLY what the server sees.
  // =====================================================================
  if (validCategories.length === 0) {
     return (
       <div className="max-w-4xl mx-auto my-12 bg-red-50 p-8 rounded-lg border-2 border-red-200 shadow-sm text-left">
         <h2 className="text-2xl font-black text-red-700 mb-6 uppercase tracking-wider">X-Ray Diagnostic Mode</h2>
         
         <div className="space-y-3 text-lg text-gray-800">
           <p><strong className="text-black">1. Total Categories Engine Built:</strong> {allCategories.length}</p>
           
           <p><strong className="text-black">2. Found "Men's Clothing" Parent?</strong>
             {mensParent ? <span className="text-green-600 font-bold ml-2">YES</span> : <span className="text-red-600 font-bold ml-2">NO</span>}
           </p>
           
           <p><strong className="text-black">3. Found "Women's Clothing" Parent?</strong>
             {womensParent ? <span className="text-green-600 font-bold ml-2">YES</span> : <span className="text-red-600 font-bold ml-2">NO</span>}
           </p>
           
           <div className="bg-white p-4 border border-gray-200 rounded mt-4">
              <p className="font-bold text-black mb-2">Men's Subcategories Detected:</p>
              <p className="text-gray-600 text-sm">{mensSubs.map(s => s.name).join(', ') || 'None found'}</p>
           </div>

           <div className="bg-white p-4 border border-gray-200 rounded mt-4">
              <p className="font-bold text-black mb-2">Women's Subcategories Detected:</p>
              <p className="text-gray-600 text-sm">{womensSubs.map(s => s.name).join(', ') || 'None found'}</p>
           </div>
         </div>

         <p className="mt-8 text-sm text-gray-500 italic">
           *If YES appears but Subcategories say "None found", the description text isn't formatting right. <br/>
           *If Subcategories ARE found, but this X-Ray is still showing, it means the API is returning 0 products for those subcategories (likely due to Printify locks).
         </p>
       </div>
     );
  }

  // If products exist, render the normal grid!
  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto mb-12">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes autoCrossfade {
          0% { opacity: 1; } 40% { opacity: 1; }
          50% { opacity: 0; } 90% { opacity: 0; } 100% { opacity: 1; }
        }
        .animate-crossfade { animation: autoCrossfade 6s infinite; }
      `}} />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-ethoDark border-l-4 border-haitiRed pl-3">
          Shop by Category
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {validCategories.map((category, index) => (
          <Link key={`${category.id}-${index}`} href={`/category/${category.slug}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group relative">
            
            {/* OPTIMIZED NEXT.JS IMAGE WRAPPER */}
            <div className="relative h-72 bg-gray-100 overflow-hidden">
              <Image 
                src={category.img2 || "https://placehold.co/500x500.png?text=No+Image"} 
                alt={`${category.name} Flat`} 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-contain p-4" 
              />
              <Image 
                src={category.img1 || "https://placehold.co/500x500.png?text=No+Image"} 
                alt={`${category.name} Mockup`} 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-contain p-4 animate-crossfade bg-gray-100" 
                style={{ animationDelay: `${index * 0.75}s` }} 
              />
              <span className="absolute top-3 left-3 z-10 bg-ethoDark text-white text-xs font-bold px-3 py-1 rounded shadow-sm">
                {category.genderTag}
              </span>
            </div>

            <div className="p-4 flex flex-col flex-grow text-center bg-white z-10 border-t border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-haitiBlue transition-colors">
                {category.displayName}
              </h3>
              <p className="text-sm text-haitiBlue font-bold mt-2">Shop Now &rarr;</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}