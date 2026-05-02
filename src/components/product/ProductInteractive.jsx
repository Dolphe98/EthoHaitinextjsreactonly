"use client";

import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductInteractive({ product }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editCartItemId = searchParams.get('editCartItem');

  const cleanName = product.name?.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&") || "Product";
  
  // Gallery States
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false); // MANAGER FIX: Track tap-to-zoom state
  const carouselRef = useRef(null);
  
  // Cart & Feedback States
  const { cart, addToCart, overwriteCartItem } = useCartStore();
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartError, setCartError] = useState("");

  // Edit Mode Logic
  const itemToEdit = cart.find(item => item.cartItemId === editCartItemId);
  const isEditMode = !!editCartItemId && !!itemToEdit;
  const [hasInitializedEdit, setHasInitializedEdit] = useState(false);

  // UI States
  const [copiedToast, setCopiedToast] = useState(false);
  const [isWhatsAppLoading, setIsWhatsAppLoading] = useState(false);
  
  // Accordion States
  const [descStep, setDescStep] = useState(1);
  const [accordionOpen, setAccordionOpen] = useState(true);
  const [sizeTableOpen, setSizeTableOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false); // NEW
  const [careOpen, setCareOpen] = useState(false); // NEW

  const colorAttr = product.attributes?.find( a => a.name.toLowerCase() === 'color' || a.name.toLowerCase() === 'colors' );
  const sizeAttr = product.attributes?.find( a => a.name.toLowerCase() === 'size' || a.name.toLowerCase() === 'sizes' );
  const colorOptions = colorAttr?.terms ? colorAttr.terms.map(t => t.name) : (colorAttr?.options || []);
  const sizeOptions = sizeAttr?.terms ? sizeAttr.terms.map(t => t.name) : (sizeAttr?.options || []);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // NEW: Dynamic Gallery Filter
  const matchedVariationsForColor = product.variations?.filter(v => 
    selectedColor ? v.attributes.some(attr => attr.name.toLowerCase().includes('color') && (attr.value === selectedColor || attr.option === selectedColor)) : true
  ) || [];
  
  const matchedVariantIds = matchedVariationsForColor.map(v => v.id);

  let displayImages = product.images?.filter(img => 
    img.variant_ids && img.variant_ids.some(id => matchedVariantIds.includes(id))
  ) || [];

  // Fallback if no color is selected or variant_ids are missing
  if (displayImages.length === 0) {
    displayImages = product.images?.slice(0, 4) || [{ src: "https://placehold.co/800x800.png?text=No+Image" }];
  } else {
    displayImages = displayImages.slice(0, 4); // Always keep it to 4 images
  }

  const images = displayImages;

  // ==========================================
  // MANAGER FIX: Description Parsing & Slicing
  // ==========================================
  let rawDesc = product.description || "No description available.";
  
  // 1. Extract Size Table
  const tableMatch = rawDesc.match(/<table[\s\S]*?<\/table>/i);
  const sizeTableHtml = tableMatch ? tableMatch[0] : null;
  if (sizeTableHtml) rawDesc = rawDesc.replace(/<table[\s\S]*?<\/table>/i, '');

  // 2. Extract "Care instructions"
  let careHtml = null;
  const careMatch = rawDesc.match(/(?:<p>)?Care instructions(?:<\/p>)?([\s\S]*?)(?=(?:<p>)?Product features|(?:<p>)?Categories:|$)/i);
  if (careMatch) {
    careHtml = careMatch[1].trim();
    rawDesc = rawDesc.replace(/(?:<p>)?Care instructions(?:<\/p>)?[\s\S]*?(?=(?:<p>)?Product features|(?:<p>)?Categories:|$)/i, '');
  }

  // 3. Extract "Product features"
  let featuresHtml = null;
  const featuresMatch = rawDesc.match(/(?:<p>)?Product features(?:<\/p>)?([\s\S]*?)(?=(?:<p>)?Care instructions|(?:<p>)?Categories:|$)/i);
  if (featuresMatch) {
    featuresHtml = featuresMatch[1].trim();
    rawDesc = rawDesc.replace(/(?:<p>)?Product features(?:<\/p>)?[\s\S]*?(?=(?:<p>)?Care instructions|(?:<p>)?Categories:|$)/i, '');
  }

  // What is left is the main description
  const mainDescriptionHtml = rawDesc.trim();


  useEffect(() => {
    if (isEditMode && !hasInitializedEdit) {
      if (itemToEdit.selectedColor) {
        setSelectedColor(itemToEdit.selectedColor);
      }
      if (itemToEdit.selectedSize) {
        setSelectedSize(itemToEdit.selectedSize);
      }
      setHasInitializedEdit(true);
    }
  }, [isEditMode, itemToEdit, hasInitializedEdit]);

  const handleScroll = (e) => {
    const scrollPosition = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    const newIndex = Math.round(scrollPosition / width);
    if (newIndex !== activeImgIndex) setActiveImgIndex(newIndex);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setCartError(""); 
    
    // Reset gallery to the first angle of the new color
    setActiveImgIndex(0);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
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

  const handleDescToggle = () => {
    if (descStep === 1) setDescStep(2);
    else if (descStep === 2) setDescStep(3);
    else setDescStep(1);
  };

  const basePriceHtml = product.price_html ? product.price_html.split(/&ndash;|-/)[0].trim() : "";
  const displayPriceHtml = selectedVariation?.price_html || basePriceHtml;

  return (
    <>
      {copiedToast && (
        <div className="fixed top-24 right-4 z-[100] bg-ethoDark text-white text-sm font-bold px-4 py-3 rounded shadow-xl flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
          Link copied!
        </div>
      )}

      {/* THE 4-COLUMN DESKTOP GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        
        {/* ========================================== */}
        {/* COL 1: GALLERY TRACK (STICKY, ~10%)        */}
        {/* ========================================== */}
        {images.length > 1 ? (
          <div className="hidden lg:flex flex-col gap-3 lg:col-span-1 relative lg:sticky lg:top-[120px] self-start max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pb-4">
            {images.map((img, index) => (
              <button 
                key={index} 
                onClick={() => {
                  setActiveImgIndex(index);
                  carouselRef.current?.scrollTo({ left: index * carouselRef.current.offsetWidth, behavior: 'smooth' });
                }}
                className={`relative w-full aspect-square rounded-lg border-2 overflow-hidden transition-all ${activeImgIndex === index ? 'border-haitiBlue ring-2 ring-blue-100' : 'border-transparent hover:border-gray-200'}`}
              >
                <Image src={img.src} alt={`${cleanName} view ${index + 1}`} fill sizes="100px" className="object-cover" />
              </button>
            ))}
          </div>
        ) : (
          <div className="hidden lg:block lg:col-span-1"></div>
        )}

        {/* ========================================== */}
        {/* COL 2: HERO STAGE                          */}
        {/* ========================================== */}
        <div className="lg:col-span-5 relative lg:sticky lg:top-[120px] lg:self-start w-full">
          
          <button onClick={handleShare} className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-full text-ethoDark shadow-lg hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
          </button>

          {/* DESKTOP CAROUSEL */}
          <div 
            ref={carouselRef}
            onScroll={handleScroll}
            className="hidden lg:flex overflow-x-auto snap-x snap-mandatory rounded-2xl bg-gray-50 border border-gray-200 aspect-square [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
          >
            {images.map((img, index) => (
              <div 
                key={index} 
                className="min-w-full h-full snap-center relative flex items-center justify-center p-2 overflow-hidden group cursor-zoom-in"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <Image 
                  src={img.src} 
                  alt={`${cleanName} main ${index + 1}`} 
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className={`object-contain pointer-events-none mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-[1.75] ${isZoomed ? 'scale-[1.75]' : 'scale-100'}`}
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          {/* MOBILE MAIN IMAGE */}
          <div 
            className="flex lg:hidden rounded-2xl bg-gray-50 border border-gray-200 aspect-square relative items-center justify-center p-2 overflow-hidden cursor-zoom-in"
            onClick={() => setIsZoomed(!isZoomed)}
          >
             <Image 
               src={images[activeImgIndex]?.src || images[0]?.src}
               alt={`${cleanName} main`} 
               fill
               sizes="100vw"
               className={`object-contain mix-blend-multiply pointer-events-none transition-transform duration-300 ease-out ${isZoomed ? 'scale-[1.75]' : 'scale-100'}`}
               priority
             />
          </div>

          {/* MOBILE THUMBNAILS */}
          {images.length > 1 && (
            <div className="flex lg:hidden gap-3 mt-4 overflow-x-auto no-scrollbar pb-2">
              {images.map((img, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveImgIndex(index)}
                  className={`relative w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${activeImgIndex === index ? 'border-haitiBlue ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Image src={img.src} alt={`${cleanName} thumb ${index + 1}`} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* COL 3: INFORMATION SCROLL (~30%)           */}
        {/* ========================================== */}
        <div className="lg:col-span-4 flex flex-col pb-10 min-h-screen">
          
          {isEditMode && (
             <div className="bg-ethoDark text-white text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-2 mb-4 w-max shadow-sm">
               Editing Cart Item
             </div>
          )}

          <h1 className="text-3xl lg:text-4xl font-extrabold text-ethoDark mb-2 leading-tight">
            {cleanName}
          </h1>
          
          <div 
            className="text-4xl font-extrabold text-haitiBlue mb-6"
            dangerouslySetInnerHTML={{ __html: displayPriceHtml }}
          ></div>

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
              <h3 className="text-sm font-extrabold text-ethoDark mb-3">
                Size: <span className="text-gray-600 font-medium ml-1">{selectedSize || "Select"}</span>
              </h3>
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
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
              Made to order. Estimated delivery: 5-10 business days.
            </div>
            <div className="flex items-center gap-3 text-sm font-medium">
               <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
               <Link href="/returns" className="text-haitiBlue hover:underline">See our POD return policy.</Link>
            </div>
          </div>

          <div className="mt-8">
            
            {/* MAIN DESCRIPTION ACCORDION */}
            {mainDescriptionHtml && (
              <div className="border-t border-gray-200">
                <button 
                  onClick={() => setAccordionOpen(!accordionOpen)} 
                  className="w-full py-5 flex justify-between items-center text-left focus:outline-none group"
                >
                  <span className="text-lg font-extrabold text-ethoDark group-hover:text-haitiBlue transition-colors">Product Details</span>
                  <svg className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${accordionOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${accordionOpen ? 'max-h-[1000px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                   <div className={`prose prose-sm text-gray-600 leading-relaxed relative max-w-none ${descStep === 1 ? 'line-clamp-3 lg:line-clamp-none overflow-hidden' : descStep === 2 ? 'line-clamp-6 lg:line-clamp-none overflow-hidden' : ''}`}>
                      <div dangerouslySetInnerHTML={{ __html: mainDescriptionHtml }}></div>
                      
                      {descStep < 3 && (
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-ethoBg to-transparent lg:hidden pointer-events-none"></div>
                      )}
                   </div>
                   
                   <button 
                     onClick={handleDescToggle}
                     className="mt-3 text-haitiBlue font-bold text-sm lg:hidden hover:underline"
                   >
                     {descStep === 1 ? "+ Show more" : descStep === 2 ? "+ Show more" : "- Show less"}
                   </button>
                </div>
              </div>
            )}

            {/* PRODUCT FEATURES ACCORDION */}
            {featuresHtml && (
              <div className="border-t border-gray-200">
                <button 
                  onClick={() => setFeaturesOpen(!featuresOpen)} 
                  className="w-full py-5 flex justify-between items-center text-left focus:outline-none group"
                >
                  <span className="text-lg font-extrabold text-ethoDark group-hover:text-haitiBlue transition-colors flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>
                    Features
                  </span>
                  <svg className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${featuresOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${featuresOpen ? 'max-h-[1000px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                   <div className="prose prose-sm text-gray-600 max-w-none">
                     <div dangerouslySetInnerHTML={{ __html: featuresHtml }}></div>
                   </div>
                </div>
              </div>
            )}

            {/* CARE INSTRUCTIONS ACCORDION */}
            {careHtml && (
              <div className="border-t border-gray-200">
                <button 
                  onClick={() => setCareOpen(!careOpen)} 
                  className="w-full py-5 flex justify-between items-center text-left focus:outline-none group"
                >
                  <span className="text-lg font-extrabold text-ethoDark group-hover:text-haitiBlue transition-colors flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2.25m0 0v2.25m0-2.25h2.25m-2.25 0H9.75m2.25 0H12m0 0v-2.25m0 2.25v2.25m0-2.25H9.75m2.25 0h2.25M12 18v.75m0-1.5v.75m0-1.5v.75m0-1.5v.75m0-1.5v.75m0-1.5v.75m0-1.5v.75" /></svg>
                    Care Instructions
                  </span>
                  <svg className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${careOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${careOpen ? 'max-h-[1000px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                   <div className="prose prose-sm text-gray-600 max-w-none">
                     <div dangerouslySetInnerHTML={{ __html: careHtml }}></div>
                   </div>
                </div>
              </div>
            )}

            {/* SIZE GUIDE ACCORDION */}
            {sizeTableHtml && (
              <div className="border-t border-gray-200">
                <button 
                  onClick={() => setSizeTableOpen(!sizeTableOpen)} 
                  className="w-full py-5 flex justify-between items-center text-left focus:outline-none group"
                >
                  <span className="text-lg font-extrabold text-ethoDark group-hover:text-haitiBlue transition-colors flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                    Size Guide
                  </span>
                  <svg className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${sizeTableOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${sizeTableOpen ? 'max-h-[1500px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                   <div 
                     className="prose prose-sm text-gray-600 max-w-none overflow-x-auto [&_table]:min-w-full [&_table]:border-collapse [&_th]:bg-gray-100 [&_th]:border [&_th]:border-gray-200 [&_th]:p-3 [&_th]:font-bold [&_th]:text-left [&_th]:whitespace-nowrap [&_td]:border [&_td]:border-gray-200 [&_td]:p-3 [&_td]:whitespace-nowrap [&_td]:text-center"
                     dangerouslySetInnerHTML={{ __html: sizeTableHtml }}
                   ></div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ========================================== */}
        {/* COL 4: THE BUY BOX                         */}
        {/* ========================================== */}
        <div className="lg:col-span-2 relative lg:sticky lg:top-[120px] lg:self-start flex flex-col gap-3">
          
          {cartError && (
            <div className="text-haitiRed text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2 animate-pulse">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {cartError}
            </div>
          )}

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
            className="w-full py-4 bg-[#25D366] hover:bg-[#128C7E] active:scale-[0.98] rounded-xl font-extrabold text-lg lg:text-sm xl:text-base text-white transition-all shadow-md flex justify-center items-center gap-1.5 px-2 overflow-hidden"
          >
            {isWhatsAppLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <svg className="w-6 h-6 lg:w-4 lg:h-4 xl:w-5 xl:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                <span className="whitespace-nowrap truncate">Buy via WhatsApp</span>
              </>
            )}
          </button>
        </div>

      </div>
    </>
  );
}