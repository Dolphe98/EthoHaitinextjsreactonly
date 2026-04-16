import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-ethoBg flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-black text-haitiRed mb-4">404</h1>
      <h2 className="text-4xl font-bold text-ethoDark mb-4">Page Not Found</h2>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/" 
          className="bg-haitiBlue text-white px-8 py-3 rounded font-bold hover:bg-opacity-90 transition-colors"
        >
          Return Home
        </Link>
        <Link 
          href="/category/clothing" 
          className="border-2 border-ethoDark text-ethoDark px-8 py-3 rounded font-bold hover:bg-ethoDark hover:text-white transition-colors"
        >
          Shop All
        </Link>
      </div>
    </div>
  );
}