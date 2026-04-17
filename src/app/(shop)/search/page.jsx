"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchSearchResults, fetchAllProducts } from '@/services/products'; // NEW ENGINE IMPORT

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function doSearch() {
      if (!query) {
        setProducts([]);
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const results = await fetchSearchResults(query, 20);
        
        if (results && results.length > 0) {
          setProducts(results);
          setSuggestions([]); 
        } else {
          setProducts([]);
          
          // --- MANAGER FIX: Fetch Fallbacks from Printify ---
          const fallbackData = await fetchAllProducts();
          if (Array.isArray(fallbackData)) {
            // Randomize and pick top 4 to show as suggestions
            const shuffled = fallbackData.sort(() => 0.5 - Math.random());
            setSuggestions(shuffled.slice(0, 4));
          }
        }
      } catch (error) {
        console.error("Error searching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    doSearch();
  }, [query]);

  return (
    <main className="pt-32 pb-20 bg-ethoBg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!query ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold text-ethoDark mb-4">Search EthoHaiti</h1>
            <p className="text-gray-500">Start typing to search our collections.</p>
          </div>
        ) : (
          <>
            <div className="mb-8 border-b border-gray-200 pb-4">
              <h1 className="text-3xl font-bold text-ethoDark">Search Results</h1>
              {!loading && (
                <p className="text-gray-500 mt-2 font-medium">
                  {products.length} {products.length === 1 ? 'result' : 'results'} for '{query}'
                </p>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-haitiBlue mb-4"></div>
                <p className="text-ethoDark font-bold tracking-wide">Searching...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link 
                    href={`/product/${product.slug}`} 
                    key={product.id} 
                    className="bg-white rounded-lg shadow hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col"
                  >
                    <div className="relative h-72 bg-gray-100 flex items-center justify-center p-4">
                      <img 
                        src={product.images?.[0]?.src || "https://placehold.co/500x500?text=No+Image"} 
                        alt={product.name} 
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-grow text-center">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {product.name?.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&")}
                      </h3>
                      <span 
                        className="text-haitiBlue font-extrabold" 
                        dangerouslySetInnerHTML={{ __html: product.price_html || "" }}
                      ></span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg shadow-sm p-12 mb-16">
                  <h2 className="text-2xl font-bold text-ethoDark mb-4">No exact matches found for '{query}'</h2>
                  <p className="text-gray-500 mb-8">Try checking your spelling or using a more general term. In the meantime, check out these trending items!</p>
                  <Link 
                    href="/category/collection" 
                    className="bg-haitiBlue text-white px-8 py-3 rounded font-bold hover:bg-opacity-90 transition-colors inline-block"
                  >
                    Browse All Categories
                  </Link>
                </div>

                {suggestions.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-extrabold text-ethoDark mb-8 text-left border-l-4 border-haitiRed pl-3">
                      Suggested For You
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                      {suggestions.map((product) => (
                        <Link 
                          href={`/product/${product.slug}`} 
                          key={`suggestion-${product.id}`} 
                          className="bg-white rounded-lg shadow hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col"
                        >
                          <div className="relative h-72 bg-gray-100 flex items-center justify-center p-4">
                            <img 
                              src={product.images?.[0]?.src || "https://placehold.co/500x500?text=No+Image"} 
                              alt={product.name} 
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-6 flex flex-col flex-grow text-center">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                              {product.name?.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&")}
                            </h3>
                            <span 
                              className="text-haitiBlue font-extrabold" 
                              dangerouslySetInnerHTML={{ __html: product.price_html ? product.price_html.split(/&ndash;|-/)[0].trim() : "" }}
                            ></span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ethoBg pt-32 flex flex-col items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-haitiBlue mb-4"></div></div>}>
      <SearchContent />
    </Suspense>
  );
}