"use client";

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';

export default function ProductInteractive({ product }) {
  const cleanName = product.name?.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&") || "Product";
  const [activeImg, setActiveImg] = useState(product.images?.[0]?.src || "https://placehold.co/800x800?text=No+Image");
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [isZoomed, setIsZoomed] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // New States for Share and WhatsApp Logic
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isWhatsAppLoading, setIsWhatsAppLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const colorAttr = product.attributes?.find( a => a.name.toLowerCase() === 'color' || a.name.toLowerCase() === 'colors' );
  const sizeAttr = product.attributes?.find( a => a.name.toLowerCase() === 'size' || a.name.toLowerCase() === 'sizes' );
  const colorOptions = colorAttr?.terms ? colorAttr.terms.map(t => t.name) : (colorAttr?.options || []);
  const sizeOptions = sizeAttr?.terms ? sizeAttr.terms.map(t => t.name) : (sizeAttr?.options || []);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const addToCart = useCartStore((state) => state.addToCart);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    const colorVariation = product.variations?.find(v => 
      v.attributes.some(attr => attr.name.toLowerCase().includes('color') && (attr.value === color || attr.option === color)) && 
      (v.image?.src || v.image)
    );
    if (colorVariation) {
      setActiveImg(colorVariation.image?.src || colorVariation.image);
    }
  };

  const selectedVariation = product.variations?.find(variation => {
    const matchesColor = selectedColor ? variation.attributes.some( attr => attr.name.toLowerCase().includes('color') && (attr.value === selectedColor || attr.option === selectedColor) ) : true;
    const matchesSize = selectedSize ? variation.attributes.some( attr => attr.name.toLowerCase().includes('size') && (attr.value === selectedSize || attr.option === selectedSize) ) : true;
    return matchesColor && matchesSize;
  });

  const isColorRequired = colorOptions.length > 0 && !selectedColor;
  const isSizeRequired = sizeOptions.length > 0 && !selectedSize;
  const isButtonDisabled = isColorRequired || isSizeRequired;

  const handleAddToCart = () => {
    let numericPrice = 0;
    if (selectedVariation?.prices?.price) { numericPrice = Number(selectedVariation.prices.price) / 100; } 
    else if (selectedVariation?.price) { numericPrice = Number(selectedVariation.price); } 
    else if (product.prices?.price) { numericPrice = Number(product.prices.price) / 100; } 
    else if (product.price) { numericPrice = Number(product.price); }
    
    addToCart({ 
      id: product.id, 
      variationId: selectedVariation?.id || null, 
      cartItemId: `${product.id}-${selectedVariation?.id || selectedColor || 'base'}-${selectedSize || 'base'}`, 
      name: cleanName, 
      price: numericPrice, 
      price_html: selectedVariation?.price_html || product.price_html, 
      image: activeImg, 
      selectedColor, 
      selectedSize, 
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // ==========================================
  // THE NEW SHARE & WHATSAPP LOGIC
  // ==========================================

  const handleShare = async () => {
    const shareData = {
      title: cleanName,
      text: `Check out this gear on EthoHaiti!`,
      url: window.location.href
    };

    // Use Native OS Share Sheet if available
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("User cancelled share or error:", err);
      }
    } else {
      // Fallback Modal for Desktop or older browsers
      setShowShareModal(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
    setShowShareModal(false);
  };

  const handleWhatsApp = () => {
    setIsWhatsAppLoading(true);
    
    // REPLACE THIS WITH YOUR ACTUAL BUSINESS NUMBER! (Format: CountryCode + Number, no + or spaces)
    const phoneNumber = "18495067098"; 
    const productUrl = window.location.href;
    
    let variantsText = "";
    if (selectedColor && selectedSize) variantsText = `- ${selectedColor}, ${selectedSize}`;
    else if (selectedColor) variantsText = `- ${selectedColor}`;
    else if (selectedSize) variantsText = `- ${selectedSize}`;

    const message = `Hi EthoHaiti! I'd like to buy this: ${cleanName} ${variantsText}. Here is the link: ${productUrl}`;
    const encodedMessage = encodeURIComponent(message);
    
    setTimeout(() => {
      window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
      setIsWhatsAppLoading(false);
    }, 600); // Artificial delay to let the user see the "Opening..." state
  };

  const basePriceHtml = product.price_html ? product.price_html.split(/&ndash;|-/)[0].trim() : "";
  const displayPriceHtml = selectedVariation?.price_html || basePriceHtml;

  return (
    <>
      {/* TOAST NOTIFICATION: LINK COPIED */}
      <div className={`fixed bottom-24 md:bottom-10 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300 ${copiedToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-ethoDark text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 text-sm">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
          Link copied to clipboard!
        </div>
      </div>

      {/* SHARE MODAL FALLBACK */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center sm:p-4 transition-opacity" onClick={() => setShowShareModal(false)}>
          <div className="bg-white w-full sm:w-auto sm:min-w-[350px] rounded-t-2xl sm:rounded-xl p-6 shadow-2xl transform transition-transform" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-ethoDark">Share Product</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <div className="flex justify-between items-center gap-4 mb-4">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window?.location?.href)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </div>
                <span className="text-xs font-bold text-gray-500">Facebook</span>
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window?.location?.href)}&text=${encodeURIComponent('Check this out!')}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-gray-100 text-ethoDark rounded-full flex items-center justify-center group-hover:bg-ethoDark group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </div>
                <span className="text-xs font-bold text-gray-500">X</span>
              </a>
              <a href={`https://wa.me/?text=${encodeURIComponent('Check this out! ' + window?.location?.href)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-green-50 text-[#25D366] rounded-full flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                </div>
                <span className="text-xs font-bold text-gray-500">WhatsApp</span>
              </a>
              <button onClick={handleCopyLink} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center group-hover:bg-gray-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                </div>
                <span className="text-xs font-bold text-gray-500">Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        
        {/* LEFT COLUMN: THE GALLERY */}
        <div className="flex flex-col gap-4">
          <div 
            className="bg-white rounded-xl p-8 flex justify-center items-center h-[400px] sm:h-[500px] border border-gray-100 shadow-sm overflow-hidden cursor-crosshair relative"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <img 
              src={activeImg} 
              alt={cleanName} 
              style={{ transformOrigin: zoomOrigin, transform: isZoomed && !isMobile ? 'scale(2)' : 'scale(1)' }} 
              className="max-h-full max-w-full object-contain transition-transform duration-200 ease-out"
            />
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, index) => (
                <div 
                  key={img.id || index} 
                  onClick={() => setActiveImg(img.src)}
                  className={`bg-white rounded-lg p-2 h-24 flex justify-center items-center border cursor-pointer transition-all ${
                    activeImg === img.src ? 'border-haitiBlue shadow-md ring-2 ring-haitiBlue/20' : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <img src={img.src} alt={`${cleanName} view ${index + 1}`} className="max-h-full object-contain" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: THE DETAILS */}
        <div className="flex flex-col relative pb-24 md:pb-0">
          
          <div className="flex justify-between items-start gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ethoDark leading-tight tracking-tight">
              {cleanName}
            </h1>
            
            {/* THE SHARE ICON */}
            <button onClick={handleShare} className="mt-2 text-gray-400 hover:text-haitiBlue transition-colors p-2 bg-gray-50 border border-gray-100 rounded-full hover:bg-blue-50 group flex-shrink-0 shadow-sm" title="Share Product">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
            </button>
          </div>

          <div 
            className="text-2xl font-bold text-haitiBlue mb-6 transition-opacity duration-300"
            dangerouslySetInnerHTML={{ __html: displayPriceHtml }}
          ></div>

          <div 
            className="prose prose-lg text-gray-600 mb-8"
            dangerouslySetInnerHTML={{ __html: product.short_description || product.description || "" }}
          ></div>

          {/* COLOR SELECTOR */}
          {colorOptions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-ethoDark uppercase tracking-widest mb-3">
                Color:{" "}
                <span className="text-gray-500 font-medium normal-case">
                  {selectedColor || "Select a color"}
                </span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {colorOptions.map(color => (
                  <button 
                    key={color} 
                    onClick={() => handleColorSelect(color)}
                    className={`px-4 py-2 border rounded font-medium text-sm transition-all ${
                      selectedColor === color ? 'border-ethoDark bg-ethoDark text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SIZE SELECTOR */}
          {sizeOptions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-ethoDark uppercase tracking-widest mb-3">
                Size:{" "}
                <span className="text-gray-500 font-medium normal-case">
                  {selectedSize || "Select a size"}
                </span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {sizeOptions.map(size => (
                  <button 
                    key={size} 
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-12 flex justify-center items-center border rounded font-bold transition-all text-sm ${
                      selectedSize === size ? 'border-haitiBlue bg-haitiBlue text-white shadow-md' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <hr className="border-gray-200 mb-8 hidden md:block" />

          {/* DESKTOP CTA BUTTONS (Hidden on mobile) */}
          <div className="hidden md:flex flex-col gap-4">
            
            <button 
              disabled={isButtonDisabled} 
              onClick={handleAddToCart}
              className={`w-full font-extrabold text-lg py-4 rounded shadow-md transition-all flex justify-center items-center gap-2 ${
                addedToCart ? 'bg-green-600 text-white' : isButtonDisabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-haitiRed hover:bg-red-700 text-white hover:shadow-xl'
              }`}
            >
              {addedToCart ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Added to Cart!
                </>
              ) : isButtonDisabled ? (
                'Select Options Above'
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>

            <button 
              disabled={isButtonDisabled} 
              onClick={handleWhatsApp}
              className={`w-full font-extrabold text-lg py-4 rounded shadow-md transition-all flex justify-center items-center gap-2 ${
                isButtonDisabled ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#25D366] hover:bg-[#128C7E] text-white hover:shadow-xl'
              }`}
            >
              {isWhatsAppLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              ) : isButtonDisabled ? (
                'Select Options to Buy via WhatsApp'
              ) : (
                <>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  Buy via WhatsApp
                </>
              )}
            </button>

          </div>

        </div>
      </div>

      {/* MOBILE STICKY ACTION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50 flex gap-3 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
        
        <button 
          disabled={isButtonDisabled} 
          onClick={handleAddToCart}
          className={`flex-1 font-bold py-3.5 rounded flex justify-center items-center gap-1.5 text-sm shadow-sm transition-colors ${
            addedToCart ? 'bg-green-600 text-white' : isButtonDisabled ? 'bg-gray-200 text-gray-400' : 'bg-haitiRed text-white active:bg-red-800'
          }`}
        >
          {addedToCart ? "Added!" : isButtonDisabled ? "Select Options" : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>
              Cart
            </>
          )}
        </button>

        <button 
          disabled={isButtonDisabled} 
          onClick={handleWhatsApp}
          className={`flex-1 font-bold py-3.5 rounded flex justify-center items-center gap-1.5 text-sm shadow-sm transition-colors ${
            isButtonDisabled ? 'bg-gray-100 border border-gray-200 text-gray-400' : 'bg-[#25D366] text-white active:bg-[#128C7E]'
          }`}
        >
          {isWhatsAppLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          ) : isButtonDisabled ? "Select Options" : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              WhatsApp
            </>
          )}
        </button>

      </div>

    </>
  );
}