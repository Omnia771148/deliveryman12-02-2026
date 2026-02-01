"use client";
import { useEffect, useState, useCallback } from "react";
import Loading from "../loading/page";
import AuthWrapper from "../components/AuthWrapper";
// import BottomNav from "../components/BottomNav";
import Link from "next/link"; // Added for redirecting to mainpage if needed

export default function AcceptedOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // LOGIC FROM FIRST: State to track if driver is already busy
  const [hasActiveDelivery, setHasActiveDelivery] = useState(false);

  // RE-ADDED: track active status
  const [isActive, setIsActive] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("deliveryBoyActiveStatus");
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  // ✅ FIXED LOGIC FROM FIRST: Define current user and check state here
  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const hasActiveOrder = orders.some(o => o.deliveryBoyId === currentUserId && o.status !== "Delivered");

  // FIRST CODE'S fetchOrders function
  const fetchOrders = useCallback(async () => {
    try {
      const deliveryBoyId = localStorage.getItem("userId");

      if (!deliveryBoyId) {
        console.warn("No userId in localStorage");
        setOrders([]);
        setFilteredOrders([]);
        setLoading(false);
        return;
      }

      // Check active status from localStorage on every fetch to stay synced
      const savedStatus = localStorage.getItem("deliveryBoyActiveStatus");
      if (savedStatus !== null) {
        setIsActive(JSON.parse(savedStatus));
      }

      // LOGIC FROM FIRST: Call your Accepted Deliveries API
      const activeRes = await fetch("/api/accepted-deliveries");
      const activeData = await activeRes.json();
      if (activeData.success) {
        // If any order in the list belongs to this driver, they are busy
        const isBusy = activeData.data.some(d => d.deliveryBoyId === deliveryBoyId);
        setHasActiveDelivery(isBusy);
      }

      // If NOT active, we don't even need to fetch new orders, but let's fetch to be safe or just return empty?
      // The user wants "not receive orders".
      // Let's continue fetching so we know if there are orders, but we will block the view below.

      const res = await fetch(
        `/api/acceptedorders?deliveryBoyId=${deliveryBoyId}`
      );

      if (!res.ok) {
        console.error("API error:", res.status);
        setOrders([]);
        setFilteredOrders([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const ordersArray = Array.isArray(data) ? data : [];

      // Filter orders where current user hasn't rejected
      const filtered = ordersArray.filter(order =>
        !order.rejectedBy?.includes(deliveryBoyId)
      );

      setOrders(ordersArray);
      setFilteredOrders(filtered);
      setLoading(false);
    } catch (err) {
      console.error("Fetch failed:", err);
      // setOrders([]);
      // setFilteredOrders([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchOrders();

    // Set up polling every 3 seconds
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 3000);

    // Cleanup function to clear interval when component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchOrders]);

  // ✅ FIRST CODE'S ACCEPT ORDER
  const acceptOrderFirst = async (orderId) => {
    const deliveryBoyId = localStorage.getItem("userId");

    if (!deliveryBoyId) {
      alert("Login expired");
      return;
    }

    // Check if delivery boy is active
    if (!isActive) {
      alert("You must be Active to accept orders!");
      return;
    }

    // LOGIC FROM FIRST: Prevent acceptance if already busy
    if (hasActiveDelivery || hasActiveOrder) {
      alert("Finish your active order first!");
      return;
    }

    try {
      const res = await fetch("/api/acceptedorders/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, deliveryBoyId }),
      });
      const serverData = await res.json();
      if (!res.ok) {
        // If the server sends 409 (Conflict), serverData.message will be "Too late!..."
        alert(serverData.message);

        // Remove from list immediately so the boy doesn't try again
        setFilteredOrders((prev) => prev.filter((o) => o._id !== orderId));
        return;
      }


      // Update both orders states
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      setFilteredOrders((prev) => prev.filter((o) => o._id !== orderId));
      alert("Order accepted successfully");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  // ❌ FIRST CODE'S REJECT ORDER
  const rejectOrderFirst = async (orderId) => {
    const deliveryBoyId = localStorage.getItem("userId");

    if (!deliveryBoyId) {
      alert("Login expired");
      return;
    }

    await fetch("/api/acceptedorders/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, deliveryBoyId }),
    });

    // Update both orders states
    setOrders((prev) => prev.filter((o) => o._id !== orderId));
    setFilteredOrders((prev) => prev.filter((o) => o._id !== orderId));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) return <Loading />;

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 pb-24">
        <div className="max-w-7xl mx-auto">

          {/* LOGIC FROM FIRST: Visual alert for active delivery */}
          {(hasActiveDelivery || hasActiveOrder) && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6 font-bold text-center">
              ⚠️ ACTIVE DELIVERY IN PROGRESS. FINISH IT TO ACCEPT NEW ORDERS.
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Available Orders</h1>

            <p className="text-gray-600 mt-2">
              Orders available for delivery. Orders you've rejected are automatically hidden.
            </p>

            <div className="flex items-center gap-4 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Total orders: {orders.length}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Available to you: {filteredOrders.length}</span>
              </div>
              {/* Added Status Indicator */}
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={isActive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* ADDED: Check if delivery boy is inactive - show message instead of orders */}
          {!isActive ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-gray-400 text-6xl mb-4">⏸️</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                You are currently Inactive
              </h3>
              <p className="text-gray-600 mb-4">
                Please go to the Home page and set yourself as Active to see and accept delivery orders.
              </p>
              <Link href="/mainpage" className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 text-decoration-none">
                Go to Home
              </Link>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {orders.length === 0 ? "No orders available" : "No orders available for you"}
              </h3>
              <p className="text-gray-600">
                {orders.length === 0
                  ? "New orders will appear here when assigned to you"
                  : "You have rejected all available orders or no orders match your criteria"
                }
              </p>
              {orders.length > 0 && filteredOrders.length === 0 && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg inline-block">
                  <p className="text-sm text-yellow-700">
                    ℹ️ You've rejected {orders.length} order{orders.length > 1 ? 's' : ''}.
                    Orders you reject won't appear here again.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOrders.map((order) => {
                const deliveryBoyId = localStorage.getItem("userId");
                const hasRejected = order.rejectedBy?.includes(deliveryBoyId);

                // Skip rendering if user has rejected this order
                if (hasRejected) return null;

                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                  >
                    {/* Order Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            Order #{order.orderId}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === "Accepted by Restaurant"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                              }`}>
                              {order.status}
                            </span>
                            <span className="text-sm text-gray-600">
                              {new Date(order.orderDate).toLocaleDateString('en-IN', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(order.grandTotal)}
                          </p>
                          <p className="text-sm text-gray-600">Total</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Customer & Restaurant Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                              Customer Details
                            </h4>
                            <p className="text-gray-900">
                              <span className="font-medium">User ID:</span> {order.userId}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                              Restaurant
                            </h4>
                            <p className="text-gray-900">
                              <span className="font-medium">ID:</span> {order.restaurantId}
                            </p>
                            {order.rest && (
                              <p className="text-gray-700 mt-1">
                                📍 {order.rest}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                              Payment Details
                            </h4>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Payment Status:</span>
                                <span className={`font-medium ${order.paymentStatus === "Pending"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                                  }`}>
                                  {order.paymentStatus}
                                </span>
                              </div>
                              {order.razorpayOrderId && (
                                <p className="text-sm text-gray-600 truncate">
                                  <span className="font-medium">Razorpay ID:</span> {order.razorpayOrderId}
                                </p>
                              )}
                            </div>
                          </div>

                          {order.location && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                Delivery Location
                              </h4>
                              <p className="text-gray-700">
                                <span className="font-medium">Coordinates:</span> {order.location.lat}, {order.location.lng}
                              </p>
                              {order.location.mapUrl && (
                                <a
                                  href={order.location.mapUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mt-1"
                                >
                                  🌐 View on Map
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items Section */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <span className="mr-2">🛍️</span>
                          Order Items ({order.totalCount} items)
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-600">Item ID: {item.itemId}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">{formatCurrency(item.price)}</p>
                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                <p className="text-sm text-gray-600">
                                  Subtotal: {formatCurrency(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Items Total:</span>
                            <span className="font-medium">{formatCurrency(order.totalPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">GST:</span>
                            <span className="font-medium">{formatCurrency(order.gst)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivery Charge:</span>
                            <span className="font-medium">{formatCurrency(order.deliveryCharge)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-300">
                            <span className="text-lg font-bold text-gray-900">Grand Total:</span>
                            <span className="text-lg font-bold text-gray-900">
                              {formatCurrency(order.grandTotal)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info & Actions */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                          <div className="space-y-2">
                            {order.aa && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Additional Info:</span> {order.aa}
                              </p>
                            )}
                            {order.deliveryBoyId && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Assigned Delivery:</span> {order.deliveryBoyId}
                              </p>
                            )}
                            {order.rejectedBy && order.rejectedBy.length > 0 && (
                              <div>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Rejected by {order.rejectedBy.length} delivery boy(s):</span>
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {order.rejectedBy.map((id, idx) => (
                                    <span
                                      key={idx}
                                      className={`px-2 py-1 text-xs rounded-full ${id === deliveryBoyId
                                        ? 'bg-red-200 text-red-900 border border-red-300'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                      {id === deliveryBoyId ? 'You' : id.substring(0, 8) + '...'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-3">
                            <div className="flex gap-3">
                              <button
                                onClick={() => rejectOrderFirst(order._id)}
                                className="px-6 py-2 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors duration-200 flex items-center"
                              >
                                <span className="mr-2">✗</span>
                                Reject
                              </button>
                              <button
                                onClick={() => acceptOrderFirst(order._id)}
                                // Disable if has active delivery
                                disabled={hasActiveDelivery || hasActiveOrder}
                                className={`px-6 py-2 font-semibold rounded-lg shadow-md flex items-center transition-all ${(hasActiveDelivery || hasActiveOrder)
                                  ? "bg-gray-400 cursor-not-allowed opacity-70"
                                  : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90"
                                  }`}
                              >
                                <span className="mr-2">✓</span>
                                {(hasActiveDelivery || hasActiveOrder)
                                  ? "Finish Active Order First"
                                  : "Accept Delivery"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* <BottomNav /> */}
    </AuthWrapper>
  );
}