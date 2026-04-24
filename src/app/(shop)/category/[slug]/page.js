import Link from 'next/link';
import { fetchAllCategories, fetchProductsByCategory } from '@/services/products'; 
import ProductCard from '@/components/product/ProductCard';

// MANAGER FIX: Removed 'force-dynamic' which was forcing a rebuild on every visit.
// Added 'revalidate = 3600' to enable Incremental Static Regeneration (ISR).
// This caches the category pages on Vercel's Edge CDN and updates them in the background every hour.
export const revalidate = 3600;

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.toLowerCase();

  // 1. Fetch ALL categories from the new engine
  const allCategories = await fetchAllCategories();

  if (!allCategories || allCategories.length === 0) {
    return <div className="pt-32 text-center text-2xl font-bold min-h-screen bg-ethoBg">Cannot connect to store catalog.</div>;
  }

  // 2. Find the EXACT matching category by its slug
  const category = allCategories.find(cat => cat.slug === slug);

  if (!category) {
    return (
      <div className="pt-32 text-center min-h-screen bg-ethoBg">
        <h1 className="text-3xl font-bold text-ethoDark mb-4">Category Not Found</h1>
        <p className="text-gray-500">We couldn't find a collection for "{slug}".</p>
        <Link href="/" className="text-haitiBlue font-bold mt-4 inline-block hover:underline">Return Home</Link>
      </div>
    );
  }

  // 3. Fetch the actual products
  const products = await fetchProductsByCategory(category.slug);

  // 4. Text Scrubber
  const cleanName = category.name.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&");

  // ==========================================
  // THE SMART FILTER BAR LOGIC
  // ==========================================
  let parentCategory = null;
  let filterLinks = [];

  if (category.parent === 0) {
    // We are currently on a Parent Category page (e.g. "Men's Clothing")
    parentCategory = category;
    filterLinks = allCategories.filter(c => c.parent === category.id);
  } else {
    // We are currently on a Subcategory page (e.g. "Men's Clothing -> Hoodies")
    parentCategory = allCategories.find(c => c.id === category.parent);
    filterLinks = allCategories.filter(c => c.parent === category.parent);
  }

  // Use parent name for the giant banner so it always says "Men's Clothing", etc.
  const bannerName = parentCategory ? parentCategory.name.replace(/&#8217;/g, "'") : cleanName;

  return (
    <main className="pt-24 pb-20 bg-ethoBg min-h-screen">
      
      {/* Category Header Banner */}
      <div className="bg-ethoDark text-white py-16 text-center border-b-4 border-haitiRed mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight">{bannerName}</h1>
        {category.parent !== 0 && (
          <p className="text-gray-400 mt-2 font-bold tracking-wide">{cleanName}</p>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================== */}
        {/* THE CATEGORY PILL FILTER BAR               */}
        {/* ========================================== */}
        {parentCategory && filterLinks.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-4 border-b border-gray-200">
              <Link
                href={`/category/${parentCategory.slug}`}
                className={`px-6 py-2 rounded-full font-extrabold whitespace-nowrap transition-colors ${
                  slug === parentCategory.slug
                    ? 'bg-haitiRed text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-haitiBlue hover:text-haitiBlue'
                }`}
              >
                All {parentCategory.name}
              </Link>
              
              {filterLinks.map(subCat => (
                <Link
                  key={subCat.id}
                  href={`/category/${subCat.slug}`}
                  className={`px-6 py-2 rounded-full font-extrabold whitespace-nowrap transition-colors ${
                    slug === subCat.slug
                      ? 'bg-haitiBlue text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-haitiRed hover:text-haitiRed'
                  }`}
                >
                  {subCat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center bg-white rounded-xl shadow-sm border border-gray-100 p-16">
             <svg className="w-20 h-20 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
             <h2 className="text-2xl font-bold text-ethoDark mb-2">No products found here yet.</h2>
             <p className="text-gray-500">We are dropping new gear soon. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}