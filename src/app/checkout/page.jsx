"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { createClient } from '@/lib/supabase';
import { formatPrice } from '@/utils/formatPrice';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function CheckoutPage() {
  const { cart, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();

  const [mounted, setMounted] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  
  // New States for the "Vault Door" & Shipping Logic
  const [address, setAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [realShipping, setRealShipping] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  // Subtotal is now the FINAL total since shipping is free
  const subtotal = cart.reduce((total, item) => total + (Number(item.price || 0) * item.quantity), 0);
  const total = subtotal; // Zero added for shipping/taxes

  useEffect(() => {
    setMounted(true);
    if (cart.length === 0 && !paymentSuccess) {
      router.push('/cart');
    }
  }, [cart.length, router, paymentSuccess]);

  // 1. Fetch Verified Address on Load
  useEffect(() => {
    async function fetchAddress() {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data && data.address_1) {
          setAddress(data);
        }
      }
      setLoadingAddress(false);
    }
    fetchAddress();
  }, [user, supabase]);

  // 2. Fetch the "Real" Shipping Cost to Strike Through
  useEffect(() => {
    async function getShippingCost() {
      if (address && cart.length > 0) {
        setLoadingShipping(true);
        try {
          const res = await fetch('/api/calculate-shipping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, cart })
          });
          const data = await res.json();
          if (data.shippingCost) {
            setRealShipping(data.shippingCost);
          }
        } catch (error) {
          console.error("Failed to fetch shipping estimation");
        } finally {
          setLoadingShipping(false);
        }
      }
    }
    getShippingCost();
  }, [address, cart]);


  // THE GOAFFPRO CONVERSION TRIGGER
  useEffect(() => {
    if (paymentSuccess && typeof window !== 'undefined' && window.goaffproTrackConversion) {
      window.goaffproTrackConversion({
        id: paymentSuccess,
        amount: total, 
      });
    }
  }, [paymentSuccess, total]);

  const initialOptions = {
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
  };

  const createOrder = async () => {
    const res = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total }), // Only charging the subtotal!
    });
    const order = await res.json();
    return order.id;
  };

  const onApprove = async (data) => {
    const authStorage = JSON.parse(localStorage.getItem('ethohaiti-auth') || '{}');
    const authUser = authStorage?.state?.user;

    const res = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        orderID: data.orderID,
        cart: cart, 
        userId: authUser?.id || null,
        userEmail: authUser?.email || null
      }),
    });
    const details = await res.json();

    if (details.status === "COMPLETED") {
      if (typeof window !== 'undefined' && window.goaffproTrackConversion) {
        window.goaffproTrackConversion({ id: data.orderID, total: total });
      }
      setPaymentSuccess(data.orderID);
      clearCart();
      setTimeout(() => {
        router.push("/orders"); 
      }, 3000);
    } else {
      alert("Payment failed or was declined by PayPal.");
    }
  };

  if (!mounted) return <div className="pt-32 min-h-screen bg-ethoBg"></div>;

  if (paymentSuccess) {
    return (
      <main className="pt-32 pb-20 min-h-screen bg-ethoBg flex flex-col items-center justify-center text-center px-4">
        <div className="bg-white p-12 rounded-xl shadow-lg border border-green-100 max-w-lg">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-ethoDark mb-4">Payment Successful!</h1>
          <p className="text-gray-500 mb-8">Thank you for your order. We are processing it with Printify now.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-green-600 mx-auto"></div>
          <p className="text-xs text-gray-400 mt-4">Redirecting to your dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <PayPalScriptProvider options={initialOptions}>
      <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-ethoDark mb-8 text-center lg:text-left">Secure Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left Column - Order Summary */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 h-fit">
              <h2 className="text-2xl font-bold text-ethoDark mb-6 border-b pb-4">Order Summary</h2>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar mb-6">
                {cart.map((item) => (
                   <div key={item.cartItemId} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center p-2">
                      <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-sm text-ethoDark line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} | {item.selectedSize} {item.selectedColor}</p>
                    </div>
                    <div className="font-bold text-ethoDark">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-6 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-ethoDark">{formatPrice(subtotal)}</span>
                </div>
                
                {/* THE PSYCHOLOGICAL SHIPPING TRICK */}
                <div className="flex justify-between items-center text-gray-600">
                  <span>Shipping</span>
                  <div>
                    {loadingShipping ? (
                       <span className="text-xs italic">Calculating...</span>
                    ) : realShipping ? (
                      <>
                        <span className="line-through text-haitiRed opacity-70 mr-2">${realShipping}</span>
                        <span className="font-black text-green-600 tracking-wide">FREE</span>
                      </>
                    ) : (
                      <span className="font-black text-green-600 tracking-wide">FREE</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between text-2xl font-black text-ethoDark pt-4 mt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Payment & Shipping Gateway */}
            <div className="flex flex-col gap-6">
              
              {loadingAddress ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 flex justify-center">
                   <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-haitiBlue"></div>
                </div>
              ) : !address ? (
                
                /* THE VAULT DOOR: Block Payment if No Address */
                <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-haitiRed text-center">
                  <div className="bg-red-50 p-4 rounded-full inline-block mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-haitiRed">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-ethoDark mb-2">Missing Shipping Address</h2>
                  <p className="text-sm text-gray-500 mb-6">You must provide a valid delivery address before you can securely checkout.</p>
                  <Link href="/addresses" className="w-full block bg-haitiRed hover:bg-red-700 text-white font-extrabold py-3 px-4 rounded shadow-md transition-colors">
                    Add Shipping Address
                  </Link>
                </div>

              ) : (

                /* PAYMENT GATEWAY (Address is Verified) */
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                  <div className="mb-6 bg-gray-50 p-4 rounded border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Shipping To:</h3>
                    <p className="font-bold text-ethoDark">{address.first_name} {address.last_name}</p>
                    <p className="text-sm text-gray-600">{address.address_1}</p>
                    <p className="text-sm text-gray-600">{address.city}, {address.state} {address.postcode}</p>
                  </div>

                  <h2 className="text-xl font-bold text-ethoDark mb-2">Payment</h2>
                  <p className="text-sm text-gray-500 mb-8">All transactions are secure and encrypted.</p>
                  
                  <div className="relative z-0">
                    {process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? (
                      <PayPalButtons 
                        createOrder={createOrder} 
                        onApprove={onApprove} 
                        style={{ layout: "vertical", shape: "rect", color: "gold" }}
                      />
                    ) : (
                      <div className="p-4 bg-red-50 text-red-600 font-bold rounded border border-red-200 text-center">
                        Missing PayPal Client ID in Environment Variables.
                      </div>
                    )}
                  </div>
                </div>

              )}

              <div className="text-center text-sm text-gray-500">
                <p>Need help with your order?</p>
                <Link href="/support" className="text-haitiBlue font-bold hover:underline">Contact Customer Support</Link>
              </div>

            </div>
          </div>
        </div>
      </main>
    </PayPalScriptProvider>
  );
}