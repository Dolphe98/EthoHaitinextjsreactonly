"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { formatPrice } from '@/utils/formatPrice';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email'); 
  
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const router = useRouter();
  const supabase = createClient();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGuest, setIsGuest] = useState(false);

  // Line-Item Cancellation States
  const [itemToCancel, setItemToCancel] = useState(null);
  const [cancelPhone, setCancelPhone] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  
  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      try {
        if (emailParam) {
          setIsGuest(true);
          const res = await fetch('/api/orders/guest-lookup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: id, email: emailParam })
          });
          
          let data;
          try { data = await res.json(); } catch (e) {
            throw new Error("Tracking system is currently updating. Please try again in a moment.");
          }

          if (!res.ok) throw new Error(data.error || "Order not found");
          setOrder(data.order);
        } else {
          if (!user?.id) {
            router.push('/orders');
            return;
          }
          const { data, error: sbError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();
            
          if (sbError || !data) throw new Error("Order not found or access denied.");
          if (data.user_id !== user.id) throw new Error("Access denied.");
          
          setOrder(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id, emailParam, user, router, supabase]);

  const handleCancelItem = async () => {
    setIsCancelling(true);
    setCancelError('');

    if (isGuest && !cancelPhone) {
      setCancelError("Phone number is required to verify identity.");
      setIsCancelling(false);
      return;
    }

    try {
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: order.id,
          itemId: itemToCancel.id, // Target the specific item
          itemIndex: itemToCancel.index, // Array index for the backend
          userId: user?.id,
          isGuest: isGuest,
          phone: cancelPhone
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel item.");

      // Success! Instantly update UI for this specific line item
      const updatedItems = [...order.items];
      updatedItems[itemToCancel.index] = { ...updatedItems[itemToCancel.index], status: 'cancelled' };
      
      // If ALL items happen to be cancelled now, mark the whole order as cancelled
      const allCancelled = updatedItems.every(i => i.status === 'cancelled' || i.status === 'canceled');

      setOrder({ 
        ...order, 
        items: updatedItems,
        status: allCancelled ? 'cancelled' : order.status 
      });
      setItemToCancel(null); // Close modal
      
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReplaceItem = (item) => {
    addToCart({
      id: item.id,
      cartItemId: `${item.id}-${Date.now()}-${Math.random()}`,
      name: item.name,
      price: item.price || 0,
      price_html: item.price_html,
      image: item.image || item.images?.[0]?.src || "https://placehold.co/150x150?text=No+Image",
      quantity: item.quantity || 1,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      variationId: item.variationId,
      productData: item.productData || item
    });
    
    setToastMessage("Item added to cart!");
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (loading) {
    return (
      <main className="pt-32 pb-20 min-h-screen bg-ethoBg max-w-4xl mx-auto px-4 sm:px-6 animate-pulse">
        <div className="h-4 w-24 bg-gray-200 rounded mb-8"></div>
        <div className="h-10 w-64 bg-gray-200 rounded mb-6"></div>
        <div className="h-32 w-full bg-white border border-gray-100 rounded-xl mb-8"></div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="pt-32 pb-20 min-h-screen bg-ethoBg flex flex-col items-center justify-center px-4">
        <div className="bg-red-50 p-6 rounded-full mb-4 text-haitiRed">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h1 className="text-2xl font-extrabold text-ethoDark mb-2">Order Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-md text-center">{error}</p>
        <Link href="/orders" className="bg-ethoDark hover:bg-black text-white font-bold py-3 px-8 rounded transition-colors">Back to Orders</Link>
      </main>
    );
  }

  // Security & Timing Logic
  const hoursSinceOrder = (new Date() - new Date(order.created_at)) / (1000 * 60 * 60);
  const isWholeOrderCanceled = order.status === 'cancelled' || order.status === 'canceled';
  
  // Per Blueprint: Only allow cancels if the order status is "Processing". Once it hits "In Production", it's locked.
  const orderStatusStr = order.status?.toLowerCase() || '';
  const isProcessing = orderStatusStr === 'processing' || orderStatusStr === 'pending';
  const canCancelOrderLevel = hoursSinceOrder <= 6 && !isWholeOrderCanceled && isProcessing;

  const items = Array.isArray(order.items) ? order.items : [];
  const packages = Array.isArray(order.packages) ? order.packages : [];
  const hasSplitShipment = packages.length > 1;
  const address = order.shipping_address || {};

  const determineStep = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'delivered') return 4;
    if (s === 'shipped') return 3;
    if (s === 'in production' || s === 'processing') return 2;
    return 1; 
  };
  const currentStep = determineStep(order.status);

  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg relative">
      
      {/* TOAST NOTIFICATION: ITEM REPLACED */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[100] bg-ethoDark text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 text-sm animate-in slide-in-from-bottom-5">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
          {toastMessage}
          <Link href="/cart" className="ml-2 text-haitiBlue hover:underline bg-white px-2 py-0.5 rounded text-xs">View Cart</Link>
        </div>
      )}

      {/* LINE-ITEM CANCELLATION MODAL */}
      {itemToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border-t-4 border-haitiRed">
            <h2 className="text-xl font-black text-ethoDark mb-2">Cancel Item?</h2>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to cancel <strong>{itemToCancel.name}</strong>? We will issue a partial refund to your original payment method.
            </p>
            
            {isGuest && (
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 mb-2">Security Verification</label>
                <input 
                  type="tel" 
                  placeholder="Enter the phone number used at checkout"
                  value={cancelPhone}
                  onChange={(e) => setCancelPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiRed outline-none text-black text-sm"
                />
              </div>
            )}

            {cancelError && <div className="text-haitiRed text-xs font-bold mb-4 bg-red-50 p-2 rounded">{cancelError}</div>}

            <div className="flex gap-3">
              <button onClick={() => setItemToCancel(null)} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-ethoDark font-bold rounded transition-colors text-sm">
                Keep Item
              </button>
              <button onClick={handleCancelItem} disabled={isCancelling} className="flex-1 px-4 py-3 bg-haitiRed hover:bg-red-700 text-white font-bold rounded transition-colors text-sm flex justify-center items-center">
                {isCancelling ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : "Yes, Cancel Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href={isGuest ? "/" : "/orders"} className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-haitiBlue mb-6 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          {isGuest ? "Back to Home" : "Back to Orders"}
        </Link>

        {/* 6-HOUR STRICT POLICY BANNER */}
        {!isWholeOrderCanceled && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3 mb-6 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-haitiRed mt-0.5 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div>
              <p className="text-sm font-bold text-haitiRed">Strict Cancellation Policy</p>
              <p className="text-xs text-red-800 mt-1">Items are locked into production quickly. You can only cancel an item while the status is <strong>Processing</strong> (within 6 hours). Once in production, no changes can be made.</p>
            </div>
          </div>
        )}

        {isWholeOrderCanceled && (
          <div className="bg-gray-800 border border-gray-900 p-4 rounded-lg flex items-start gap-3 mb-6 shadow-md text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            <div>
              <p className="font-bold text-lg">Order Cancelled</p>
              <p className="text-sm text-gray-300 mt-1">This entire order has been cancelled and production has stopped.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-ethoDark">Order #{order.id.substring(0, 8).toUpperCase()}</h1>
            {currentStep <= 2 && !isWholeOrderCanceled && (
              <p className="text-green-600 font-bold mt-2 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                Thank you for your order! Your gear is in progress.
              </p>
            )}
            <p className="text-gray-500 mt-2">Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          {isGuest && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full w-max">Guest View</span>}
        </div>

        {/* Global Timeline */}
        {!hasSplitShipment && !isWholeOrderCanceled && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
            <div className="flex items-center justify-between mb-8 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 z-0"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-haitiBlue z-0 transition-all duration-500" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>

              {[1, 2, 3].map(step => (
                <div key={step} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= step ? 'bg-haitiBlue text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>{step}</div>
                </div>
              ))}
              <div className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 4 ? 'bg-haitiBlue text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>✓</div>
              </div>
            </div>
          </div>
        )}

        {/* Items List with Individual Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
           <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="font-extrabold text-lg text-ethoDark">Items in Order</h2>
           </div>
           <div className="p-4 sm:p-6 divide-y divide-gray-100">
              {items.map((item, i) => {
                const isItemCanceled = isWholeOrderCanceled || item.status === 'canceled' || item.status === 'cancelled';
                const canCancelItem = canCancelOrderLevel && !isItemCanceled;

                return (
                  <div key={i} className={`py-5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 transition-opacity ${isItemCanceled ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 p-1 relative">
                        {isItemCanceled && <div className="absolute inset-0 bg-white/50 z-10 backdrop-blur-[1px]"></div>}
                        {item.image ? <img src={item.image} alt={item.name} className={`max-w-full max-h-full object-contain ${isItemCanceled ? 'grayscale' : ''}`}/> : <div className="w-full h-full bg-gray-200"></div>}
                      </div>
                      <div>
                        <p className={`font-bold text-ethoDark text-sm sm:text-base line-clamp-1 ${isItemCanceled ? 'line-through text-gray-400' : ''}`}>
                          {item.name}
                        </p>
                        
                        {isItemCanceled ? (
                          <span className="inline-block mt-1 text-[10px] font-extrabold text-red-700 bg-red-100 px-2 py-0.5 rounded uppercase tracking-wide">
                            Canceled
                          </span>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">{item.selectedSize} / {item.selectedColor}</p>
                        )}
                        
                        <p className="text-xs font-bold text-gray-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    
                    {/* ACTION ZONE: TRASH CAN OR REORDER BUTTON */}
                    {isItemCanceled ? (
                      <button 
                        onClick={() => handleReplaceItem(item)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-haitiBlue bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-full transition-colors flex-shrink-0 shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                        Replace Item
                      </button>
                    ) : canCancelItem ? (
                      <button 
                        onClick={() => setItemToCancel({ ...item, index: i })}
                        className="p-3 text-gray-400 hover:text-haitiRed hover:bg-red-50 rounded-full transition-colors group flex-shrink-0"
                        title="Cancel Item (Partial Refund)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                      </button>
                    ) : null}

                  </div>
                );
              })}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-ethoDark mb-4 border-b border-gray-100 pb-2">Shipping Address</h3>
            {isGuest ? (
              <div className="space-y-1">
                <p className="text-sm text-gray-600 italic mb-2">Street address hidden for privacy.</p>
                <p className="text-sm font-bold text-ethoDark">{address.city || 'City Hidden'}, {address.state || address.region || 'State Hidden'}</p>
                <p className="text-sm text-gray-500">{address.country === 'US' ? 'United States' : address.country}</p>
              </div>
            ) : (
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-bold text-ethoDark">{address.first_name || address.firstName} {address.last_name || address.lastName}</p>
                <p>{address.address_1 || address.address1}</p>
                {(address.address_2 || address.address2) && <p>{address.address_2 || address.address2}</p>}
                <p>{address.city}, {address.state || address.region} {address.postcode || address.zip}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
             <h3 className="font-bold text-ethoDark mb-4 border-b border-gray-100 pb-2">Order Summary</h3>
             <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className={isWholeOrderCanceled ? "line-through text-gray-400" : ""}>{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping & Taxes</span>
                  <span className="text-green-600 font-bold tracking-wide">FREE</span>
                </div>
                <div className="flex justify-between font-black text-ethoDark text-lg pt-3 border-t border-gray-100 mt-2">
                  <span>Total</span>
                  <span className={isWholeOrderCanceled ? "line-through text-gray-400" : ""}>{formatPrice(order.total)}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500 border-t border-gray-200 pt-8">
          <p>Need help with this order?</p>
          <Link href="/support" className="text-haitiBlue font-bold hover:underline mt-1 inline-block">Contact Customer Support</Link>
        </div>

      </div>
    </main>
  );
}