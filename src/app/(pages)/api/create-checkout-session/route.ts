import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Example logic — replace with your Stripe checkout code
  return NextResponse.json({ message: "Checkout session created" });
}
