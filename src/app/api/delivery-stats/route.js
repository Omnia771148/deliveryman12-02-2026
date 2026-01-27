import { NextResponse } from "next/server";
import mongoose from "mongoose";
import FinalCompletedOrder from "../../../../models/FinalCompletedOrder";

const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const deliveryBoyId = searchParams.get("deliveryBoyId");

        if (!deliveryBoyId) {
            return NextResponse.json({ success: false, message: "Delivery Boy ID required" }, { status: 400 });
        }

        const now = new Date();
        // Set to beginning of today (local time depends on server, but typically UTC in generic deployments).
        // ideally we should handle timezones, but for now using server time.
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));

        // Start of month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Aggregate stats
        const stats = await FinalCompletedOrder.aggregate([
            {
                $match: {
                    deliveryBoyId: deliveryBoyId
                }
            },
            {
                $facet: {
                    "total": [
                        { $count: "count" }
                    ],
                    "today": [
                        { $match: { completedAt: { $gte: startOfToday } } },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 },
                                earnings: { $sum: "$deliveryCharge" } // Using deliveryCharge as earnings
                            }
                        }
                    ],
                    "month": [
                        { $match: { completedAt: { $gte: startOfMonth } } },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 },
                                earnings: { $sum: "$deliveryCharge" }
                            }
                        }
                    ]
                }
            }
        ]);

        const todayStats = stats[0].today[0] || { count: 0, earnings: 0 };
        const monthStats = stats[0].month[0] || { count: 0, earnings: 0 };
        const totalCount = stats[0].total[0] ? stats[0].total[0].count : 0;

        return NextResponse.json({
            success: true,
            data: {
                todayOrders: todayStats.count,
                todayEarnings: todayStats.earnings,
                totalOrders: totalCount,
                monthlyEarnings: monthStats.earnings,
            }
        });

    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
