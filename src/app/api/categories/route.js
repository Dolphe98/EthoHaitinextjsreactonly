import { fetchAllCategories } from '@/services/products';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await fetchAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json([], { status: 500 });
  }
}