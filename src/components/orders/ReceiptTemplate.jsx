import React from 'react';

export default function ReceiptTemplate({ orderData }) {
  // Fallback check to ensure the component doesn't crash if data isn't loaded yet
  if (!orderData) return null;

  return (
    <div id="printable-receipt" className="hidden print:block w-full max-w-full mx-auto bg-white text-black print:p-2 print:text-sm">
      
      {/* 1. The Header (Brand Authority) */}
      <div className="flex flex-col items-center justify-center pb-4 mb-6 border-b border-gray-300">
        <img 
          src="/logoethohaiticom1.png" 
          alt="EthoHaiti Logo" 
          className="h-14 w-auto object-contain mb-2" 
        />
        <a href="https://www.ethohaiti.com" className="text-xs font-medium text-black underline">
          www.ethohaiti.com
        </a>
        <h1 className="mt-4 text-xl font-bold tracking-widest text-black">
          ORDER RECEIPT
        </h1>
      </div>

      {/* 2. The Critical Meta-Data (Top Section) */}
      <div className="flex justify-between mb-6">
        <div className="flex flex-col">
          <span className="font-extrabold text-xl text-black">
            {orderData.orderNumber}
          </span>
          <span className="text-xs mt-1">Date: {orderData.date}</span>
          <span className="text-xs mt-1">Payment Method: {orderData.paymentMethod}</span>
        </div>
        
        <div className="flex flex-col text-right text-xs">
          <span className="font-bold text-black mb-1">Ship To:</span>
          <span>{orderData.shippingAddress.name}</span>
          <span>{orderData.shippingAddress.street}</span>
          <span>{orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zip}</span>
        </div>
      </div>

      {/* 3. The Line Items (The Product Table) */}
      <table className="w-full text-left mb-6 border-collapse">
        <thead>
          <tr className="border-b-2 border-black text-xs uppercase tracking-wider">
            <th className="py-2 w-16">Item</th>
            <th className="py-2 pl-4">Details</th>
            <th className="py-2 text-center w-12">Qty</th>
            <th className="py-2 text-right w-20">Price</th>
            <th className="py-2 text-right w-20">Total</th>
          </tr>
        </thead>
        <tbody>
          {orderData.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200 text-xs break-inside-avoid">
              <td className="py-2">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-[40px] h-[40px] object-cover bg-gray-100 border border-gray-200" 
                />
              </td>
              <td className="py-2 pl-4">
                <div className="font-bold text-black">{item.title}</div>
                <div className="text-gray-600 mt-1">Size: {item.size} | Color: {item.color}</div>
              </td>
              <td className="py-2 text-center">{item.qty}</td>
              <td className="py-2 text-right">${item.price.toFixed(2)}</td>
              <td className="py-2 text-right font-medium">${(item.qty * item.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 4. The Financial Breakdown (Bottom Right) */}
      <div className="flex justify-end mb-6 break-inside-avoid">
        <div className="w-1/2 md:w-2/5 text-xs">
          <div className="flex justify-between py-1">
            <span>Subtotal:</span>
            <span>${orderData.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Shipping:</span>
            <span className="font-bold text-black">FREE</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-300 pb-2 mb-2">
            <span>Taxes:</span>
            <span className="font-bold text-black">We pay it for you</span>
          </div>
          <div className="flex justify-between py-2 text-black">
            <span className="font-extrabold text-xl">Total:</span>
            <span className="font-extrabold text-xl">${orderData.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 5. The Print Footer (Bottom Center) */}
      <div className="text-center text-xs mt-6 border-t border-gray-300 pt-4 break-inside-avoid">
        <p className="font-bold italic text-black mb-2">
          "Thank you for representing the culture. Wear it with pride."
        </p>
        <p>Support: <span className="font-medium">sakpase@ethohaiti.com</span></p>
        <p>WhatsApp: <span className="font-medium">849-506-7098</span></p>
      </div>

    </div>
  );
}