import React from 'react';

export default function ReceiptTemplate({ orderData }) {
  // Fallback check to ensure the component doesn't crash if data isn't loaded yet
  if (!orderData) return null;

  return (
    <div id="printable-receipt" className="hidden print:block w-full max-w-4xl mx-auto bg-white text-black p-8">
      
      {/* 1. The Header (Brand Authority) */}
      <div className="flex flex-col items-center justify-center pb-6 mb-8 border-b border-gray-300">
        {/* Replace with your actual high-contrast logo path */}
        <img 
          src="/logo-black.png" 
          alt="EthoHaiti Logo" 
          className="h-16 w-auto object-contain mb-2" 
        />
        <a href="https://www.ethohaiti.com" className="text-sm font-medium text-black underline">
          www.ethohaiti.com
        </a>
        <h1 className="mt-6 text-xl font-bold tracking-widest text-black">
          ORDER RECEIPT
        </h1>
      </div>

      {/* 2. The Critical Meta-Data (Top Section) */}
      <div className="flex justify-between mb-10">
        <div className="flex flex-col">
          <span className="font-extrabold text-2xl text-black">
            {orderData.orderNumber}
          </span>
          <span className="text-sm mt-2">Date: {orderData.date}</span>
          <span className="text-sm mt-1">Payment Method: {orderData.paymentMethod}</span>
        </div>
        
        <div className="flex flex-col text-right text-sm">
          <span className="font-bold text-black mb-1">Ship To:</span>
          <span>{orderData.shippingAddress.name}</span>
          <span>{orderData.shippingAddress.street}</span>
          <span>{orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zip}</span>
        </div>
      </div>

      {/* 3. The Line Items (The Product Table) */}
      <table className="w-full text-left mb-10 border-collapse">
        <thead>
          <tr className="border-b-2 border-black text-sm uppercase tracking-wider">
            <th className="py-2 w-20">Item</th>
            <th className="py-2 pl-4">Details</th>
            <th className="py-2 text-center w-16">Qty</th>
            <th className="py-2 text-right w-24">Price</th>
            <th className="py-2 text-right w-24">Total</th>
          </tr>
        </thead>
        <tbody>
          {orderData.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200 text-sm">
              <td className="py-4">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-[60px] h-[60px] object-cover bg-gray-100 border border-gray-200" 
                />
              </td>
              <td className="py-4 pl-4">
                <div className="font-bold text-black">{item.title}</div>
                <div className="text-gray-600 mt-1">Size: {item.size} | Color: {item.color}</div>
              </td>
              <td className="py-4 text-center">{item.qty}</td>
              <td className="py-4 text-right">${item.price.toFixed(2)}</td>
              <td className="py-4 text-right font-medium">${(item.qty * item.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 4. The Financial Breakdown (Bottom Right) */}
      <div className="flex justify-end mb-12">
        <div className="w-1/2 md:w-1/3 text-sm">
          <div className="flex justify-between py-1">
            <span>Subtotal:</span>
            <span>${orderData.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Shipping (Printify Standard):</span>
            <span>${orderData.shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-300 pb-2 mb-2">
            <span>Taxes:</span>
            <span>${orderData.taxes.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-black">
            <span className="font-extrabold text-2xl">Grand Total:</span>
            <span className="font-extrabold text-2xl">${orderData.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 5. The Print Footer (Bottom Center) */}
      <div className="text-center text-sm mt-12 border-t border-gray-300 pt-6">
        <p className="font-bold italic text-black mb-3">
          "Thank you for repping the culture. Wear it with pride."
        </p>
        <p>Support: <span className="font-medium">sakpase@ethohaiti.com</span></p>
        <p>WhatsApp: <span className="font-medium">849-506-7098</span></p>
      </div>

    </div>
  );
}