"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "../components/BottomNav";
import Loading from "../loading/page";

export default function MyDetails() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            const storedUserId = localStorage.getItem("userId");
            if (!storedUserId) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`/api/deliveryboy/details?id=${storedUserId}`);
                const data = await res.json();
                if (data.success) {
                    setUser(data.data);
                } else {
                    console.error("Failed to fetch user details");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, []);

    if (loading) return <Loading />;
    if (!user) return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <p>User details not found. Please log in again.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50" style={{ paddingBottom: "100px", fontFamily: "Segoe UI, sans-serif" }}>
            {/* Profile Header */}
            <div style={{ backgroundColor: "#2d3436", color: "white", padding: "30px 20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <div style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        backgroundColor: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "30px",
                        color: "#2d3436"
                    }}>
                        👤
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "24px" }}>{user.name}</h2>
                        <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>+91 {user.phone}</p>
                        <span style={{
                            display: "inline-block",
                            marginTop: "8px",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            backgroundColor: user.isActive ? "#00b894" : "#ff7675",
                            fontSize: "12px",
                            fontWeight: "bold"
                        }}>
                            {user.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>

                {/* Info Card: Personal */}
                <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.02)", marginBottom: "20px" }}>
                    <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#555", borderBottom: "1px solid #eee", paddingBottom: "10px", display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: "8px" }}>📋</span> Personal Details
                    </h3>
                    <div style={{ display: "grid", gap: "15px" }}>
                        <DetailRow label="Full Name" value={user.name} />
                        <DetailRow label="Email" value={user.email} />
                        <DetailRow label="Phone" value={`+91 ${user.phone}`} />
                        <DetailRow label="Partner ID" value={user._id} mono />
                    </div>
                </div>

                {/* Info Card: Bank */}
                <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.02)", marginBottom: "20px" }}>
                    <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#555", borderBottom: "1px solid #eee", paddingBottom: "10px", display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: "8px" }}>🏦</span> Bank Details
                    </h3>
                    <div style={{ display: "grid", gap: "15px" }}>
                        <DetailRow label="Account Number" value={user.accountNumber} mono />
                        <DetailRow label="IFSC Code" value={user.ifscCode} mono />
                    </div>
                </div>

                {/* Info Card: Documents */}
                <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.02)", marginBottom: "20px" }}>
                    <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#555", borderBottom: "1px solid #eee", paddingBottom: "10px", display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: "8px" }}>🪪</span> Documents
                    </h3>
                    <div style={{ display: "grid", gap: "20px" }}>
                        <DocumentRow label="Aadhar Card" number={user.aadharNumber} url={user.aadharUrl} />
                        <DocumentRow label="RC Book" number={user.rcNumber} url={user.rcUrl} />
                        <DocumentRow label="Driving License" number={user.licenseNumber} url={user.licenseUrl} />
                    </div>
                </div>

                <p style={{ textAlign: "center", marginTop: "20px", color: "#b2bec3", fontSize: "12px" }}>
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                </p>

            </div>
            <BottomNav />
        </div>
    );
}

function DetailRow({ label, value, mono }) {
    return (
        <div>
            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>{label}</label>
            <div style={{
                fontSize: "15px",
                color: "#333",
                fontWeight: "500",
                fontFamily: mono ? "monospace" : "inherit",
                wordBreak: "break-all"
            }}>
                {value || "N/A"}
            </div>
        </div>
    );
}

function DocumentRow({ label, number, url }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "10px", borderBottom: "1px dashed #eee" }}>
            <div>
                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>{label}</label>
                <div style={{ fontSize: "15px", color: "#333", fontWeight: "600", marginBottom: "5px" }}>{number || "N/A"}</div>
            </div>
            {url && (
                <a href={url} target="_blank" rel="noopener noreferrer"
                    style={{
                        fontSize: "13px",
                        color: "#0984e3",
                        textDecoration: "none",
                        border: "1px solid #0984e3",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        marginTop: "10px"
                    }}>
                    View Image
                </a>
            )}
        </div>
    );
}
