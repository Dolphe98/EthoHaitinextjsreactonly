"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { createClient } from '@/lib/supabase';
import { formatPrice } from '@/utils/formatPrice';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// CUSTOM DROPDOWN TO BYPASS NATIVE MOBILE OS WHEELS
function CustomSelect({ options, value, onChange, placeholder, hasError }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        className={`flex items-center justify-between text-xs border rounded px-2 py-1.5 min-w-[110px] focus:ring-2 focus:ring-haitiBlue focus:outline-none cursor-pointer shadow-sm ${
          hasError 
            ? 'border-red-400 bg-red-50 text-red-700 font-bold outline-red-200' 
            : 'border-gray-300 text-gray-700 bg-white'
        }`}
      >
        <span className="truncate">{value || placeholder}</span>
        <svg className={`w-3 h-3 ml-2 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute left-0 z-50 w-max min-w-full mt-1 bg-white border border-gray-200 rounded shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`px-3 py-2 text-xs cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-0 ${
                  value === opt ? 'bg-gray-50 font-bold text-haitiBlue' : 'text-gray-700'
                }`}
              >
                {opt}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const { cart, clearCart, updateCartItemVariants } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();

  const [mounted, setMounted] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [address, setAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [realShipping, setRealShipping] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  // SYNced with addresses/page.jsx structure
  const [guestForm, setGuestForm] = useState({
    id: '', fullName: '', email: '', phone: '', address_1: '', address_2: '', city: '', state: '', postcode: '', country: 'US', delivery_instructions: ''
  });

  const subtotal = cart.reduce((total, item) => total + (Number(item.price || 0) * item.quantity), 0);
  const total = subtotal;

  // Security check: Block PayPal if variants are missing
  const hasUnconfiguredItems = cart.some(item => {
    if (!item.productData) return false;
    const colorAttr = item.productData.attributes?.find( a => a.name.toLowerCase() === 'color' || a.name.toLowerCase() === 'colors' );
    const sizeAttr = item.productData.attributes?.find( a => a.name.toLowerCase() === 'size' || a.name.toLowerCase() === 'sizes' );
    const colorOptions = colorAttr?.terms ? colorAttr.terms.map(t => t.name) : (colorAttr?.options || []);
    const sizeOptions = sizeAttr?.terms ? sizeAttr.terms.map(t => t.name) : (sizeAttr?.options || []);
    return (colorOptions.length > 0 && !item.selectedColor) || (sizeOptions.length > 0 && !item.selectedSize);
  });

  useEffect(() => {
    setMounted(true);
    if (cart.length === 0 && !paymentSuccess) {
      router.push('/cart');
    }
  }, [cart.length, router, paymentSuccess]);

  // Auto-fill email if logged in
  useEffect(() => {
    if (user?.email && !guestForm.email) {
      setGuestForm(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    async function fetchAddress() {
      if (user?.id) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data?.address_book && data.address_book.length > 0) setAddress(data.address_book[0]);
        else if (data && data.address_1) setAddress(data);
      }
      setLoadingAddress(false);
    }
    fetchAddress();
  }, [user, supabase]);

  useEffect(() => {
    async function getShippingCost() {
      if (address && cart.length > 0 && !hasUnconfiguredItems) {
        setLoadingShipping(true);
        try {
          const res = await fetch('/api/calculate-shipping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, cart })
          });
          const data = await res.json();
          if (data.shippingCost) setRealShipping(data.shippingCost);
        } catch (error) {
          console.error("Failed to fetch shipping estimation");
        } finally {
          setLoadingShipping(false);
        }
      }
    }
    getShippingCost();
  }, [address, cart, hasUnconfiguredItems]);

  const initialOptions = {
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
  };

  const createOrder = async () => {
    const res = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total }), 
    });
    const order = await res.json();
    return order.id;
  };

  const onApprove = async (data) => {
    const authStorage = JSON.parse(localStorage.getItem('ethohaiti-auth') || '{}');
    const authUser = authStorage?.state?.user;
    const finalEmail = authUser?.email || address?.email || null;

    const res = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        orderID: data.orderID, cart: cart, userId: authUser?.id || null, userEmail: finalEmail, shippingAddress: address 
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
        if (authUser?.id) router.push(`/orders/${data.orderID}`); 
        else router.push(`/orders/${data.orderID}?email=${encodeURIComponent(details.email || finalEmail)}`); 
      }, 3000);
    } else {
      alert("Payment failed or was declined by PayPal.");
    }
  };

  const handleGuestSubmit = async (e) => { 
    e.preventDefault(); 
    setAddress(guestForm); // Update local state so they can instantly proceed to payment
    
    // If logged in, quietly save this new address to their profile in the background
    if (user?.id) {
      const addressToSave = { ...guestForm, id: Date.now().toString() };
      const defaultNameParts = addressToSave.fullName.trim().split(' ');

      // Fetch existing address book to prepend the new one
      const { data } = await supabase.from('profiles').select('address_book').eq('id', user.id).single();
      const currentBook = data?.address_book || [];
      const newAddressBook = [addressToSave, ...currentBook];

      const { error } = await supabase
        .from('profiles')
        .update({
          address_book: newAddressBook,
          first_name: defaultNameParts[0] || '',
          last_name: defaultNameParts.slice(1).join(' ') || '',
          phone: addressToSave.phone,
          address_1: addressToSave.address_1,
          address_2: addressToSave.address_2,
          city: addressToSave.city,
          state: addressToSave.state,
          postcode: addressToSave.postcode,
          country: addressToSave.country
        })
        .eq('id', user.id);
        
      if (error) console.error("Background save failed:", error);
    }
  };
  
  const handleGuestChange = (e) => { setGuestForm({ ...guestForm, [e.target.name]: e.target.value }); };

  // MANAGER FIX: Replaced "white screen of death" with a High-Fidelity 2-Column Skeleton Loader
  if (!mounted) {
    return (
      <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-64 mb-8 mx-auto lg:mx-0"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column Skeleton (Order Summary) */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-fit">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="space-y-4 mb-6">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex justify-between"><div className="h-4 bg-gray-200 rounded w-16"></div><div className="h-4 bg-gray-200 rounded w-16"></div></div>
                <div className="flex justify-between"><div className="h-4 bg-gray-200 rounded w-20"></div><div className="h-4 bg-gray-200 rounded w-12"></div></div>
                <div className="flex justify-between mt-4 pt-4 border-t"><div className="h-6 bg-gray-200 rounded w-16"></div><div className="h-6 bg-gray-200 rounded w-20"></div></div>
              </div>
            </div>

            {/* Right Column Skeleton (Address/Payment) */}
            <div className="flex flex-col gap-6">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                <div className="space-y-5">
                  <div className="h-12 bg-gray-200 rounded w-full"></div>
                  <div className="h-12 bg-gray-200 rounded w-full"></div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="h-12 bg-gray-200 rounded w-full"></div>
                    <div className="h-12 bg-gray-200 rounded w-full"></div>
                  </div>
                  <div className="h-12 bg-gray-200 rounded w-full"></div>
                  <div className="h-14 bg-gray-200 rounded w-full mt-4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (paymentSuccess) {
    return (
      <main className="pt-32 pb-20 min-h-screen bg-ethoBg flex flex-col items-center justify-center text-center px-4">
        <div className="bg-white p-12 rounded-xl shadow-lg border border-green-100 max-w-lg">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-ethoDark mb-4">Payment Successful!</h1>
          <p className="text-gray-500 mb-8">Thank you for your order. We are processing it with Printify now.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-green-600 mx-auto"></div>
          <p className="text-xs text-gray-400 mt-4">Taking you to your tracking page...</p>
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
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar mb-6">
                {cart.map((item) => {
                  const product = item.productData;
                  let colorOptions = [];
                  let sizeOptions = [];
                  
                  if (product) {
                    const colorAttr = product.attributes?.find( a => a.name.toLowerCase() === 'color' || a.name.toLowerCase() === 'colors' );
                    const sizeAttr = product.attributes?.find( a => a.name.toLowerCase() === 'size' || a.name.toLowerCase() === 'sizes' );
                    colorOptions = colorAttr?.terms ? colorAttr.terms.map(t => t.name) : (colorAttr?.options || []);
                    sizeOptions = sizeAttr?.terms ? sizeAttr.terms.map(t => t.name) : (sizeAttr?.options || []);
                  }
                  
                  const needsColor = colorOptions.length > 0 && !item.selectedColor;
                  const needsSize = sizeOptions.length > 0 && !item.selectedSize;
                  const needsAction = needsColor || needsSize;

                  return (
                    <div key={item.cartItemId} className={`flex items-start gap-4 p-3 rounded-lg transition-colors border ${needsAction ? 'border-red-300 bg-red-50/40' : 'border-transparent bg-gray-50'}`}>
                      
                      {/* OPTIMIZED NEXT.JS THUMBNAIL */}
                      <div className="relative w-16 h-16 bg-white rounded flex-shrink-0 border border-gray-100 shadow-sm overflow-hidden">
                        <Image 
                          src={item.image || "https://placehold.co/150x150.png?text=No+Image"} 
                          alt={item.name} 
                          fill
                          sizes="80px"
                          className="object-contain p-1" 
                        />
                      </div>

                      <div className="flex-grow">
                        <h3 className="font-bold text-sm text-ethoDark line-clamp-1">
                          {item.name?.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&")}
                        </h3>
                        
                        {needsAction && <span className="text-[10px] font-extrabold text-haitiRed uppercase tracking-wider block mt-0.5 mb-1">⚠️ Action Required</span>}

                        {(colorOptions.length > 0 || sizeOptions.length > 0) ? (
                          <div className="flex flex-col mt-2 gap-1.5">
                            <div className="flex flex-wrap gap-2">
                              {colorOptions.length > 0 && (
                                <CustomSelect 
                                  options={colorOptions}
                                  value={item.selectedColor}
                                  onChange={(val) => updateCartItemVariants(item.cartItemId, val, item.selectedSize)}
                                  placeholder="Select Color"
                                  hasError={needsColor}
                                />
                              )}
                              {sizeOptions.length > 0 && (
                                <CustomSelect 
                                  options={sizeOptions}
                                  value={item.selectedSize}
                                  onChange={(val) => updateCartItemVariants(item.cartItemId, item.selectedColor, val)}
                                  placeholder="Select Size"
                                  hasError={needsSize}
                                />
                              )}
                            </div>
                            <Link 
                              href={`/product/${product?.slug}?editCartItem=${item.cartItemId}`} 
                              className="text-[11px] text-haitiBlue hover:underline font-medium"
                            >
                              Need more info? See all product details.
                            </Link>
                          </div>
                        ) : (
                          (item.selectedColor || item.selectedSize) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.selectedColor && `Color: ${item.selectedColor}`}
                              {item.selectedColor && item.selectedSize && ` | `}
                              {item.selectedSize && `Size: ${item.selectedSize}`}
                            </p>
                          )
                        )}
                        
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200/60">
                          <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</p>
                          <div className="font-bold text-ethoDark">{formatPrice(Number(item.price) * item.quantity)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="border-t border-gray-200 pt-6 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-ethoDark">{formatPrice(subtotal)}</span>
                </div>
                
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

            {/* Right Column - Dynamic Gateway */}
            <div className="flex flex-col gap-6">
              
              {loadingAddress ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 flex justify-center">
                   <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-haitiBlue"></div>
                </div>
              ) : !address ? (
                
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-ethoDark">
                      {user?.id ? "Shipping Address" : "Guest Checkout"}
                    </h2>
                    {!user?.id && (
                      <Link href="/account" className="text-sm font-bold text-haitiBlue hover:underline">Log in instead</Link>
                    )}
                  </div>
                  <form onSubmit={handleGuestSubmit} className="space-y-5">
                    
                    <div>
                      <label className="block text-sm font-bold text-ethoDark mb-2">Country / Region</label>
                      <select name="country" value={guestForm.country} onChange={handleGuestChange} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none bg-white cursor-pointer text-black font-medium">
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-ethoDark mb-2">Full Name <span className="text-haitiRed">*</span></label>
                      <input type="text" name="fullName" value={guestForm.fullName} onChange={handleGuestChange} placeholder="First and Last Name" className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black placeholder-gray-400" required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-ethoDark mb-1">Email Address <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <p className="text-xs text-gray-500 mb-2">For order updates.</p>
                        <input type="email" name="email" value={guestForm.email} onChange={handleGuestChange} placeholder="your@email.com" className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black placeholder-gray-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-ethoDark mb-1">Phone Number <span className="text-haitiRed">*</span></label>
                        <p className="text-xs text-gray-500 mb-2">To ensure a smooth delivery experience.</p>
                        <input type="tel" name="phone" value={guestForm.phone} onChange={handleGuestChange} placeholder="(555) 555-5555" className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black placeholder-gray-400" required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-ethoDark mb-2">Address 1 <span className="text-haitiRed">*</span></label>
                      <input 
                        type="text" 
                        name="address_1" 
                        value={guestForm.address_1} 
                        onChange={handleGuestChange} 
                        placeholder="Street Address or P.O. Box" 
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black placeholder-gray-400" 
                        required 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-ethoDark mb-2">Address 2 <span className="text-gray-400 font-normal">(Optional)</span></label>
                      <input 
                        type="text" 
                        name="address_2" 
                        value={guestForm.address_2} 
                        onChange={handleGuestChange} 
                        placeholder="Apt, suite, unit, building, floor, etc." 
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black placeholder-gray-400" 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-ethoDark mb-2">City <span className="text-haitiRed">*</span></label>
                        <input type="text" name="city" value={guestForm.city} onChange={handleGuestChange} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-ethoDark mb-2">State / Province <span className="text-haitiRed">*</span></label>
                        <input type="text" name="state" value={guestForm.state} onChange={handleGuestChange} placeholder="FL or NY" className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black uppercase placeholder-gray-400" required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-ethoDark mb-2">ZIP / Postal Code <span className="text-haitiRed">*</span></label>
                      <input 
                        type="text" 
                        name="postcode" 
                        value={guestForm.postcode} 
                        onChange={handleGuestChange} 
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" 
                        required 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-ethoDark mb-2">Delivery Instructions <span className="text-gray-400 font-normal">(Optional)</span></label>
                      <textarea 
                        name="delivery_instructions" 
                        value={guestForm.delivery_instructions} 
                        onChange={handleGuestChange} 
                        maxLength={500}
                        rows={2}
                        placeholder="Gate code, leave at back door, etc."
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black placeholder-gray-400 resize-y min-h-[60px]" 
                      />
                    </div>

                    <button type="submit" className="w-full bg-ethoDark hover:bg-black text-white font-extrabold py-4 rounded mt-4 transition-colors shadow-md text-lg">
                      Save & Continue to Payment
                    </button>
                  </form>
                </div>

              ) : (

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                  <div className="mb-6 flex justify-between items-start bg-gray-50 p-4 rounded border border-gray-100">
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Shipping To:</h3>
                      <p className="font-bold text-ethoDark">{address.fullName || `${address.first_name} ${address.last_name}`}</p>
                      <p className="text-sm text-gray-600">{address.address_1}</p>
                      <p className="text-sm text-gray-600">{address.city}, {address.state} {address.postcode}</p>
                    </div>
                    {/* Even logged in users should be able to edit this order's address temporarily if they want */}
                    <button onClick={() => setAddress(null)} className="text-xs font-bold text-haitiBlue hover:underline bg-white px-3 py-1 rounded shadow-sm border border-gray-200">Edit</button>
                  </div>

                  <h2 className="text-xl font-bold text-ethoDark mb-2">Payment</h2>
                  <p className="text-sm text-gray-500 mb-8">All transactions are secure and encrypted.</p>
                  
                  {/* CHECKOUT BLOCKER */}
                  <div className="relative z-0">
                    {hasUnconfiguredItems ? (
                      <div className="p-6 bg-red-50 rounded border-2 border-red-200 text-center shadow-inner">
                        <div className="w-12 h-12 bg-white text-haitiRed rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-red-100">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="font-extrabold text-haitiRed mb-2 text-lg">Action Required</h3>
                        <p className="text-sm text-red-800 font-medium">Please select a size and color for the highlighted items in your order summary above before paying.</p>
                      </div>
                    ) : process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? (
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

              <div className="text-center text-sm text-gray-500 mt-4">
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