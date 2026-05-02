import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Img,
  Hr,
  Button,
  Tailwind,
  Preview,
  Link
} from '@react-email/components';
import * as React from 'react';

export default function OrderReceipt({
  orderId = "12345",
  paymentMethod = "Online Payment",
  customerName = "Valued Customer",
  items = [],
  subtotal = "0.00",
  shipping = "0.00",
  taxes = "0.00",
  discount = "0.00",
  total = "0.00",
  shippingAddress = null,
  date = new Date().toLocaleDateString(),
}) {
  const previewText = `${orderId} has been received. Here are your details...`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#FAFAFA] font-sans m-0 py-10">
          <Container className="bg-white border border-gray-200 rounded-lg shadow-sm mx-auto max-w-[600px] overflow-hidden">
            
            {/* A. THE HEADER (Brand Authority) */}
            <Section className="text-center py-6">
              {/* THE FIX: Absolute URL pointing to your live domain so email clients can see it */}
              <Img 
                src="https://www.ethohaiti.com/logoethohaiticom1.png" 
                width="150" 
                alt="EthoHaiti" 
                className="mx-auto mb-2" 
              />
              <Link href="https://www.ethohaiti.com" className="text-sm font-medium text-black underline">
                www.ethohaiti.com
              </Link>
              <Heading className="mt-4 text-xl font-bold tracking-widest text-[#111111] m-0">
                ORDER RECEIPT
              </Heading>
            </Section>
            <Hr className="border-gray-200 m-0" />

            {/* B. THE HERO MESSAGE */}
            <Section className="px-8 py-6">
              <Heading className="text-2xl font-extrabold text-[#111111] m-0 mb-4 tracking-tight">
                Order Confirmed.
              </Heading>
              <Text className="text-base text-gray-700 leading-relaxed m-0 mb-4">
                Hi {customerName},
              </Text>
              <Text className="text-base text-gray-700 leading-relaxed m-0 mb-6">
                We've received your order and are getting it ready for production. We will email you the tracking link as soon as it ships.
              </Text>
              
              <Section className="bg-gray-50 rounded p-4 text-center border border-gray-100">
                <Text className="m-0 text-sm font-bold text-gray-800">
                  {orderId} &nbsp;&bull;&nbsp; Placed on {date}
                </Text>
              </Section>
            </Section>

            {/* C. THE POD EXPECTATION SETTER */}
            <Section className="px-8 pb-6">
              <Section className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <Text className="m-0 text-sm text-blue-900 leading-relaxed">
                  <strong>⏱️ Note:</strong> EthoHaiti gear is custom-made to order. Please allow <strong>5-10 business days</strong> for production before your items ship. If you ordered multiple items, they may arrive in separate packages so we can get them to you faster.
                </Text>
              </Section>
            </Section>
            <Hr className="border-gray-200 m-0" />

            {/* D. THE ORDER SUMMARY */}
            <Section className="px-8 py-6">
              <Heading className="text-lg font-bold text-[#111111] m-0 mb-4">Line Items</Heading>
              
              {items.map((item, index) => (
                <Section key={index} className="mb-4">
                  <Row>
                    <Column className="w-[80px] align-top">
                      <Img 
                        src={item.image || "https://placehold.co/150x150.png?text=No+Image"} 
                        width="64" 
                        height="64" 
                        className="rounded border border-gray-200 object-cover" 
                      />
                    </Column>
                    <Column className="align-top pl-4">
                      <Text className="m-0 text-sm font-bold text-[#111111] mb-1">
                        {item.name}
                      </Text>
                      <Text className="m-0 text-xs text-gray-500 mb-2">
                        {item.selectedSize && `Size: ${item.selectedSize}`} 
                        {item.selectedSize && item.selectedColor && ` | `}
                        {item.selectedColor && `Color: ${item.selectedColor}`}
                      </Text>
                      <Text className="m-0 text-sm font-bold text-gray-800">
                        Qty: {item.quantity} &nbsp;&bull;&nbsp; ${Number(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </Column>
                  </Row>
                  {index !== items.length - 1 && <Hr className="border-gray-100 my-4" />}
                </Section>
              ))}
            </Section>
            <Hr className="border-gray-200 m-0" />

            {/* E. THE FINANCIAL BREAKDOWN */}
            <Section className="px-8 py-6">
              <Row>
                <Column className="w-1/2"></Column>
                <Column className="w-1/2 text-right">
                  <Text className="m-0 text-sm text-gray-600 mb-2">Subtotal: ${subtotal}</Text>
                  {Number(discount) > 0 && (
                    <Text className="m-0 text-sm text-green-600 font-bold mb-2">Discount: -${discount}</Text>
                  )}
                  <Text className="m-0 text-sm text-gray-600 mb-2">Shipping (Printify Standard): {shipping === "0.00" ? "FREE" : `$${shipping}`}</Text>
                  <Text className="m-0 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">Taxes: ${taxes}</Text>
                  <Text className="m-0 text-2xl font-extrabold text-[#111111]">Grand Total: ${total}</Text>
                </Column>
              </Row>
            </Section>
            <Hr className="border-gray-200 m-0" />

            {/* F. CUSTOMER DETAILS */}
            <Section className="px-8 py-6">
              <Row>
                <Column className="align-top w-1/2 pr-2">
                  <Text className="m-0 text-sm font-bold text-[#111111] mb-2">Ship To:</Text>
                  {shippingAddress ? (
                    <Text className="m-0 text-sm text-gray-600 leading-relaxed">
                      {shippingAddress.fullName || `${shippingAddress.first_name || ''} ${shippingAddress.last_name || ''}`.trim()}<br />
                      {shippingAddress.address_1}<br />
                      {shippingAddress.address_2 && <>{shippingAddress.address_2}<br /></>}
                      {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postcode}<br />
                    </Text>
                  ) : (
                    <Text className="m-0 text-sm text-gray-600">Address provided at checkout.</Text>
                  )}
                </Column>
                <Column className="align-top w-1/2 pl-2">
                  <Text className="m-0 text-sm font-bold text-[#111111] mb-2">Payment Method:</Text>
                  <Text className="m-0 text-sm text-gray-600">{paymentMethod}</Text>
                </Column>
              </Row>
            </Section>

            {/* G. THE VIP SUPPORT FOOTER */}
            <Section className="bg-[#111111] px-8 py-8 text-center">
              {/* THE FIX: Updated quote text to match exactly what you wanted */}
              <Text className="m-0 text-base font-bold italic text-white mb-6">
                "Thank you for representing the culture. Wear it with pride."
              </Text>
              <Button 
                href={`https://ethohaiti.com/orders/${orderId.replace('Order #', '')}`}
                className="bg-white text-black font-bold text-base px-8 py-3 rounded mb-6 text-center block w-full"
              >
                View Order Status
              </Button>
              <Text className="m-0 text-sm text-gray-400 mb-2">
                Need to change your shipping address? You have a 6-hour window before production begins.
              </Text>
              <Text className="m-0 text-sm text-gray-400 mt-4">
                Support: <Link href="mailto:sakpase@ethohaiti.com" className="text-white font-medium underline">sakpase@ethohaiti.com</Link>
              </Text>
              <Text className="m-0 text-sm text-gray-400 mt-1">
                WhatsApp: <span className="text-white font-medium">849-506-7098</span>
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}