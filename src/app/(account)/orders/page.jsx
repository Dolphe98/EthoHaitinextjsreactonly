"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { formatPrice } from '@/utils/formatPrice';

export default function OrdersPage() {
  const { token, user } = useAuthStore();
  const { addToCart } = useCartStore();
  const router = useRouter();
  const supabase = createClient();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [isReordering, setIsReordering] = useState(false);
  
  // States for Logged In Users
  const [activeFilter, setActiveFilter] = useState('All Orders');
  
  // States for Guest Users
  const [guestForm, setGuestForm] = useState({ orderId: '', email: '' });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only fetch orders if they are logged in
    async function fetchUserOrders() {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            setOrders(data);
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      }
      setLoading(false);
    }

    if (mounted) {
      fetchUserOrders();
    }
  }, [user, mounted, supabase]);

  // Guest Form Handler
  const handleGuestLookup = (e) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Clean up the input (remove spaces, etc)
    const cleanOrderId = guestForm.orderId.trim();
    const cleanEmail = guestForm.email.trim();

    if (!cleanOrderId || !cleanEmail) {
      setIsSearching(false);
      return;
    }

    // Push to the tracking page
    router.push(`/orders/${cleanOrderId}?email=${encodeURIComponent(cleanEmail)}`);
  };

  // Status Badge Styling Logic
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || 'processing';
    if (s === 'delivered') return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-extrabold rounded-full uppercase tracking-wide">Delivered</span>;
    if (s === 'shipped') return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-extrabold rounded-full uppercase tracking-wide">Shipped</span>;
    if (s === 'canceled' || s === 'cancelled') return <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-extrabold rounded-full uppercase tracking-wide">Canceled</span>;
    return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-extrabold rounded-full uppercase tracking-wide">In Production</span>;
  };

  // MANAGER FIX: Replaced "white screen of death" with a sleek Skeleton Loader
  if (!mounted) {
    return (
      <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="flex gap-3 mb-8 overflow-x-hidden">
            <div className="h-10 bg-gray-200 rounded-full w-24"></div>
            <div className="h-10 bg-gray-200 rounded-full w-28"></div>
            <div className="h-10 bg-gray-200 rounded-full w-24"></div>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 h-48 w-full shadow-sm"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-ethoBg flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-haitiBlue mb-4"></div>
        <p className="font-bold text-ethoDark">Loading orders...</p>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: GUEST USER (NOT LOGGED IN)
  // ==========================================
  if (!token) {
    return (
      <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold text-ethoDark mb-8 text-center">Track Your Order</h1>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mb-8">
            <p className="text-sm text-gray-500 mb-6 text-center">Enter your order details below to check your shipping and production status.</p>
            
            <form onSubmit={handleGuestLookup} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-ethoDark mb-2">Order Number</label>
                <input 
                  type="text" 
                  value={guestForm.orderId}
                  onChange={(e) => setGuestForm({ ...guestForm, orderId: e.target.value })}
                  placeholder="e.g., ETH-12345" 
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black font-medium"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-ethoDark mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={guestForm.email}
                  onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                  placeholder="The email used at checkout" 
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSearching}
                className="w-full bg-haitiRed hover:bg-red-700 text-white font-extrabold py-3 px-4 rounded shadow-md transition-colors flex justify-center items-center h-12"
              >
                {isSearching ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : "Find Order"}
              </button>
            </form>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl text-center">
            <h3 className="font-bold text-ethoDark mb-2">Want to keep track of all your gear?</h3>
            <p className="text-sm text-gray-600 mb-4">Create an account to manage your addresses, save wishlists, and track orders in one place.</p>
            <Link href="/account" className="text-haitiBlue font-extrabold hover:underline">
              Create an account →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED USER (LOGGED IN)
  // ==========================================
  
  // Filter logic to include canceled items
  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'All Orders') return true;
    
    const s = order.status?.toLowerCase() || 'processing';
    const isWholeOrderCanceled = s === 'canceled' || s === 'cancelled';
    const hasCanceledItems = Array.isArray(order.items) && order.items.some(item => item.status === 'canceled' || item.status === 'cancelled');

    if (activeFilter === 'Processing' && (s === 'processing' || s === 'in production')) return true;
    if (activeFilter === 'Shipped' && s === 'shipped') return true;
    if (activeFilter === 'Delivered' && s === 'delivered') return true;
    if (activeFilter === 'Canceled' && (isWholeOrderCanceled || hasCanceledItems)) return true;
    
    return false;
  });

  const handleBulkReorder = () => {
    setIsReordering(true);
    
    // Extract all canceled items across all filtered orders
    const itemsToReorder = [];
    filteredOrders.forEach(order => {
      const isWholeOrderCanceled = order.status?.toLowerCase() === 'canceled' || order.status?.toLowerCase() === 'cancelled';
      
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (isWholeOrderCanceled || item.status === 'canceled' || item.status === 'cancelled') {
            itemsToReorder.push(item);
          }
        });
      }
    });

    // Push each canceled item back into the cart
    itemsToReorder.forEach(item => {
      addToCart({
        id: item.id,
        cartItemId: `${item.id}-${Date.now()}-${Math.random()}`, // Unique ID
        name: item.name,
        price: item.price || 0,
        price_html: item.price_html,
        image: item.image || item.images?.[0]?.src || "https://placehold.co/150x150?text=No+Image",
        quantity: item.quantity || 1,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        variationId: item.variationId,
        productData: item.productData || item // Pass the product data forward!
      });
    });

    // Route directly to checkout
    router.push('/checkout');
  };

  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <nav className="text-sm text-gray-500 mb-8 font-medium">
          <Link href="/account" className="hover:text-haitiBlue transition-colors">Your Account</Link>
          <span className="mx-2">›</span>
          <span className="text-ethoDark">Your Orders</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-ethoDark mb-6">Your Orders</h1>

        <div className="flex overflow-x-auto no-scrollbar gap-3 mb-8 pb-2">
          {['All Orders', 'Processing', 'Shipped', 'Delivered', 'Canceled'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-5 py-2 rounded-full font-bold text-sm transition-colors border ${
                activeFilter === filter 
                ? 'bg-ethoDark text-white border-ethoDark shadow-sm' 
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-ethoDark'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* BULK REORDER BUTTON (Only in Canceled Tab) */}
        {activeFilter === 'Canceled' && filteredOrders.length > 0 && (
          <button 
            onClick={handleBulkReorder}
            disabled={isReordering}
            className="w-full bg-haitiBlue hover:bg-blue-800 text-white font-extrabold py-4 px-6 rounded-xl mb-8 shadow-md transition-colors flex items-center justify-center gap-2 text-lg"
          >
            {isReordering ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                Replace All Canceled Items
              </>
            )}
          </button>
        )}

        {orders.length === 0 ? (
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
             <h3 className="text-xl font-extrabold text-ethoDark mb-2">No Orders Yet</h3>
             <p className="text-gray-500 mb-6">You haven't placed any orders with us yet.</p>
             <Link href="/category/collection" className="bg-haitiBlue hover:bg-blue-800 text-white font-extrabold py-3 px-8 rounded transition-colors shadow-md inline-block">
               Start Shopping
             </Link>
           </div>
        ) : filteredOrders.length === 0 ? (
           <div className="text-center p-8 text-gray-500 font-medium bg-white rounded-xl border border-gray-200">
              No orders found matching "{activeFilter}".
           </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : [];
              const displayItems = items.slice(0, 3);
              const extraItemsCount = items.length > 3 ? items.length - 3 : 0;

              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-gray-100 flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <h2 className="font-extrabold text-lg text-ethoDark mb-1">Order #{order.id.substring(0, 8).toUpperCase()}</h2>
                      <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50/50 flex-grow">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Items in Order</p>
                    <div className="flex items-center gap-3">
                      {displayItems.length > 0 ? (
                        displayItems.map((item, idx) => {
                          const isItemCanceled = item.status === 'canceled' || item.status === 'cancelled';
                          return (
                            <div key={idx} className="relative w-16 h-16 bg-white border border-gray-200 rounded p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                              {isItemCanceled && <div className="absolute inset-0 bg-white/60 z-10 backdrop-blur-[1px]"></div>}
                              
                              {/* MANAGER FIX: Replaced native <img> with optimized Next.js <Image /> */}
                              <Image 
                                src={item.image || "https://placehold.co/150x150/png?text=No+Image"} 
                                alt={item.name || 'Product'} 
                                width={100}
                                height={100}
                                className="max-h-full max-w-full object-contain" 
                              />
                            </div>
                          )
                        })
                      ) : (
                        <span className="text-sm text-gray-500 italic">Processing items...</span>
                      )}

                      {extraItemsCount > 0 && (
                        <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-600 font-extrabold flex items-center justify-center text-sm border-2 border-white shadow-sm -ml-4">
                          +{extraItemsCount}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="w-full sm:w-auto text-left">
                      <p className="text-sm text-gray-500 font-medium">Order Total</p>
                      <p className="font-black text-xl text-ethoDark">{formatPrice(order.total)}</p>
                    </div>
                    
                    <Link 
                      href={`/orders/${order.id}`}
                      className="w-full sm:w-auto text-center px-8 py-3 rounded font-extrabold text-haitiBlue border-2 border-haitiBlue hover:bg-haitiBlue hover:text-white transition-colors"
                    >
                      View Details & Track
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}