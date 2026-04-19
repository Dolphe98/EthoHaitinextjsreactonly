"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/formatPrice';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function CheckoutPage() {
  const { cart, clearCart } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null); // Will hold the Order ID

  useEffect(() => {
    setMounted(true);
    // If cart is empty and they haven't just paid, kick them back to the shop
    if (cart.length === 0 && !paymentSuccess) {
      router.push('/cart');
    }
  }, [cart.length, router, paymentSuccess]);

  const subtotal = cart.reduce((total, item) => total + (Number(item.price || 0) * item.quantity), 0);
  // Optional: Add flat shipping or tax logic here
  const shipping = 5.00; 
  const total = subtotal + shipping;

  // THE GOAFFPRO CONVERSION TRIGGER
  useEffect(() => {
    if (paymentSuccess && typeof window !== 'undefined' && window.goaffproTrackConversion) {
      // If payment is successful, tell GoAffPro to record the sale!
      window.goaffproTrackConversion({
        id: paymentSuccess, // The PayPal Order ID
        amount: total, // The total cart amount
      });
      console.log("GoAffPro Conversion Logged for Order:", paymentSuccess);
    }
  }, [paymentSuccess, total]);

  const initialOptions = {
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
  };

  // Create Order - Calls our secure backend
  const createOrder = async () => {
    const res = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart, total }),
    });
    const order = await res.json();
    return order.id;
  };

  // Capture Order - Calls our secure backend when user hits "Pay Now"
  const onApprove = async (data) => {
    // We grab the user from localStorage (authStore) if they are logged in
    const authStorage = JSON.parse(localStorage.getItem('ethohaiti-auth') || '{}');
    const user = authStorage?.state?.user;

    const res = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        orderID: data.orderID,
        cart: cart, 
        userId: user?.id || null,
        userEmail: user?.email || null
      }),
    });
    
    const details = await res.json();

    if (details.status === "COMPLETED") {
      
      // 1. TRIGGER GOAFFPRO FIRST (Before the cart clears!)
      if (typeof window !== 'undefined') {
        const goaffproOrder = {
          id: data.orderID,
          total: total // <-- THIS WAS THE TYPO! Changed 'amount' to 'total'
        };
        
        // Fire the manual tracking function
        if (window.goaffproTrackConversion) {
          window.goaffproTrackConversion(goaffproOrder);
        }
      }

      setPaymentSuccess(data.orderID);
      clearCart(); // Now it is safe to empty the cart
      
      // 2. THE FIX: Redirect to the correct invisible route
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
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-bold text-ethoDark">{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-2xl font-black text-ethoDark pt-4 mt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Payment & Shipping */}
            <div className="flex flex-col gap-6">
              
              {/* Payment Gateway */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-ethoDark mb-2">Payment</h2>
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