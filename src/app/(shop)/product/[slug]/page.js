import Link from 'next/link';
import ProductInteractive from '@/components/product/ProductInteractive';

export const dynamic = 'force-dynamic';
export const revalidate = 0; 

export default async function ProductPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // 1. Fetch the exact product
  const res = await fetch(`https://backend.ethohaiti.com/wp-json/wc/store/v1/products?slug=${slug}`, { cache: 'no-store' });
  const products = await res.json();

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
    const currentCatId = product.categories[0].id;

    // A. Fetch categories to figure out the hierarchy
    const catRes = await fetch(`https://backend.ethohaiti.com/wp-json/wc/store/v1/products/categories?per_page=100`, { cache: 'no-store' });
    const allCats = await catRes.json();

    const currentCat = allCats.find(c => c.id === currentCatId);
    
    // B. If the product is in a subcategory (like T-Shirts), look up at the parent (Men's or Women's).
    const targetCategoryId = (currentCat && currentCat.parent !== 0) ? currentCat.parent : currentCatId;

    // C. Fetch 10 items from the MAIN category so we get a mix of different types of clothes (shirts, hoodies, etc.)
    const simRes = await fetch(`https://backend.ethohaiti.com/wp-json/wc/store/v1/products?category=${targetCategoryId}&per_page=10`, { cache: 'no-store' });
    
    if (simRes.ok) {
       const simData = await simRes.json();
       if (Array.isArray(simData)) {
          // D. Filter out the exact product we are currently looking at
          const filtered = simData.filter(p => p.id !== product.id);
          
          // E. Math System: Randomly shuffle the array so it feels dynamic and fresh
          const shuffled = filtered.sort(() => 0.5 - Math.random());
          
          // F. Pick the top 3
          similarProducts = shuffled.slice(0, 3);
       }
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
               <Link href={`/category/${product.categories[0].slug}`} className="hover:text-haitiBlue transition-colors">
                 {product.categories[0].name.replace(/&#8217;/g, "'")}
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
                     <img 
                       src={simProduct.images?.[0]?.src || "https://placehold.co/500x500?text=No+Image"} 
                       alt={simProduct.name} 
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