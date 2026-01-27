import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../../lib/db";
import DeliveryBoyUser from "../../../../../models/DeliveryBoyUser";

export async function POST(request) {
    try {
        await connectionToDatabase();
        const { phone } = await request.json();

        if (!phone) {
            return NextResponse.json({ success: false, message: "Phone number is required" }, { status: 400 });
        }

        // Check if phone exists (formatted as +91...)
        const user = await DeliveryBoyUser.findOne({ phone: phone });

        if (!user) {
            // Try without +91 just in case
            const userRaw = await DeliveryBoyUser.findOne({ phone: phone.replace('+91', '') });
            if (!userRaw) {
                return NextResponse.json({ success: false, message: "Phone number not registered" }, { status: 404 });
            }
        }

        return NextResponse.json({ success: true, message: "User found" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
