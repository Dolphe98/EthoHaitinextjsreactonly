"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AlternatingCategoryGrid() {
  const [zippedCategories, setZippedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch ALL categories
    fetch("https://backend.ethohaiti.com/wp-json/wc/store/v1/products/categories?per_page=100")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      })
      .then(async (data) => {
        // --- THE FIX: Text Scrubber for the Grid ---
        const cleanName = (name) => {
          if (!name) return "";
          return name.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&");
        };

        // Find parents and active subcategories
        const parents = data.filter(cat => cat.parent === 0);
        const subcategories = data.filter(cat => cat.parent !== 0 && cat.count > 0);

        // Group subcategories by their parent to zip them
        const groups = {};
        parents.forEach(p => { groups[p.id] = []; });
        
        subcategories.forEach(sub => {
           if(groups[sub.parent]) {
             groups[sub.parent].push({
               ...sub,
               name: cleanName(sub.name), // Scrubs the Subcategory name for the title
               // Scrubs the Parent's name for the Badge Tag
               genderTag: cleanName(parents.find(p => p.id === sub.parent)?.name) || "Collection"
             });
           }
        });

        // "Deal the cards" to create the alternating effect
        const zipped = [];
        let moreItems = true;
        let index = 0;
        
        while (moreItems) {
          moreItems = false;
          // Loop through every parent group and take 1 item, creating a perfect mix
          for (const parentId in groups) {
            if (groups[parentId][index]) {
              zipped.push(groups[parentId][index]);
              moreItems = true;
            }
          }
          index++;
        }

        // Fetch exactly 1 product for each subcategory to get the mockup/flat images
        const categoriesWithImages = await Promise.all(
          zipped.map(async (category) => {
            try {
              const res = await fetch(`https://backend.ethohaiti.com/wp-json/wc/store/v1/products?category=${category.id}&per_page=1`);
              const products = await res.json();
              const product = products[0]; 

              return {
                ...category,
                img1: product?.images[0]?.src || "https://placehold.co/500x500?text=No+Mockup",
                img2: product?.images[1]?.src || product?.images[0]?.src || "https://placehold.co/500x500?text=No+Flat"
              };
            } catch (err) {
              return { ...category, img1: "https://placehold.co/500x500?text=Error", img2: "https://placehold.co/500x500?text=Error" };
            }
          })
        );

        setZippedCategories(categoriesWithImages);
        setIsLoading(false); 
      })
      .catch(err => {
        console.error("Error fetching dynamic category zipper:", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-haitiBlue"></div>
        <span className="ml-3 text-lg font-bold text-gray-600">Curating Collections...</span>
      </div>
    );
  }

  if (zippedCategories.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto mb-12">
      
      <style>{`
        @keyframes autoCrossfade {
          0% { opacity: 1; } 40% { opacity: 1; }
          50% { opacity: 0; } 90% { opacity: 0; } 100% { opacity: 1; }
        }
        .animate-crossfade { animation: autoCrossfade 6s infinite; }
      `}</style>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-ethoDark border-l-4 border-haitiRed pl-3">
          Shop by Category
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {zippedCategories.map((category, index) => (
          <Link key={`${category.id}-${index}`} href={`/category/${category.slug}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group relative">
            <div className="relative h-72 bg-gray-100 flex items-center justify-center overflow-hidden p-4">
              <img src={category.img2} alt={`${category.name} Flat`} className="absolute max-h-[90%] max-w-[90%] object-contain" />
              <img src={category.img1} alt={`${category.name} Mockup`} className="absolute max-h-[90%] max-w-[90%] object-contain animate-crossfade bg-gray-100" style={{ animationDelay: `${index * 0.75}s` }} />
              <span className="absolute top-3 left-3 z-10 bg-ethoDark text-white text-xs font-bold px-3 py-1 rounded shadow-sm">
                {category.genderTag}
              </span>
            </div>
            <div className="p-4 flex flex-col flex-grow text-center bg-white z-10">
              <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-haitiBlue transition-colors">{category.name}</h3>
              <p className="text-sm text-haitiBlue font-bold mt-2">Shop Now &rarr;</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}