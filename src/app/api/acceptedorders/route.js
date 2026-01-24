import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/db";
import AcceptedOrder from "../../../../models/AcceptedOrder";

export async function GET() {
  try {
    await connectionToDatabase();

    // Filter out orders that are already accepted by a delivery boy
    const orders = await AcceptedOrder.find({
      $or: [{ deliveryBoyId: null }, { deliveryBoyId: "" }]
    }).lean();

    return NextResponse.json(orders);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 500 });
  }
}
