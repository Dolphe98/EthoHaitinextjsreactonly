import Link from 'next/link';
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

  // 5. Filter out empty/failed categories (the ones that returned 'null' above)
  const validCategories = categoriesWithImages.filter(cat => cat !== null && cat.img1 !== null);

  if (validCategories.length === 0) {
     return (
       <div className="text-center py-20 text-gray-500 font-bold">
         Curating collections...
       </div>
     );
  }

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
            <div className="relative h-72 bg-gray-100 flex items-center justify-center overflow-hidden p-4">
              <img src={category.img2} alt={`${category.name} Flat`} className="absolute max-h-[90%] max-w-[90%] object-contain" />
              <img src={category.img1} alt={`${category.name} Mockup`} className="absolute max-h-[90%] max-w-[90%] object-contain animate-crossfade bg-gray-100" style={{ animationDelay: `${index * 0.75}s` }} />
              <span className="absolute top-3 left-3 z-10 bg-ethoDark text-white text-xs font-bold px-3 py-1 rounded shadow-sm">
                {category.genderTag}
              </span>
            </div>
            <div className="p-4 flex flex-col flex-grow text-center bg-white z-10">
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