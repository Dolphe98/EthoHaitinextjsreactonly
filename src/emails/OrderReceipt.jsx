import {
  Html,
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
  customerName = "Valued Customer",
  items = [],
  subtotal = "0.00",
  shipping = "0.00",
  discount = "0.00",
  total = "0.00",
  shippingAddress = null,
  date = new Date().toLocaleDateString(),
}) {
  const previewText = `Order #ETH-${orderId} has been received. Here are your details...`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#FAFAFA] font-sans m-0 py-10">
          <Container className="bg-white border border-gray-200 rounded-lg shadow-sm mx-auto max-w-[600px] overflow-hidden">
            
            {/* A. THE HEADER */}
            <Section className="text-center py-6">
              {/* Replace this src with your actual hosted logo URL */}
              <Img 
                src="https://placehold.co/300x100.png?text=EthoHaiti+Logo" 
                width="150" 
                alt="EthoHaiti" 
                className="mx-auto" 
              />
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
                Thank you for repping the culture. We've received your order and are getting it ready for production. We will email you the tracking link as soon as it ships.
              </Text>
              
              <Section className="bg-gray-50 rounded p-4 text-center border border-gray-100">
                <Text className="m-0 text-sm font-bold text-gray-800">
                  Order #ETH-{orderId} &nbsp;&bull;&nbsp; Placed on {date}
                </Text>
              </Section>
            </Section>

            {/* C. THE POD EXPECTATION SETTER */}
            <Section className="px-8 pb-6">
              <Section className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <Text className="m-0 text-sm text-blue-900 leading-relaxed">
                  <strong>⏱️ Note:</strong> EthoHaiti gear is custom-made to order. Please allow <strong>2-5 business days</strong> for production before your items ship. If you ordered multiple items, they may arrive in separate packages so we can get them to you faster.
                </Text>
              </Section>
            </Section>
            <Hr className="border-gray-200 m-0" />

            {/* D. THE ORDER SUMMARY */}
            <Section className="px-8 py-6">
              <Heading className="text-lg font-bold text-[#111111] m-0 mb-4">Order Summary</Heading>
              
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
                  <Text className="m-0 text-sm text-gray-600 mb-4">Shipping: {shipping === "0.00" ? "FREE" : `$${shipping}`}</Text>
                  <Text className="m-0 text-xl font-extrabold text-[#111111]">Total: ${total}</Text>
                </Column>
              </Row>
            </Section>
            <Hr className="border-gray-200 m-0" />

            {/* F. CUSTOMER DETAILS */}
            <Section className="px-8 py-6">
              <Row>
                <Column className="align-top w-1/2 pr-2">
                  <Text className="m-0 text-sm font-bold text-[#111111] mb-2">Shipping to:</Text>
                  {shippingAddress ? (
                    <Text className="m-0 text-sm text-gray-600 leading-relaxed">
                      {shippingAddress.fullName || `${shippingAddress.first_name} ${shippingAddress.last_name}`}<br />
                      {shippingAddress.address_1}<br />
                      {shippingAddress.address_2 && <>{shippingAddress.address_2}<br /></>}
                      {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postcode}<br />
                      {shippingAddress.country}
                    </Text>
                  ) : (
                    <Text className="m-0 text-sm text-gray-600">Address provided at checkout.</Text>
                  )}
                </Column>
                <Column className="align-top w-1/2 pl-2">
                  <Text className="m-0 text-sm font-bold text-[#111111] mb-2">Paid via:</Text>
                  <Text className="m-0 text-sm text-gray-600">PayPal Express</Text>
                </Column>
              </Row>
            </Section>

            {/* G. THE VIP SUPPORT FOOTER */}
            <Section className="bg-[#111111] px-8 py-8 text-center">
              <Button 
                href={`https://ethohaiti.com/orders/${orderId}`}
                className="bg-[#D32F2F] text-white font-bold text-base px-8 py-4 rounded mb-6 text-center block w-full"
              >
                View Order Status
              </Button>
              <Text className="m-0 text-sm text-gray-400 mb-2">
                Need to change your shipping address? You have a 12-hour window before production begins.
              </Text>
              <Link href="mailto:sakpase@ethohaiti.com" className="text-[#1E3A8A] font-bold text-sm underline">
                Contact Support (sakpase@ethohaiti.com)
              </Link>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}