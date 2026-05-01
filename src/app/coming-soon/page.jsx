import Link from 'next/link';

export const metadata = {
  title: "Coming Soon | EthoHaiti",
  description: "We are working on something special.",
};

export default function ComingSoonPage() {
  return (
    <main className="pt-32 pb-20 min-h-[80vh] bg-ethoBg flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-2xl mx-auto">
        <span className="bg-ethoDark text-white text-xs font-black px-4 py-1.5 rounded-full tracking-widest uppercase shadow-md mb-6 inline-block">
          Under Construction
        </span>
        
        <h1 className="text-5xl md:text-6xl font-black text-ethoDark mb-6 tracking-tight" style={{ fontFamily: 'Oswald, sans-serif' }}>
          WE'RE CRAFTING OUR STORY
        </h1>
        
        <p className="text-lg text-gray-600 font-medium mb-10 leading-relaxed">
          This section of EthoHaiti is currently being built. We are putting together the pieces to share our mission, our culture, and the heartbeat behind the brand. Check back soon.
        </p>
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 bg-haitiRed hover:bg-red-700 text-white font-extrabold text-lg px-8 py-4 rounded transition-all shadow-md hover:scale-[1.02]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to the Store
        </Link>
      </div>
    </main>
  );
}