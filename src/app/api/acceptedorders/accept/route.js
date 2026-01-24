import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectionToDatabase from "../../../../../lib/db";
import AcceptedOrder from "../../../../../models/AcceptedOrder";
import AcceptedByDelivery from "../../../../../models/AcceptedByDelivery";
import DeliveryBoyUser from "../../../../../models/DeliveryBoyUser";

const OrderStatus =
  mongoose.models.OrderStatus ||
  mongoose.model(
    "OrderStatus",
    new mongoose.Schema({}, { strict: false }),
    "orderstatuses"
  );

export async function POST(req) {
  try {
    await connectionToDatabase();

    let { orderId, deliveryBoyId, deliveryBoyName, deliveryBoyPhone } = await req.json();

    if (!orderId || !deliveryBoyId) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

    // Fetch delivery boy details if not provided
    if (!deliveryBoyName || !deliveryBoyPhone) {
      try {
        const deliveryBoy = await DeliveryBoyUser.findById(deliveryBoyId);
        if (deliveryBoy) {
          deliveryBoyName = deliveryBoyName || deliveryBoy.name;
          deliveryBoyPhone = deliveryBoyPhone || deliveryBoy.phone;
        }
      } catch (error) {
        console.error("Error fetching delivery boy details:", error);
        // Continue without details if fetch fails, or handle as error?
        // Proceeding allows the order to be accepted at least.
      }
    }

    // 1️⃣ Find order from acceptedorders (YOUR EXISTING LOGIC)
    const order = await AcceptedOrder.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Insert into acceptedbydeliveries (YOUR EXISTING LOGIC - UNCHANGED)
    await AcceptedByDelivery.create({
      originalOrderId: order._id,
      orderId: order.orderId,
      deliveryBoyId,
      deliveryBoyName,
      deliveryBoyPhone,

      userId: order.userId,
      restaurantId: order.restaurantId,

      userName: order.userName,
      userEmail: order.userEmail,
      userPhone: order.userPhone,

      items: order.items,
      totalCount: order.totalCount,
      totalPrice: order.totalPrice,
      gst: order.gst,
      deliveryCharge: order.deliveryCharge,
      grandTotal: order.grandTotal,
      aa: order.aa,

      location: order.location,
      deliveryAddress: order.deliveryAddress,

      paymentStatus: order.paymentStatus,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: order.razorpayPaymentId,

      orderDate: order.orderDate,
      rest: order.rest,
      rejectedBy: order.rejectedBy,

      status: "Accepted by Delivery", // YOUR EXISTING STATUS - UNCHANGED
    });

    // ✅ 3️⃣ ONLY ADD THIS: Update orderstatuses collection (NEW ADDITION)
    await OrderStatus.updateOne(
      { orderId: order.orderId },
      {
        $set: {
          status: "will be delivered soon", // ONLY CHANGE STATUS HERE
          deliveryBoyId,
          deliveryBoyName,
          deliveryBoyPhone
        }
      }
    );

    // 4️⃣ UPDATE AcceptedOrder to mark as accepted (instead of deleting)
    await AcceptedOrder.findByIdAndUpdate(orderId, {
      deliveryBoyId,
      status: "Accepted by Delivery"
    });
    // await AcceptedOrder.findByIdAndDelete(orderId); // Disabled as per request

    return NextResponse.json({
      message: "Order accepted",
      success: true,
    });

  } catch (error) {
    console.error("Accept order error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}