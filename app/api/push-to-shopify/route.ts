import { NextResponse } from "next/server";
import { TokenManager } from "@/lib/token-manager";

export async function POST(request: Request) {
  try {
    const { product, shop } = await request.json();
    if (!product || !shop) {
      return NextResponse.json({ error: "Missing shop or product data" }, { status: 400 });
    }
    // Validate required fields
    if (!product.title || !product.variants || !Array.isArray(product.variants) || !product.variants[0]?.price) {
      return NextResponse.json({ error: "Product must have a title and at least one variant with a price" }, { status: 400 });
    }
    const accessToken = await TokenManager.getToken(shop);
    if (!accessToken) {
      return NextResponse.json({ error: "Missing access token. Please connect to Shopify first." }, { status: 401 });
    }
    // Call Shopify API
    const response = await fetch(`https://${shop}/admin/api/2023-10/products.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Shopify API error:", data);
      return NextResponse.json({ error: data.errors || data || "Shopify error" }, { status: response.status });
    }
    return NextResponse.json({ success: true, product: data.product });
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 });
  }
}
