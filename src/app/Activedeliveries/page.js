"use client";

import { useState, useEffect } from "react";
import Loading from "../loading/page";

export default function ActiveDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValues, setInputValues] = useState({});
  const [deliveryBoyId, setDeliveryBoyId] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // Get delivery boy ID from localStorage
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setDeliveryBoyId(storedUserId);
      // Execute both fetch functions to ensure we get data
      fetchDeliveriesApproach1(storedUserId);
      fetchDeliveriesApproach2(storedUserId);
    } else {
      setLoading(false);
      console.error("No userId found in localStorage");
    }
  }, []);

  // FIRST FETCH APPROACH
  const fetchDeliveriesApproach1 = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch("/api/accepted-deliveries");
      const data = await response.json();

      if (data.success) {
        // Filter deliveries by deliveryBoyId matching localStorage userId
        const filteredDeliveries = data.data.filter(
          delivery => delivery.deliveryBoyId === userId
        );

        setDeliveries(prev => {
          const merged = [...prev];
          filteredDeliveries.forEach(newDelivery => {
            if (!merged.some(d => d._id === newDelivery._id)) {
              merged.push(newDelivery);
            }
          });
          return merged;
        });
      }
    } catch (error) {
      console.error("Error fetching deliveries (Approach 1):", error);
    } finally {
      setLoading(false);
    }
  };

  // SECOND FETCH APPROACH
  const fetchDeliveriesApproach2 = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/accepted-deliveries?deliveryBoyId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setDeliveries(prev => {
          const merged = [...prev];
          data.data.forEach(newDelivery => {
            if (!merged.some(d => d._id === newDelivery._id)) {
              merged.push(newDelivery);
            }
          });
          return merged;
        });
      }
    } catch (error) {
      console.error("Error fetching deliveries (Approach 2):", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (orderId, value) => {
    setInputValues({
      ...inputValues,
      [orderId]: value
    });
  };

  const verifyRazorpayId = async (delivery) => {
    const userInput = inputValues[delivery._id] || "";
    const razorpayOrderId = delivery.razorpayOrderId;

    if (!razorpayOrderId) {
      alert("No Razorpay Order ID found for this order");
      return;
    }

    const last5Digits = razorpayOrderId.slice(-5);

    if (userInput === last5Digits) {
      try {
        setVerifying(true);

        const response = await fetch("/api/complete-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: delivery._id
          }),
        });

        const result = await response.json();

        if (result.success) {
          alert(`✅ Verification successful!\nOrder completed and moved to completed orders.\nTotal Amount: ₹${result.data.grandTotal}`);

          setDeliveries(prev => prev.filter(item => item._id !== delivery._id));

          setInputValues(prev => {
            const newValues = { ...prev };
            delete newValues[delivery._id];
            return newValues;
          });
        } else {
          alert(`❌ Failed: ${result.message}`);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to complete order. Please try again.");
      } finally {
        setVerifying(false);
      }
    } else {
      alert(`❌ Incorrect! Last 5 digits are: ${last5Digits}`);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!deliveryBoyId) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#dc3545" }}>
        Please login to view deliveries. No delivery boy ID found.
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px", color: "#333" }}>
        My Deliveries
      </h1>

      {deliveries.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "40px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          color: "#6c757d",
          border: "1px dashed #dee2e6"
        }}>
          No active deliveries found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {deliveries.map((delivery) => (
            <div
              key={delivery._id}
              style={{
                border: "1px solid #e1e4e8",
                borderRadius: "12px",
                backgroundColor: "#fff",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                overflow: "hidden"
              }}
            >
              <div style={{ padding: "20px" }}>
                {/* Top Row: Rest Name, Location Map & Date */}
                <div style={{ marginBottom: "15px" }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2 style={{ margin: "0 0 5px 0", fontSize: "18px", color: "#2c3e50" }}>
                        {delivery.rest || "Restaurant Name Not Available"}
                      </h2>
                      <a
                        href={delivery.location?.mapUrl || "https://maps.app.goo.gl/k9vr4HE4LktfbX4t8"}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          marginTop: "5px",
                          color: "#007bff",
                          fontSize: "14px",
                          textDecoration: "none",
                          fontWeight: "500"
                        }}
                      >
                        <span style={{ marginRight: "4px" }}>📍</span> Restaurant Location
                      </a>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: "12px", color: "#6c757d" }}>
                        {delivery.createdAt ? new Date(delivery.createdAt).toLocaleDateString() : ""}
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#6c757d" }}>
                        {delivery.createdAt ? new Date(delivery.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                  <div>
                    <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Items</p>
                    <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px", color: "#333" }}>
                      {delivery.totalCount || delivery.items?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Delivery Charge</p>
                    <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px", color: "#333" }}>
                      ₹{delivery.deliveryCharge || 0}
                    </p>
                  </div>
                  <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #dee2e6", paddingTop: "10px", marginTop: "5px" }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: 0, fontSize: "12px", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Payment Status</p>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        backgroundColor: (delivery.paymentStatus || "").toLowerCase() === 'paid' ? '#d4edda' : '#fff3cd',
                        color: (delivery.paymentStatus || "").toLowerCase() === 'paid' ? '#155724' : '#856404',
                        fontSize: "13px",
                        fontWeight: "600"
                      }}>
                        {delivery.paymentStatus || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Verify Box */}
                <div style={{ backgroundColor: "#e8f4fd", padding: "15px", borderRadius: "8px", border: "1px solid #b6d4fe" }}>
                  <label style={{ display: "block", marginBottom: "10px", color: "#004085", fontSize: "14px", fontWeight: "600" }}>
                    Verify Delivery
                  </label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="text"
                      value={inputValues[delivery._id] || ""}
                      onChange={(e) => handleInputChange(delivery._id, e.target.value)}
                      placeholder="Last 5 digits of Razorpay ID"
                      maxLength="5"
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "1px solid #ced4da",
                        borderRadius: "6px",
                        fontSize: "14px",
                        outline: "none"
                      }}
                    />
                    <button
                      onClick={() => verifyRazorpayId(delivery)}
                      disabled={verifying}
                      style={{
                        padding: "0 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "600",
                        cursor: verifying ? "wait" : "pointer",
                        opacity: verifying ? 0.7 : 1,
                        transition: "background-color 0.2s"
                      }}
                    >
                      {verifying ? "..." : "Verify"}
                    </button>
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