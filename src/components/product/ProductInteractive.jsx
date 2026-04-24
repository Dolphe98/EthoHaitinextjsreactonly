"use client";

import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProductInteractive({ product }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editCartItemId = searchParams.get('editCartItem');

  const cleanName = product.name?.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&") || "Product";
  
  // Gallery States
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const carouselRef = useRef(null);
  const images = product.images || [{ src: "https://placehold.co/800x800.png?text=No+Image" }];
  
  // Cart & Feedback States
  const { cart, addToCart, overwriteCartItem } = useCartStore();
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartError, setCartError] = useState("");

  // Edit Mode Logic
  const itemToEdit = cart.find(item => item.cartItemId === editCartItemId);
  const isEditMode = !!editCartItemId && !!itemToEdit;
  const [hasInitializedEdit, setHasInitializedEdit] = useState(false);

  // Modals & Accordions
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(true);
  const [isWhatsAppLoading, setIsWhatsAppLoading] = useState(false);

  const colorAttr = product.attributes?.find( a => a.name.toLowerCase() === 'color' || a.name.toLowerCase() === 'colors' );
  const sizeAttr = product.attributes?.find( a => a.name.toLowerCase() === 'size' || a.name.toLowerCase() === 'sizes' );
  const colorOptions = colorAttr?.terms ? colorAttr.terms.map(t => t.name) : (colorAttr?.options || []);
  const sizeOptions = sizeAttr?.terms ? sizeAttr.terms.map(t => t.name) : (sizeAttr?.options || []);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // Initializer for Edit Mode
  useEffect(() => {
    if (isEditMode && !hasInitializedEdit) {
      if (itemToEdit.selectedColor) {
        setSelectedColor(itemToEdit.selectedColor);
        updateImageToMatchColor(itemToEdit.selectedColor);
      }
      if (itemToEdit.selectedSize) {
        setSelectedSize(itemToEdit.selectedSize);
      }
      setHasInitializedEdit(true);
    }
  }, [isEditMode, itemToEdit, hasInitializedEdit]);

  // Sync Carousel Scroll to Dots
  const handleScroll = (e) => {
    const scrollPosition = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    const newIndex = Math.round(scrollPosition / width);
    if (newIndex !== activeImgIndex) setActiveImgIndex(newIndex);
  };

  const updateImageToMatchColor = (color) => {
    const colorVariation = product.variations?.find(v => 
      v.attributes.some(attr => attr.name.toLowerCase().includes('color') && (attr.value === color || attr.option === color)) && 
      (v.image?.src || v.image)
    );
    if (colorVariation) {
      const targetSrc = colorVariation.image?.src || colorVariation.image;
      const targetIndex = images.findIndex(img => img.src === targetSrc);
      if (targetIndex !== -1) {
        setActiveImgIndex(targetIndex);
        if (carouselRef.current) {
          carouselRef.current.scrollTo({ left: targetIndex * carouselRef.current.offsetWidth, behavior: 'smooth' });
        }
      }
    }
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setCartError(""); 
    updateImageToMatchColor(color);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setCartError(""); 
  };

  const selectedVariation = product.variations?.find(variation => {
    const matchesColor = selectedColor ? variation.attributes.some( attr => attr.name.toLowerCase().includes('color') && (attr.value === selectedColor || attr.option === selectedColor) ) : true;
    const matchesSize = selectedSize ? variation.attributes.some( attr => attr.name.toLowerCase().includes('size') && (attr.value === selectedSize || attr.option === selectedSize) ) : true;
    return matchesColor && matchesSize;
  });

  const isColorRequired = colorOptions.length > 0 && !selectedColor;
  const isSizeRequired = sizeOptions.length > 0 && !selectedSize;

  const handleAddToCart = () => {
    if (isColorRequired || isSizeRequired) {
      setCartError("Please select a size and color.");
      return;
    }

    let numericPrice = 0;
    if (selectedVariation?.prices?.price) { numericPrice = Number(selectedVariation.prices.price) / 100; } 
    else if (selectedVariation?.price) { numericPrice = Number(selectedVariation.price); } 
    else if (product.prices?.price) { numericPrice = Number(product.prices.price) / 100; } 
    else if (product.price) { numericPrice = Number(product.price); }
    
    const imageToSave = images[activeImgIndex]?.src || images[0]?.src;

    if (isEditMode) {
      overwriteCartItem(editCartItemId, {
        variationId: selectedVariation?.id || null,
        price: numericPrice,
        price_html: selectedVariation?.price_html || product.price_html,
        image: imageToSave,
        selectedColor,
        selectedSize,
      });
      setAddedToCart(true);
      setTimeout(() => router.push('/cart'), 500); 
    } else {
      addToCart({ 
        id: product.id, 
        variationId: selectedVariation?.id || null, 
        cartItemId: `${product.id}-${selectedVariation?.id || selectedColor || 'base'}-${selectedSize || 'base'}`, 
        name: cleanName, 
        price: numericPrice, 
        price_html: selectedVariation?.price_html || product.price_html, 
        image: imageToSave, 
        selectedColor, 
        selectedSize, 
        productData: product 
      });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    if (isColorRequired || isSizeRequired) {
      setCartError("Please select a size and color.");
      return;
    }

    setIsWhatsAppLoading(true);
    const phoneNumber = "18495067098"; 
    const productUrl = window.location.href;
    
    let variantsText = [];
    if (selectedColor) variantsText.push(selectedColor);
    if (selectedSize) variantsText.push(selectedSize);
    
    const message = `Hi EthoHaiti! I'd like to buy this item: ${cleanName} - ${variantsText.join(", ")}. Here is the link: ${productUrl}`;
    const encodedMessage = encodeURIComponent(message);
    
    setTimeout(() => {
      window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
      setIsWhatsAppLoading(false);
    }, 600);
  };

  const handleShare = async () => {
    const shareData = { title: cleanName, text: `Check out this gear on EthoHaiti!`, url: window.location.href };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try { await navigator.share(shareData); } catch (err) { console.log("User cancelled share"); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  const basePriceHtml = product.price_html ? product.price_html.split(/&ndash;|-/)[0].trim() : "";
  const displayPriceHtml = selectedVariation?.price_html || basePriceHtml;

  return (
    <>
      {/* TOASTS */}
      {copiedToast && (
        <div className="fixed top-24 right-4 z-[100] bg-ethoDark text-white text-sm font-bold px-4 py-3 rounded shadow-xl flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
          Link copied!
        </div>
      )}

      {/* SIZE GUIDE MODAL */}
      {showSizeGuide && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-end sm:items-center justify-center sm:p-4" onClick={() => setShowSizeGuide(false)}>
          <div className="bg-white w-full sm:w-[500px] rounded-t-2xl sm:rounded-xl p-6 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h3 className="text-xl font-bold text-ethoDark flex items-center gap-2">
                📏 Size Guide
              </h3>
              <button onClick={() => setShowSizeGuide(false)} className="text-gray-400 hover:text-gray-800 bg-gray-100 rounded-full p-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="py-4 text-gray-600 text-sm">
              <p className="mb-4 font-medium">Measurements are provided by our Print Providers. For the best fit, measure a similar garment you already own and compare it to the available sizes.</p>
              {/* Add your specific measurement tables here based on product type later */}
              <div className="bg-gray-50 rounded p-4 text-center border border-gray-200">
                Detailed measurement charts coming soon! 
              </div>
            </div>
            <button onClick={() => setShowSizeGuide(false)} className="w-full bg-ethoDark text-white py-3 rounded font-bold mt-2">Close Guide</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 max-w-6xl mx-auto">
        
        {/* ========================================== */}
        {/* LEFT COLUMN: SWIPEABLE GALLERY             */}
        {/* ========================================== */}
        <div className="flex flex-col relative w-full overflow-hidden">
          
          {/* Share Button Overlay */}
          <button onClick={handleShare} className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-full text-ethoDark shadow-lg hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
          </button>

          {/* Carousel */}
          <div 
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory rounded-2xl bg-gray-100 aspect-square border border-gray-200 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
          >
            {images.map((img, index) => (
              <div key={index} className="min-w-full h-full snap-center relative flex items-center justify-center p-4">
                <Image 
                  src={img.src} 
                  alt={`${cleanName} image ${index + 1}`} 
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain pointer-events-none"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          {/* Dots Pagination */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {images.map((_, index) => (
                <button 
                  key={index} 
                  onClick={() => {
                     carouselRef.current?.scrollTo({ left: index * carouselRef.current.offsetWidth, behavior: 'smooth' });
                  }}
                  className={`transition-all duration-300 rounded-full ${index === activeImgIndex ? 'w-6 h-2 bg-haitiBlue' : 'w-2 h-2 bg-gray-300'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: AMAZON BUY BOX UX            */}
        {/* ========================================== */}
        <div className="flex flex-col pb-10">
          
          {isEditMode && (
             <div className="bg-ethoDark text-white text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-2 mb-4 w-max shadow-sm">
               Editing Cart Item
             </div>
          )}

          {/* Title & Price */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-ethoDark mb-2 leading-tight">
            {cleanName}
          </h1>
          
          <div 
            className="text-4xl font-extrabold text-haitiBlue mb-6"
            dangerouslySetInnerHTML={{ __html: displayPriceHtml }}
          ></div>

          <hr className="border-gray-200 mb-6" />

          {/* Color Selector */}
          {colorOptions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-extrabold text-ethoDark mb-3">
                Color: <span className="text-gray-600 font-medium ml-1">{selectedColor || "Select"}</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {colorOptions.map(color => (
                  <button 
                    key={color} 
                    onClick={() => handleColorSelect(color)}
                    className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all border-2 ${
                      selectedColor === color 
                        ? 'border-haitiBlue bg-blue-50 text-haitiBlue shadow-sm' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {sizeOptions.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-end mb-3">
                <h3 className="text-sm font-extrabold text-ethoDark">
                  Size: <span className="text-gray-600 font-medium ml-1">{selectedSize || "Select"}</span>
                </h3>
                <button onClick={() => setShowSizeGuide(true)} className="text-sm font-bold text-haitiBlue hover:underline flex items-center gap-1">
                  📏 Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {sizeOptions.map(size => (
                  <button 
                    key={size} 
                    onClick={() => handleSizeSelect(size)}
                    className={`min-w-[4rem] h-12 px-2 flex justify-center items-center rounded-lg font-extrabold transition-all border-2 ${
                      selectedSize === size 
                        ? 'border-haitiBlue bg-haitiBlue text-white shadow-md' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trust Signals & Delivery */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
              Made to order. Estimated delivery: 5-8 business days.
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
               <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
               See our POD return policy.
            </div>
          </div>

          {/* Validation Error */}
          {cartError && (
            <div className="mb-4 text-haitiRed text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2 animate-pulse">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {cartError}
            </div>
          )}

          {/* THE STACKED ACTION BAR */}
          <div className="flex flex-col gap-3 mt-2">
            <button 
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-xl font-extrabold text-lg text-white transition-all shadow-md flex justify-center items-center gap-2 ${
                addedToCart ? 'bg-green-600 scale-[0.98]' : 'bg-haitiRed hover:bg-red-700 hover:shadow-lg active:scale-[0.98]'
              }`}
            >
              {addedToCart ? (
                <>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  Added!
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                  {isEditMode ? "Save Changes" : "Add to Cart"}
                </>
              )}
            </button>
            
            <button 
              onClick={handleWhatsApp}
              className="w-full py-4 bg-[#25D366] hover:bg-[#128C7E] active:scale-[0.98] rounded-xl font-extrabold text-lg text-white transition-all shadow-md flex justify-center items-center gap-2"
            >
              {isWhatsAppLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  Buy via WhatsApp
                </>
              )}
            </button>
          </div>

          {/* Accordion Description */}
          <div className="mt-10 border-t border-gray-200">
            <button 
              onClick={() => setAccordionOpen(!accordionOpen)} 
              className="w-full py-5 flex justify-between items-center text-left focus:outline-none group"
            >
              <span className="text-lg font-extrabold text-ethoDark group-hover:text-haitiBlue transition-colors">Product Details</span>
              <svg className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${accordionOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${accordionOpen ? 'max-h-[1000px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
               <div 
                 className="prose prose-sm text-gray-600 leading-relaxed max-w-none"
                 dangerouslySetInnerHTML={{ __html: product.description || "No description available." }}
               ></div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}