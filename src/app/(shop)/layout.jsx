export default function ShopLayout({ children }) {
  // MANAGER FIX: Forces the top padding of all shop pages to shrink on mobile, 
  // without messing up the desktop spacing or requiring edits to every page file.
  return (
    <div className="max-md:[&>*:first-child]:!pt-6">
      {children}
    </div>
  );
}