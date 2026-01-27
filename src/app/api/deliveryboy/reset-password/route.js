import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../../lib/db";
import DeliveryBoyUser from "../../../../../models/DeliveryBoyUser";

export async function POST(request) {
    try {
        await connectionToDatabase();
        const { phone, newPassword } = await request.json();

        if (!phone || !newPassword) {
            return NextResponse.json({ success: false, message: "Phone and new password are required" }, { status: 400 });
        }

        // Find and update. Handle both +91 and raw phone formats just to be safe, 
        // though the frontend should send consistent format.
        let user = await DeliveryBoyUser.findOne({ phone });

        if (!user) {
            // Try checking if stored without prefix
            const rawPhone = phone.replace('+91', '');
            user = await DeliveryBoyUser.findOne({ phone: rawPhone });

            if (!user) {
                return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
            }
        }

        user.password = newPassword;
        await user.save();

        return NextResponse.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
