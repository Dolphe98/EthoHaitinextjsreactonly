import Link from 'next/link';
import { fetchAllCategories, fetchProductsByCategory } from '@/services/products'; // NEW ENGINE IMPORT

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.toLowerCase();

  // 1. Fetch ALL categories from the new engine
  const allCategories = await fetchAllCategories();

  if (!allCategories || allCategories.length === 0) {
    return <div className="pt-32 text-center text-2xl font-bold min-h-screen">Cannot connect to store catalog.</div>;
  }

  // 2. Find the EXACT matching category by its slug
  const category = allCategories.find(cat => cat.slug === slug);

  if (!category) {
    return (
      <div className="pt-32 text-center min-h-screen">
        <h1 className="text-3xl font-bold text-ethoDark mb-4">Category Not Found</h1>
        <p className="text-gray-500">We couldn't find a collection for "{slug}".</p>
        <Link href="/" className="text-haitiBlue font-bold mt-4 inline-block hover:underline">Return Home</Link>
      </div>
    );
  }

  // 3. Fetch the actual products using the new Printify Engine
  const products = await fetchProductsByCategory(category.slug);

  // 4. Text Scrubber
  const cleanName = category.name.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&");

  return (
    <main className="pt-24 pb-20 bg-ethoBg min-h-screen">
      
      {/* Category Header Banner */}
      <div className="bg-ethoDark text-white py-16 text-center border-b-4 border-haitiRed mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight">{cleanName}</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center text-gray-500 py-12 text-xl font-bold">No products found in this collection yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <Link href={`/product/${product.slug}`} key={product.id} className="bg-white rounded-lg shadow hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col">
                <div className="relative h-80 bg-gray-100 flex items-center justify-center p-4">
                   <img 
                     src={product.images[0]?.src || "https://placehold.co/500x500?text=No+Image"} 
                     alt={product.name} 
                     className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                   />
                </div>
                <div className="p-6 flex flex-col flex-grow text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {product.name.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'")}
                  </h2>
                  <span className="text-haitiBlue font-extrabold text-lg" dangerouslySetInnerHTML={{ __html: product.price_html }}></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}