"use client";

import { useState, useEffect } from "react";
import Loading from "../loading/page";

export default function CompletedOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deliveryBoyId, setDeliveryBoyId] = useState("");

    // Filter State: '1day', '3days', '1week', '1month'
    const [filterPeriod, setFilterPeriod] = useState("all");

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setDeliveryBoyId(storedUserId);
            fetchCompletedOrders(storedUserId);
        } else {
            setLoading(false);
            console.error("No userId found in localStorage");
        }
    }, []);

    // Initial load updates both orders and filtered orders
    const fetchCompletedOrders = async (userId) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/complete-order?deliveryBoyId=${userId}`);
            const data = await response.json();

            console.log("Completed Orders Response:", data);

            if (data.success) {
                setOrders(data.data);
                setFilteredOrders(data.data); // Default to showing all
            }
        } catch (error) {
            console.error("Error fetching completed orders:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    useEffect(() => {
        if (!orders.length) {
            setFilteredOrders([]);
            return;
        }

        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;

        const filtered = orders.filter(order => {
            if (filterPeriod === "all") return true;

            const orderDate = new Date(order.completedAt || order.updatedAt || order.createdAt);
            const diffTime = now - orderDate;

            switch (filterPeriod) {
                case "1day":
                    return diffTime <= oneDay;
                case "3days":
                    return diffTime <= 3 * oneDay;
                case "1week":
                    return diffTime <= 7 * oneDay;
                case "1month":
                    return diffTime <= 30 * oneDay;
                default:
                    return true;
            }
        });

        setFilteredOrders(filtered);

    }, [filterPeriod, orders]);

    // Calculate Total Earnings for the current filtered view
    const totalEarnings = filteredOrders.reduce((sum, order) => {
        return sum + (Number(order.deliveryCharge) || 0);
    }, 0);


    if (loading) {
        return <Loading />;
    }

    if (!deliveryBoyId) {
        return (
            <div style={{ padding: "20px", textAlign: "center", color: "#dc3545" }}>
                Please login to view delivery history. No delivery boy ID found.
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "24px", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px", color: "#333" }}>
                Completed Orders History
            </h1>

            {/* Filter Buttons */}
            <div style={{
                display: "flex",
                gap: "10px",
                overflowX: "auto",
                paddingBottom: "15px",
                marginBottom: "15px",
                whiteSpace: "nowrap",
                scrollbarWidth: "none"
            }}>
                {[
                    { id: "all", label: "All Time" },
                    { id: "1day", label: "Past 24h" },
                    { id: "3days", label: "Past 3 Days" },
                    { id: "1week", label: "Past Week" },
                    { id: "1month", label: "Past Month" }
                ].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => setFilterPeriod(opt.id)}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "20px",
                            border: "none",
                            backgroundColor: filterPeriod === opt.id ? "#007bff" : "#e9ecef",
                            color: filterPeriod === opt.id ? "#fff" : "#495057",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            transition: "all 0.2s"
                        }}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Total Earnings Highlight Card */}
            <div style={{
                background: "linear-gradient(135deg, #28a745 0%, #218838 100%)",
                borderRadius: "12px",
                padding: "20px",
                color: "white",
                marginBottom: "25px",
                boxShadow: "0 4px 6px rgba(40, 167, 69, 0.2)"
            }}>
                <p style={{ margin: "0 0 5px 0", fontSize: "14px", opacity: 0.9 }}>Total Earnings ({filterPeriod === 'all' ? 'All Time' : filterPeriod})</p>
                <h2 style={{ margin: 0, fontSize: "32px", fontWeight: "bold" }}>₹{totalEarnings}</h2>
                <p style={{ margin: "5px 0 0 0", fontSize: "13px", opacity: 0.8 }}>
                    from {filteredOrders.length} completed {filteredOrders.length === 1 ? 'order' : 'orders'}
                </p>
            </div>


            {filteredOrders.length === 0 ? (
                <div style={{
                    textAlign: "center",
                    padding: "40px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    color: "#6c757d",
                    border: "1px dashed #dee2e6"
                }}>
                    No completed orders found for this period.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {filteredOrders.map((order) => (
                        <div
                            key={order._id}
                            style={{
                                border: "1px solid #e1e4e8",
                                borderRadius: "12px",
                                backgroundColor: "#fff",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                                overflow: "hidden",
                                opacity: 0.9
                            }}
                        >
                            <div style={{ padding: "20px" }}>
                                {/* Top Row: Rest Name & Completed Date */}
                                <div style={{ marginBottom: "15px" }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h2 style={{ margin: "0 0 5px 0", fontSize: "18px", color: "#2c3e50" }}>
                                                {order.rest || "Restaurant Name Not Available"}
                                            </h2>
                                            <p style={{ margin: 0, fontSize: "13px", color: "#28a745", fontWeight: "600" }}>
                                                ✓ Delivered successfully
                                            </p>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <p style={{ margin: 0, fontSize: "12px", color: "#6c757d" }}>
                                                {order.completedAt ? new Date(order.completedAt).toLocaleDateString() : (order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : "Date N/A")}
                                            </p>
                                            <p style={{ margin: 0, fontSize: "12px", color: "#6c757d" }}>
                                                {order.completedAt ? new Date(order.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Stats Grid */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                                    <div>
                                        <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Earnings</p>
                                        <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px", color: "#28a745" }}>
                                            ₹{order.deliveryCharge || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Items</p>
                                        <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px", color: "#333" }}>
                                            {order.totalCount || order.items?.length || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* Collapsible/Expandable Details */}
                                <div style={{ borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "10px" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px", color: "#555" }}>
                                        <div>
                                            <span>Order ID:</span>
                                            <br />
                                            <span style={{ fontFamily: "monospace", color: "#333" }}>{order.orderId || "N/A"}</span>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
