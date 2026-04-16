"use client";

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';

export default function ProductInteractive({ product }) {
  const cleanName = product.name?.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&") || "Product";

  const [activeImg, setActiveImg] = useState(product.images?.[0]?.src || "https://placehold.co/800x800?text=No+Image");
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [isZoomed, setIsZoomed] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // =====================================================
  // THE FIX: Store API uses `terms` (array of objects),
  // NOT `options` (array of strings like the REST API).
  // We check for both just to be bulletproof.
  // =====================================================
  const colorAttr = product.attributes?.find(
    a => a.name.toLowerCase() === 'color' || a.name.toLowerCase() === 'colors'
  );
  const sizeAttr = product.attributes?.find(
    a => a.name.toLowerCase() === 'size' || a.name.toLowerCase() === 'sizes'
  );

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

  // --- MANAGER FIX 1: IMAGE SWAP ON COLOR CLICK ---
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    
    // Find the first variation that matches this color to grab its image
    const colorVariation = product.variations?.find(v => 
      v.attributes.some(attr => attr.name.toLowerCase().includes('color') && (attr.value === color || attr.option === color)) && 
      (v.image?.src || v.image)
    );

    if (colorVariation) {
      setActiveImg(colorVariation.image?.src || colorVariation.image);
    }
  };

  // =====================================================
  // THE FIX: Variation attributes use exact names
  // AND we include the Printify fallback (attr.option).
  // =====================================================
  const selectedVariation = product.variations?.find(variation => {
    const matchesColor = selectedColor
      ? variation.attributes.some(
          attr => attr.name.toLowerCase().includes('color') && (attr.value === selectedColor || attr.option === selectedColor)
        )
      : true;
    const matchesSize = selectedSize
      ? variation.attributes.some(
          attr => attr.name.toLowerCase().includes('size') && (attr.value === selectedSize || attr.option === selectedSize)
        )
      : true;
    return matchesColor && matchesSize;
  });

  const isColorRequired = colorOptions.length > 0 && !selectedColor;
  const isSizeRequired = sizeOptions.length > 0 && !selectedSize;
  const isButtonDisabled = isColorRequired || isSizeRequired;

  const handleAddToCart = () => {
    // --- MANAGER FIX: Smart Price Parsing ---
    // The Store API uses `.prices.price` (in cents), REST API uses `.price` (in dollars)
    let numericPrice = 0;
    if (selectedVariation?.prices?.price) {
      numericPrice = Number(selectedVariation.prices.price) / 100;
    } else if (selectedVariation?.price) {
      numericPrice = Number(selectedVariation.price);
    } else if (product.prices?.price) {
      numericPrice = Number(product.prices.price) / 100;
    } else if (product.price) {
      numericPrice = Number(product.price);
    }

    addToCart({
      id: product.id,
      variationId: selectedVariation?.id || null, // CRUCIAL FOR PRINTIFY
      cartItemId: `${product.id}-${selectedVariation?.id || selectedColor || 'base'}-${selectedSize || 'base'}`,
      name: cleanName,
      price: numericPrice, // Pushes exact variation price!
      price_html: selectedVariation?.price_html || product.price_html, // Pushes exact HTML!
      image: activeImg,
      selectedColor,
      selectedSize,
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // --- MANAGER FIX 2: LOWEST PRICE DISPLAY ---
  // Splits the WooCommerce range string (e.g. "$20.00 - $25.00") and keeps only the lowest price!
  const basePriceHtml = product.price_html ? product.price_html.split(/&ndash;|-/)[0].trim() : "";
  const displayPriceHtml = selectedVariation?.price_html || basePriceHtml;

  return (
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
            style={{ 
              transformOrigin: zoomOrigin, 
              transform: isZoomed ? 'scale(2)' : 'scale(1)' 
            }}
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
                  activeImg === img.src
                    ? 'border-haitiBlue shadow-md ring-2 ring-haitiBlue/20'
                    : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <img src={img.src} alt={`${cleanName} view ${index + 1}`} className="max-h-full object-contain" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: THE DETAILS */}
      <div className="flex flex-col">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ethoDark leading-tight mb-4 tracking-tight">
          {cleanName}
        </h1>
        
        {/* Dynamic Lowest Price or Variation Price Display */}
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
                    selectedColor === color
                      ? 'border-ethoDark bg-ethoDark text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
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
                    selectedSize === size
                      ? 'border-haitiBlue bg-haitiBlue text-white shadow-md'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <hr className="border-gray-200 mb-8" />

        <button
          disabled={isButtonDisabled}
          onClick={handleAddToCart}
          className={`w-full font-extrabold text-lg py-4 rounded shadow-lg transition-all flex justify-center items-center gap-2 ${
            addedToCart
              ? 'bg-green-600 text-white'
              : isButtonDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-haitiRed hover:bg-red-700 text-white hover:shadow-xl'
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
      </div>
    </div>
  );
}