"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';

export default function ProductCard({ product }) {
  const cleanName = product.name?.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&") || "Product";
  const [addedToCart, setAddedToCart] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    e.stopPropagation();

    let numericPrice = 0;
    if (product.prices?.price) { numericPrice = Number(product.prices.price) / 100; } 
    else if (product.price) { numericPrice = Number(product.price); }
    
    addToCart({ 
      id: product.id, 
      variationId: null, 
      cartItemId: `${product.id}-${Date.now()}`, 
      name: cleanName, 
      price: numericPrice, 
      price_html: product.price_html, 
      image: product.images?.[0]?.src || "https://placehold.co/500x500.png?text=No+Image",
      selectedColor: null, 
      selectedSize: null, 
      productData: product // Passed so the cart knows what options are available!
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWhatsApp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const phoneNumber = "18495067098"; 
    const productUrl = `${window.location.origin}/product/${product.slug}`;
    const message = `Hi EthoHaiti! I'd like to buy this item: ${productUrl}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const productUrl = `${window.location.origin}/product/${product.slug}`;
    const shareData = { title: cleanName, text: `Check out this gear on EthoHaiti!`, url: productUrl };
    
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try { await navigator.share(shareData); } catch (err) { console.log("Share cancelled"); }
    } else {
      navigator.clipboard.writeText(productUrl);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  return (
    <Link href={`/product/${product.slug}`} className="bg-white rounded-lg shadow hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col relative">
      
      {copiedToast && (
        <div className="absolute top-14 right-3 z-20 bg-ethoDark text-white text-xs font-bold px-3 py-2 rounded shadow-md whitespace-nowrap">
          Link Copied!
        </div>
      )}
      
      <button onClick={handleShare} className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-500 hover:text-haitiBlue transition-colors shadow-sm" title="Share Product">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" /></svg>
      </button>

      {/* OPTIMIZED NEXT.JS IMAGE WRAPPER */}
      <div className="relative h-72 bg-gray-100 overflow-hidden">
        <Image 
          src={product.images?.[0]?.src || "https://placehold.co/500x500.png?text=No+Image"} 
          alt={cleanName} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
        />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{cleanName}</h2>
          <span className="text-haitiBlue font-extrabold text-lg" dangerouslySetInnerHTML={{ __html: product.price_html || "" }}></span>
        </div>
        
        <div className="mt-auto flex gap-2 w-full">
          <button 
            onClick={handleAddToCart} 
            className={`flex-grow py-3 rounded font-bold text-sm text-white transition-colors shadow-sm ${addedToCart ? 'bg-green-600' : 'bg-haitiRed hover:bg-red-700'}`}
          >
            {addedToCart ? 'Added!' : 'Add to Cart'}
          </button>
          
          <button 
            onClick={handleWhatsApp} 
            className="w-12 flex-shrink-0 bg-[#25D366] hover:bg-[#128C7E] flex items-center justify-center rounded shadow-sm text-white transition-colors" 
            title="Buy via WhatsApp"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          </button>
        </div>
      </div>
    </Link>
  );
}