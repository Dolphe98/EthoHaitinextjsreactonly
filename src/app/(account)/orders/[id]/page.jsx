"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { formatPrice } from '@/utils/formatPrice';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email'); // If present, this is a Guest Lookup
  
  const { user } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        if (emailParam) {
          // GUEST LOOKUP FLOW (Secure API ping)
          setIsGuest(true);
          const res = await fetch('/api/orders/guest-lookup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: id, email: emailParam })
          });
          
          let data;
          try {
            data = await res.json();
          } catch (e) {
            throw new Error("Tracking system is currently updating. Please try again in a moment.");
          }

          if (!res.ok) throw new Error(data.error || "Order not found");
          setOrder(data.order);
        } else {
          // LOGGED-IN OWNER FLOW (Direct Supabase ping)
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
          
          // Verify ownership strictly
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

  if (loading) {
    return (
      <main className="pt-32 pb-20 min-h-screen bg-ethoBg max-w-4xl mx-auto px-4 sm:px-6 animate-pulse">
        <div className="h-4 w-24 bg-gray-200 rounded mb-8"></div>
        <div className="h-10 w-64 bg-gray-200 rounded mb-6"></div>
        <div className="h-32 w-full bg-white border border-gray-100 rounded-xl mb-8"></div>
        <div className="h-64 w-full bg-white border border-gray-100 rounded-xl"></div>
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
        <Link href="/orders" className="bg-ethoDark hover:bg-black text-white font-bold py-3 px-8 rounded transition-colors">
          Back to Orders
        </Link>
      </main>
    );
  }

  // Formatting variables
  const items = Array.isArray(order.items) ? order.items : [];
  const packages = Array.isArray(order.packages) ? order.packages : [];
  const hasSplitShipment = packages.length > 1;
  const address = order.shipping_address || {};

  // Status visualizer logic
  const determineStep = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'delivered') return 4;
    if (s === 'shipped') return 3;
    if (s === 'in production' || s === 'processing') return 2;
    return 1; // Order Placed
  };
  const currentStep = determineStep(order.status);

  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <Link href={isGuest ? "/" : "/orders"} className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-haitiBlue mb-6 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          {isGuest ? "Back to Home" : "Back to Orders"}
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-ethoDark">Order #{order.id.substring(0, 8).toUpperCase()}</h1>
            {/* THE SUCCESS MESSAGE */}
            {currentStep <= 2 && (
              <p className="text-green-600 font-bold mt-2 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                Thank you for your order! Your gear is in progress.
              </p>
            )}
            <p className="text-gray-500 mt-2">Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          {isGuest && (
             <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full w-max">Guest View</span>
          )}
        </div>

        {/* Split Shipment Blue Banner */}
        {hasSplitShipment && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3 mb-8 items-start shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-haitiBlue flex-shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
            <div>
              <h3 className="font-bold text-ethoDark text-sm">Multiple Shipments</h3>
              <p className="text-xs text-gray-600 mt-1">To get your gear to you as fast as possible, your items are being custom-printed at specialized facilities and will arrive in separate packages.</p>
            </div>
          </div>
        )}

        {/* Global Timeline */}
        {!hasSplitShipment && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
            <div className="flex items-center justify-between mb-8 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 z-0"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-haitiBlue z-0 transition-all duration-500" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>

              <div className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 1 ? 'bg-haitiBlue text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>1</div>
                <span className={`text-xs font-bold hidden sm:block ${currentStep >= 1 ? 'text-ethoDark' : 'text-gray-400'}`}>Placed</span>
              </div>
              
              <div className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 2 ? 'bg-haitiBlue text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>2</div>
                <span className={`text-xs font-bold hidden sm:block ${currentStep >= 2 ? 'text-ethoDark' : 'text-gray-400'}`}>Production</span>
              </div>

              <div className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 3 ? 'bg-haitiBlue text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>3</div>
                <span className={`text-xs font-bold hidden sm:block ${currentStep >= 3 ? 'text-ethoDark' : 'text-gray-400'}`}>Shipped</span>
              </div>

              <div className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 4 ? 'bg-haitiBlue text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>✓</div>
                <span className={`text-xs font-bold hidden sm:block ${currentStep >= 4 ? 'text-ethoDark' : 'text-gray-400'}`}>Delivered</span>
              </div>
            </div>

            {currentStep >= 3 && packages[0]?.url && (
              <a href={packages[0].url} target="_blank" rel="noopener noreferrer" className="w-full block text-center bg-haitiBlue hover:bg-blue-800 text-white font-extrabold py-4 px-4 rounded-lg shadow-md transition-colors text-lg">
                Track Package
              </a>
            )}
          </div>
        )}

        {/* Package / Item Breakdown */}
        <div className="space-y-6 mb-8">
          {packages.length > 0 ? (
            packages.map((pkg, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h2 className="font-extrabold text-lg text-ethoDark">📦 Package {hasSplitShipment ? index + 1 : ''}</h2>
                  <span className={`px-3 py-1 text-xs font-extrabold rounded-full uppercase tracking-wide ${pkg.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {pkg.status || 'Processing'}
                  </span>
                </div>
                
                <div className="p-4 sm:p-6 divide-y divide-gray-100">
                  {pkg.items?.map((item, i) => (
                    <div key={i} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                       <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                          {item.image ? <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain"/> : <div className="w-full h-full bg-gray-200"></div>}
                       </div>
                       <div className="flex-grow">
                         <p className="font-bold text-ethoDark text-sm sm:text-base line-clamp-1">{item.name}</p>
                         <p className="text-xs text-gray-500 mt-1">{item.selectedSize} / {item.selectedColor}</p>
                         <p className="text-xs font-bold text-gray-500 mt-1">Qty: {item.quantity}</p>
                       </div>
                    </div>
                  ))}
                </div>

                {pkg.url ? (
                   <div className="p-4 bg-gray-50 border-t border-gray-100">
                     <a href={pkg.url} target="_blank" rel="noopener noreferrer" className="w-full block text-center bg-white border-2 border-haitiBlue text-haitiBlue hover:bg-haitiBlue hover:text-white font-extrabold py-2 px-4 rounded transition-colors text-sm">
                       Track Package {hasSplitShipment ? index + 1 : ''}
                     </a>
                   </div>
                ) : (
                   <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-400 font-medium">
                     Tracking link will appear here once shipped.
                   </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50">
                  <h2 className="font-extrabold text-lg text-ethoDark">Items in Order</h2>
               </div>
               <div className="p-4 sm:p-6 divide-y divide-gray-100">
                  {items.map((item, i) => (
                    <div key={i} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                       <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                          {item.image ? <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain"/> : <div className="w-full h-full bg-gray-200"></div>}
                       </div>
                       <div className="flex-grow">
                         <p className="font-bold text-ethoDark text-sm sm:text-base line-clamp-1">{item.name}</p>
                         <p className="text-xs text-gray-500 mt-1">{item.selectedSize} / {item.selectedColor}</p>
                         <p className="text-xs font-bold text-gray-500 mt-1">Qty: {item.quantity}</p>
                       </div>
                    </div>
                  ))}
                </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-ethoDark mb-4 border-b border-gray-100 pb-2">Shipping Address</h3>
            {isGuest ? (
              <div className="space-y-1">
                <p className="text-sm text-gray-600 italic mb-2">Street address hidden for privacy.</p>
                <p className="text-sm font-bold text-ethoDark">{address.city || 'City Hidden'}, {address.state || 'State Hidden'}</p>
                <p className="text-sm text-gray-500">{address.country === 'US' ? 'United States' : address.country}</p>
              </div>
            ) : (
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-bold text-ethoDark">{order.shipping_address?.first_name} {order.shipping_address?.last_name}</p>
                <p>{address.address1 || address.address_1}</p>
                {address.address2 && <p>{address.address2}</p>}
                <p>{address.city}, {address.region || address.state} {address.zip || address.postcode}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
             <h3 className="font-bold text-ethoDark mb-4 border-b border-gray-100 pb-2">Order Summary</h3>
             <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping & Taxes</span>
                  <span className="text-green-600 font-bold tracking-wide">FREE</span>
                </div>
                <div className="flex justify-between font-black text-ethoDark text-lg pt-3 border-t border-gray-100 mt-2">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
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