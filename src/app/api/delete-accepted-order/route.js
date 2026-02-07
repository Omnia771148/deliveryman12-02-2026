import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/db";
import AcceptedOrder from "../../../../models/AcceptedOrder";
import AcceptedByRestorent from "../../../../models/AcceptedByRestorent";

export async function POST(req) {
    try {
        await connectionToDatabase();

        const { orderId, deliveryId } = await req.json();

        if (!orderId) {
            return NextResponse.json(
                { message: "Order ID is required" },
                { status: 400 }
            );
        }

        // 1. Find the order in AcceptedOrder
        const orderToDelete = await AcceptedOrder.findById(orderId);

        if (!orderToDelete) {
            // Note: If order is already deleted (e.g. valid refresh), we might still want to proceed
            // to update AcceptedByDelivery status if it wasn't done yet.
            console.log("Order not found in acceptedorders (possibly already processed). Proceeding to check AcceptedByDelivery status.");
        } else {
            // 2. Insert into AcceptedByRestorent (Archive it)
            try {
                const archiveData = orderToDelete.toObject();
                delete archiveData._id; // Remove _id

                await AcceptedByRestorent.create(archiveData);
            } catch (archiveError) {
                if (archiveError.code === 11000) {
                    console.log("Order already exists in archive, proceeding to delete.");
                } else {
                    console.error("Error archiving order:", archiveError);
                    // Depending on criticality, we might want to fail here or continue.
                    // Let's continue but log error.
                }
            }

            // 3. Delete from AcceptedOrder
            await AcceptedOrder.findByIdAndDelete(orderId);
        }

        // 4. Update AcceptedByDelivery to mark as picked up
        // We need to find the document in AcceptedByDelivery that corresponds to this original order
        const AcceptedByDelivery = (await import("../../../../models/AcceptedByDelivery")).default;

        let updatedPickUp = null;

        if (deliveryId) {
            updatedPickUp = await AcceptedByDelivery.findByIdAndUpdate(
                deliveryId,
                { $set: { orderPickedUp: true } },
                { new: true }
            );
        }

        // Fallback: If no deliveryId provided or update failed (maybe ID mismatch?), try by originalOrderId
        if (!updatedPickUp) {
            updatedPickUp = await AcceptedByDelivery.findOneAndUpdate(
                { originalOrderId: orderId },
                { $set: { orderPickedUp: true } },
                { new: true }
            );
        }

        console.log("Updated pickup status for order:", orderId, "Success:", !!updatedPickUp);

        return NextResponse.json({
            message: "Order processed successfully",
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
