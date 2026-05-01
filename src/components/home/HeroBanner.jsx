"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Smooth scroll function for the downward arrow buttons
  const scrollToShop = () => {
    window.scrollTo({
      top: window.innerHeight - 80, // Scrolls down past the banner
      behavior: 'smooth'
    });
  };

  const slides = [
    {
      id: 0,
      tag: "Welcome To EthoHaiti",
      title: "Wear the Culture With Pride.",
      desc: "We’re more than just a brand. We represent the strong, unbreakable spirit of Haiti.",
      cta: "Explore the Brand",
      action: "scroll",
      bgClass: "bg-gradient-to-r from-blue-900 via-blue-800 to-ethoDark" // Deepened for a premium feel
    },
    {
      id: 1,
      tag: "Join us",
      title: "Byenveni Nan Fanmi An.",
      desc: "Sign up for free today. Save your favorite gear, track your orders, and become part of the EthoHaiti family.",
      cta: "Join the Family",
      link: "/account",
      action: "link",
      bgClass: "bg-gradient-to-r from-red-900 via-red-800 to-ethoDark" // Rich crimson red
    },
    {
      id: 2,
      tag: "Premium Collection",
      title: "Speak Without Saying a Word.",
      desc: "Find bold designs, top quality, and ancestral proverbs. Explore streetwear that shares our story with the world.",
      cta: "Shop Now",
      action: "scroll",
      bgClass: "bg-gradient-to-r from-slate-900 via-ethoDark to-black" // High-end streetwear dark mode
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
  const prevSlide = () => setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);

  return (
    <section className="relative overflow-hidden group mb-6 w-screen left-1/2 -translate-x-1/2 shadow-xl">
      <div className="flex transition-transform duration-700 ease-in-out h-[400px] md:h-[450px]" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {slides.map((slide) => (
          <div key={slide.id} className={`w-full h-full flex-shrink-0 relative ${slide.bgClass} flex items-center`}>
            
            {/* Tailwind v4 Opacity Fix */}
            <div className="absolute inset-0 bg-black/30"></div>
            
            <div className="relative z-10 px-8 md:px-16 lg:px-24 flex flex-col items-start max-w-4xl w-full">
              <span className="bg-white text-ethoDark text-xs font-black px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase shadow-md">
                {slide.tag}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight mb-4 drop-shadow-lg tracking-tight">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl drop-shadow-md font-medium leading-relaxed">
                {slide.desc}
              </p>
              
              {/* Conditional CTA Button Rendering */}
              {slide.action === "link" ? (
                <Link 
                  href={slide.link} 
                  className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold text-lg px-8 py-4 rounded transition-colors shadow-lg border border-yellow-500 hover:scale-[1.02]"
                >
                  {slide.cta}
                </Link>
              ) : (
                <button 
                  onClick={scrollToShop} 
                  className="group/btn flex items-center gap-3 bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold text-lg px-8 py-4 rounded transition-all shadow-lg border border-yellow-500 hover:scale-[1.02]"
                >
                  {slide.cta}
                  {/* Subtle animated downward arrow */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 group-hover/btn:translate-y-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Slider Navigation Arrows */}
      <button onClick={prevSlide} className="hidden md:flex absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
      </button>
      <button onClick={nextSlide} className="hidden md:flex absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
      </button>
      
      {/* Slider Dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
        {slides.map((_, index) => (
          <button 
            key={index} 
            onClick={() => setCurrentSlide(index)} 
            className={`w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${currentSlide === index ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/80'}`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </section>
  );
}