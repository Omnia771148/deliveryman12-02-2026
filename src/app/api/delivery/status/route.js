import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../../lib/db";
import DeliveryBoyUser from "../../../../../models/DeliveryBoyUser";

// 🔹 Get current status
export async function GET(req) {
  await connectionToDatabase();

  const { searchParams } = new URL(req.url);
  const deliveryBoyId = searchParams.get("deliveryBoyId");

  const user = await DeliveryBoyUser.findById(deliveryBoyId).lean();

  return NextResponse.json({
    isActive: user?.isActive ?? false,
  });
}

// 🔹 Update status
export async function POST(req) {
  await connectionToDatabase();

  const { deliveryBoyId, isActive } = await req.json();

  await DeliveryBoyUser.findByIdAndUpdate(deliveryBoyId, { isActive });

  return NextResponse.json({ success: true });
}
