import Link from 'next/link';
import { fetchAllCategories, fetchProductsByCategory } from '@/services/products';

export default async function AlternatingCategoryGrid() {
  // 1. Fetch categories instantly on the server
  const data = await fetchAllCategories();

  const cleanName = (name) => {
    if (!name) return "";
    return name.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&");
  };

  // 2. Map the data directly in memory (No browser locking!)
  const categoriesWithImages = await Promise.all(
    data.map(async (category) => {
      try {
        const products = await fetchProductsByCategory(category.slug);
        const product = products[0]; // Grab the first product to use as the cover image

        return {
          ...category,
          name: cleanName(category.name),
          genderTag: "Collection",
          img1: product?.images?.[0]?.src || null,
          img2: product?.images?.[1]?.src || product?.images?.[0]?.src || null
        };
      } catch (err) {
        return { ...category, img1: null, img2: null };
      }
    })
  );

  // 3. Only show categories that have a valid cover image
  const validCategories = categoriesWithImages.filter(cat => cat.img1 !== null);

  if (validCategories.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto mb-12">
      
      {/* Injecting the animation locally so it works globally */}
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
              <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-haitiBlue transition-colors">{category.name}</h3>
              <p className="text-sm text-haitiBlue font-bold mt-2">Shop Now &rarr;</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}