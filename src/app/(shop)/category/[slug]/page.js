import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Kills Next.js caching

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.toLowerCase();

  // 1. Fetch ALL categories
  const catRes = await fetch(`https://backend.ethohaiti.com/wp-json/wc/store/v1/products/categories?per_page=100`, { cache: 'no-store' });
  const allCategories = await catRes.json();

  if (!allCategories || allCategories.length === 0) {
    return <div className="pt-32 text-center text-2xl font-bold min-h-screen">Cannot connect to store catalog.</div>;
  }

  // 2. Find the EXACT matching category by its slug
  const category = allCategories.find(cat => cat.slug === slug);

  if (!category) {
    return (
      <div className="pt-32 text-center min-h-screen">
        <h1 className="text-3xl font-bold text-ethoDark mb-4">Category Not Found</h1>
        <p className="text-gray-500">We couldn't find a category for "{slug}".</p>
        <Link href="/" className="text-haitiBlue font-bold mt-4 inline-block hover:underline">Return Home</Link>
      </div>
    );
  }

  // --- THE FIX: Find subcategories that belong to THIS category ---
  const subcategories = allCategories.filter(cat => cat.parent === category.id && cat.count > 0);

  // 3. Fetch the actual products for this specific category ID
  const prodRes = await fetch(`https://backend.ethohaiti.com/wp-json/wc/store/v1/products?category=${category.id}&per_page=100`, { cache: 'no-store' });
  const products = await prodRes.json();

  // 4. Text Scrubber
  const cleanName = category.name.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&");

  return (
    <main className="pt-24 pb-20 bg-ethoBg min-h-screen">
      
      {/* Category Header Banner */}
      <div className="bg-ethoDark text-white py-16 text-center border-b-4 border-haitiRed mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight">{cleanName}</h1>
        {category.description && (
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto text-lg" dangerouslySetInnerHTML={{ __html: category.description }}></p>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- SUBCATEGORY PILL BUTTONS --- */}
        {/* Only shows up if this category actually HAS subcategories! */}
        {subcategories.length > 0 && (
          <div className="mb-10">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Shop Subcategories</h3>
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
              {subcategories.map(sub => (
                <Link 
                  key={sub.id} 
                  href={`/category/${sub.slug}`} 
                  className="bg-white border border-gray-200 rounded-full px-6 py-2 font-bold text-ethoDark hover:text-white hover:bg-haitiBlue transition-colors whitespace-nowrap shadow-sm"
                >
                  {sub.name.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'")}
                </Link>
              ))}
            </div>
            <hr className="border-gray-200 mt-4" />
          </div>
        )}

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