import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/db";
import AcceptedOrder from "../../../../models/AcceptedOrder";
import AcceptedByRestorent from "../../../../models/AcceptedByRestorent";

export async function POST(req) {
    try {
        await connectionToDatabase();

        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json(
                { message: "Order ID is required" },
                { status: 400 }
            );
        }

        // 1. Find the order in AcceptedOrder
        const orderToDelete = await AcceptedOrder.findById(orderId);

        if (!orderToDelete) {
            return NextResponse.json(
                { message: "Order not found in acceptedorders" },
                { status: 404 }
            );
        }

        // 2. Insert into AcceptedByRestorent (Archive it)
        try {
            await AcceptedByRestorent.create(orderToDelete.toObject());
        } catch (archiveError) {
            console.error("Error archiving order:", archiveError);
            // We continue to delete? Or stop?
            // User said "it should also send to new collection".
            // If archiving fails, safe to abort to prevent data loss.
            return NextResponse.json(
                { message: "Failed to archive order", error: archiveError.message },
                { status: 500 }
            );
        }

        // 3. Delete from AcceptedOrder
        await AcceptedOrder.findByIdAndDelete(orderId);

        return NextResponse.json({
            message: "Order moved to AcceptedByRestorent and removed from acceptedorders",
            success: true,
        });

    } catch (error) {
        console.error("Delete accepted order error:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
