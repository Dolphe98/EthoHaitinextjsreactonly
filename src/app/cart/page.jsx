"use client";

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/formatPrice';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCartStore();

  const subtotal = cart.reduce((total, item) => total + (Number(item.price || 0) * item.quantity), 0);

  if (!cart || cart.length === 0) {
    return (
      <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
        <div className="max-w-3xl mx-auto px-4 text-center py-20 bg-white rounded-lg shadow-sm">
          <div className="flex justify-center mb-6">
            <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-ethoDark">Your cart is empty</h1>
          <p className="text-gray-500 mt-4 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link href="/" className="bg-haitiBlue text-white px-8 py-3 rounded font-bold hover:bg-opacity-90 transition-colors inline-block">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-ethoDark mb-8 text-center lg:text-left">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div key={item.cartItemId} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative group">
                
                <button 
                  onClick={() => removeFromCart(item.cartItemId)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-haitiRed transition-colors"
                  title="Remove item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
                
                <div className="w-24 h-24 sm:w-20 sm:h-20 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  <img 
                    src={item.images?.[0]?.src || item.image || "https://placehold.co/80x80?text=No+Image"} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-ethoDark pr-8">
                    {item.name?.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&")}
                  </h3>
                  {(item.selectedColor || item.selectedSize) && (
                    <p className="text-sm text-gray-500 mt-1">
                      {item.selectedColor && `Color: ${item.selectedColor}`}
                      {item.selectedColor && item.selectedSize && ` | `}
                      {item.selectedSize && `Size: ${item.selectedSize}`}
                    </p>
                  )}
                  
                  <div className="mt-4 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors font-bold"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 font-semibold text-ethoDark border-x border-gray-300">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="font-bold text-haitiBlue text-lg">
                      {item.price ? formatPrice(Number(item.price)) : (
                        item.price_html ? <span dangerouslySetInnerHTML={{ __html: item.price_html }} /> : "—"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm h-fit lg:sticky lg:top-32">
            <h2 className="text-2xl font-extrabold text-ethoDark mb-6 border-b pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.cartItemId} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate pr-4">{item.name} × {item.quantity}</span>
                  <span className="font-semibold text-ethoDark">
                    {formatPrice(Number(item.price || 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-ethoDark">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-gray-500 text-center bg-gray-50 p-2 rounded">
                Shipping calculated at checkout
              </p>
              <div className="flex justify-between text-xl font-black text-ethoDark pt-2">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
            
            <Link href="/checkout" className="block w-full text-center bg-haitiRed text-white py-4 font-extrabold rounded hover:bg-opacity-90 transition-colors mb-4 shadow-md">
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