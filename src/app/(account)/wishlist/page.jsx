"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWishlist } from '@/hooks/useWishlist';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const { token } = useAuthStore();
  const { wishlist, removeFromWishlist } = useWishlist();
  const addToCart = useCartStore((state) => state.addToCart);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.push('/account');
    }
  }, [token, router]);

  if (!mounted || !token) return <div className="pt-32 min-h-screen bg-ethoBg"></div>;

  const handleMoveToCart = (item) => {
    // We pass the base item to the cart (they will select specific sizes/colors on checkout if needed)
    addToCart({
      id: item.id,
      cartItemId: `${item.id}-base`,
      name: item.name,
      price: item.price || 0,
      price_html: item.price_html,
      image: item.images?.[0]?.src || "https://placehold.co/80x80?text=No+Image",
      quantity: 1
    });
    // Remove it from the wishlist since they intend to buy it
    removeFromWishlist(item.id);
  };

  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <nav className="text-sm text-gray-500 mb-8 font-medium">
          <Link href="/account" className="hover:text-haitiBlue transition-colors">Your Account</Link>
          <span className="mx-2">›</span>
          <span className="text-ethoDark">Your Wishlist</span>
        </nav>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
           <h1 className="text-3xl font-extrabold text-ethoDark">Your Wishlist</h1>
           
           {/* The Share Button Concept */}
           {wishlist.length > 0 && (
             <button onClick={() => alert('Shareable link generation coming in Phase 3!')} className="mt-4 sm:mt-0 flex items-center gap-2 text-haitiBlue font-bold hover:underline">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" /></svg>
               Share this list
             </button>
           )}
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
            <svg className="w-20 h-20 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            <h2 className="text-2xl font-bold text-ethoDark mb-2">Your list is empty</h2>
            <p className="text-gray-500 mb-6">Find gear you love and hit the heart icon to save it here.</p>
            <Link href="/category/clothing" className="bg-haitiBlue text-white px-8 py-3 rounded font-bold hover:bg-opacity-90 transition-colors inline-block">
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group relative">
                
                <button 
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-400 hover:text-haitiRed transition-colors shadow-sm"
                  title="Remove from list"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>

                <div className="relative h-64 bg-gray-100 flex items-center justify-center p-4">
                   <img 
                     src={item.images?.[0]?.src || "https://placehold.co/500x500?text=No+Image"} 
                     alt={item.name} 
                     className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                   />
                </div>
                
                <div className="p-6 flex flex-col flex-grow text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {item.name?.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'")}
                  </h3>
                  <div className="text-haitiBlue font-extrabold mb-4" dangerouslySetInnerHTML={{ __html: item.price_html || "" }}></div>
                  
                  <button 
                    onClick={() => handleMoveToCart(item)}
                    className="mt-auto w-full bg-ethoDark hover:bg-black text-white font-bold py-3 rounded transition-colors shadow-md"
                  >
                    Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
