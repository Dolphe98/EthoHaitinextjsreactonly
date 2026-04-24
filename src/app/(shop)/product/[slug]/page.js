import Link from 'next/link';
import Image from 'next/image';
import ProductInteractive from '@/components/product/ProductInteractive';
import { fetchProductBySlug, fetchProductsByCategory, fetchAllProducts } from '@/services/products'; // Added fetchAllProducts for Static Generation

// MANAGER FIX: Removed 'force-dynamic' which rebuilt the page for every user.
// Added 'revalidate = 3600' (ISR) to cache the page at the Edge and update hourly.
export const revalidate = 3600;

export default async function ProductPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // 1. Fetch the exact product using Printify Engine
  const products = await fetchProductBySlug(slug);

  if (!products || products.length === 0) {
    return (
      <div className="pt-32 text-center min-h-screen">
        <h1 className="text-3xl font-bold text-ethoDark mb-4">Product Not Found</h1>
        <p className="text-gray-500">We couldn't find the gear you're looking for.</p>
        <Link href="/" className="text-haitiBlue font-bold mt-4 inline-block hover:underline">Return Home</Link>
      </div>
    );
  }

  const product = products[0];
  const cleanName = product.name?.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&") || "Product";

  // ==========================================
  // 2. THE AMAZON SMART CROSS-SELL ALGORITHM
  // ==========================================
  let similarProducts = [];
  if (product.categories && product.categories.length > 0) {
    // Grab the main category of this shirt
    const targetCategorySlug = product.categories[0].slug;

    // Fetch products from the same category
    const simData = await fetchProductsByCategory(targetCategorySlug);
    
    if (Array.isArray(simData) && simData.length > 0) {
      // Filter out the exact product we are currently looking at
      const filtered = simData.filter(p => p.id !== product.id);
      
      // Randomly shuffle so it feels dynamic and fresh
      const shuffled = filtered.sort(() => 0.5 - Math.random());
      
      // Pick the top 3
      similarProducts = shuffled.slice(0, 3);
    }
  }

  return (
    <main className="pt-32 pb-20 bg-ethoBg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <nav className="text-sm text-gray-500 mb-8 font-medium">
          <Link href="/" className="hover:text-haitiBlue transition-colors">Home</Link>
          <span className="mx-2">/</span>
          {product.categories && product.categories.length > 0 && (
             <>
               <Link href={`/category/${product.categories[0].slug}`} className="hover:text-haitiBlue transition-colors capitalize">
                 {product.categories[0].slug.replace('-', ' ')}
               </Link>
               <span className="mx-2">/</span>
             </>
          )}
          <span className="text-ethoDark">{cleanName}</span>
        </nav>

        <ProductInteractive product={product} />

      </div>

      {similarProducts.length > 0 && (
        <div className="mt-24 pt-16 border-t border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold text-ethoDark mb-8 text-center border-b-4 border-haitiRed inline-block pb-2">
              Customers Also Bought
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {similarProducts.map(simProduct => (
                <Link href={`/product/${simProduct.slug}`} key={simProduct.id} className="bg-white rounded-lg shadow hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col">
                  <div className="relative h-72 bg-gray-100 flex items-center justify-center p-4">
                     {/* MANAGER FIX: Replaced raw <img> with Next.js <Image /> for optimized WebP delivery */}
                     <Image 
                       src={simProduct.images?.[0]?.src || "https://placehold.co/500x500/png?text=No+Image"} 
                       alt={simProduct.name || "Product Image"}
                       width={500}
                       height={500}
                       className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                     />
                  </div>
                  <div className="p-6 flex flex-col flex-grow text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {simProduct.name?.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'")}
                    </h3>
                    <span className="text-haitiBlue font-extrabold" dangerouslySetInnerHTML={{ __html: simProduct.price_html || "" }}></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      
    </main>
  );
}

// ============================================================================
// MANAGER FIX: STATIC SITE GENERATION (The Amazon Speed Secret)
// ============================================================================
// This function tells Vercel to pre-build EVERY product page during deployment.
// When a user clicks a product, Vercel hands them the pre-made HTML instantly.
export async function generateStaticParams() {
  try {
    const products = await fetchAllProducts();
    
    if (!products || products.length === 0) return [];
    
    // Return an array of slug objects for Vercel to build
    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error("Failed to generate static params for products:", error);
    return [];
  }
}