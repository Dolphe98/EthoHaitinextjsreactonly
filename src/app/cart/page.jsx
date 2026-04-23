"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/formatPrice';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, updateCartItemVariants, duplicateCartItem } = useCartStore();
  const [showConfigModal, setShowConfigModal] = useState(false);

  const subtotal = cart.reduce((total, item) => total + (Number(item.price || 0) * item.quantity), 0);

  // Security check: Find items missing a required size or color
  const hasUnconfiguredItems = cart.some(item => {
    if (!item.productData) return false;
    const colorAttr = item.productData.attributes?.find( a => a.name.toLowerCase() === 'color' || a.name.toLowerCase() === 'colors' );
    const sizeAttr = item.productData.attributes?.find( a => a.name.toLowerCase() === 'size' || a.name.toLowerCase() === 'sizes' );
    const colorOptions = colorAttr?.terms ? colorAttr.terms.map(t => t.name) : (colorAttr?.options || []);
    const sizeOptions = sizeAttr?.terms ? sizeAttr.terms.map(t => t.name) : (sizeAttr?.options || []);
    return (colorOptions.length > 0 && !item.selectedColor) || (sizeOptions.length > 0 && !item.selectedSize);
  });

  const handleCheckoutClick = (e) => {
    if (hasUnconfiguredItems) {
      e.preventDefault();
      setShowConfigModal(true);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
        <div className="max-w-3xl mx-auto px-4 text-center py-20 bg-white rounded-lg shadow-sm">
          <h1 className="text-4xl font-extrabold text-ethoDark">Your cart is empty</h1>
          <p className="text-gray-500 mt-4 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link href="/category/collection" className="bg-haitiBlue text-white px-8 py-3 rounded font-bold hover:bg-opacity-90 transition-colors inline-block">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg relative">
      
      {/* THE CHECKOUT BLOCKER MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfigModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 border-t-4 border-haitiRed text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-50 text-haitiRed rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-2xl font-black text-ethoDark mb-2">Almost Ready!</h2>
            <p className="text-gray-600 mb-8">
              Please select a size and color for the highlighted items in your cart before checking out.
            </p>
            <button onClick={() => setShowConfigModal(false)} className="w-full px-4 py-3 bg-ethoDark hover:bg-black text-white font-bold rounded transition-colors shadow-md">
              Got it
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-ethoDark mb-8 text-center lg:text-left">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2 space-y-6">
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
              <div key={item.cartItemId} className={`bg-white p-4 sm:p-6 rounded-lg shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative group transition-colors ${needsAction ? 'border-[3px] border-red-300 bg-red-50/20 mt-4' : 'border border-gray-100'}`}>
                
                {needsAction && (
                  <div className="absolute -top-3 left-4 bg-haitiRed text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full shadow-sm z-10 flex items-center gap-1">
                    ⚠️ Action Required
                  </div>
                )}
                
                <button 
                  onClick={() => removeFromCart(item.cartItemId)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-haitiRed transition-colors"
                  title="Remove item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
                
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-50 border border-gray-200 rounded flex items-center justify-center overflow-hidden">
                  <img src={item.image || "https://placehold.co/150x150?text=No+Image"} alt={item.name} className="w-full h-full object-contain p-2"/>
                </div>
                
                <div className="flex-1 text-center sm:text-left w-full">
                  <h3 className="text-lg font-bold text-ethoDark pr-8">
                    {item.name?.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&")}
                  </h3>

                  {(colorOptions.length > 0 || sizeOptions.length > 0) ? (
                    <div className="flex flex-col mt-3 mb-2 items-center sm:items-start gap-2">
                      
                      {/* The Inline Dropdowns */}
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        {colorOptions.length > 0 && (
                          <select 
                            value={item.selectedColor || ""}
                            onChange={(e) => updateCartItemVariants(item.cartItemId, e.target.value, item.selectedSize)}
                            className={`text-sm border rounded px-3 py-2 focus:ring-haitiBlue focus:outline-none cursor-pointer shadow-sm ${needsColor ? 'border-red-400 bg-red-50 text-red-700 font-bold outline-red-200' : 'border-gray-300 text-gray-700 bg-white'}`}
                          >
                            <option value="" disabled>Select Color ▾</option>
                            {colorOptions.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        )}
                        {sizeOptions.length > 0 && (
                          <select 
                            value={item.selectedSize || ""}
                            onChange={(e) => updateCartItemVariants(item.cartItemId, item.selectedColor, e.target.value)}
                            className={`text-sm border rounded px-3 py-2 focus:ring-haitiBlue focus:outline-none cursor-pointer shadow-sm ${needsSize ? 'border-red-400 bg-red-50 text-red-700 font-bold outline-red-200' : 'border-gray-300 text-gray-700 bg-white'}`}
                          >
                            <option value="" disabled>Select Size ▾</option>
                            {sizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        )}
                      </div>

                      {/* Edit Mode Link */}
                      <Link 
                        href={`/product/${product.slug}?editCartItem=${item.cartItemId}`} 
                        className="text-xs text-haitiBlue hover:underline font-medium mt-1"
                      >
                        Need more info? See all product details.
                      </Link>

                    </div>
                  ) : (
                    (item.selectedColor || item.selectedSize) && (
                      <p className="text-sm text-gray-500 mt-1">
                        {item.selectedColor && `Color: ${item.selectedColor}`}
                        {item.selectedColor && item.selectedSize && ` | `}
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                      </p>
                    )
                  )}
                  
                  <div className="mt-4 flex flex-col sm:flex-row items-center sm:justify-between gap-4 border-t border-gray-100 pt-4">
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center border border-gray-300 rounded shadow-sm w-max mx-auto sm:mx-0 bg-white">
                        <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="px-4 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors font-bold">-</button>
                        <span className="px-5 py-1.5 font-semibold text-ethoDark border-x border-gray-300">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="px-4 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors font-bold">+</button>
                      </div>
                      
                      {/* Duplicate Item Button */}
                      {(colorOptions.length > 0 || sizeOptions.length > 0) && (
                        <button 
                          onClick={() => duplicateCartItem(item.cartItemId)}
                          className="text-xs text-gray-500 hover:text-ethoDark font-bold flex items-center justify-center sm:justify-start gap-1 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>
                          Add another style/size
                        </button>
                      )}
                    </div>
                    
                    <div className="font-black text-haitiBlue text-xl">
                      {item.price ? formatPrice(Number(item.price)) : (
                        item.price_html ? <span dangerouslySetInnerHTML={{ __html: item.price_html }} /> : "—"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm h-fit lg:sticky lg:top-32 border border-gray-100">
            <h2 className="text-2xl font-extrabold text-ethoDark mb-6 border-b border-gray-100 pb-4">Order Summary</h2>
            <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-ethoDark">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-gray-500 text-center bg-gray-50 border border-gray-100 p-2 rounded">Shipping calculated at checkout</p>
              <div className="flex justify-between text-2xl font-black text-ethoDark pt-4 mt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
            
            <Link href="/checkout" onClick={handleCheckoutClick} className="block w-full text-center bg-haitiRed text-white py-4 font-extrabold text-lg rounded shadow-md hover:bg-red-700 transition-colors mb-4">
              Proceed to Checkout
            </Link>
            <Link href="/" className="block w-full text-center text-haitiBlue font-bold hover:underline transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}