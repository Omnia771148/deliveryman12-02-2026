"use client";
import Link from 'next/link';
// import BottomNav from "../components/BottomNav";

export default function ContactUs() {
    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto", paddingBottom: "80px" }}>
            <h1 style={{ fontSize: "24px", marginBottom: "30px", textAlign: "center", color: "#333" }}>Contact Support</h1>

            <div style={{ backgroundColor: "#f8f9fa", padding: "25px", borderRadius: "12px", marginBottom: "20px" }}>
                <h3 style={{ marginTop: 0, color: "#0056b3" }}>Need Help?</h3>
                <p style={{ color: "#555", lineHeight: "1.6" }}>
                    If you are facing any issues with the delivery app or need assistance with your orders, please reach out to our support team.
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

                {/* Call Support */}
                <a href="tel:+919876543210" style={{ textDecoration: "none" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "20px",
                        backgroundColor: "#fff",
                        border: "1px solid #e1e4e8",
                        borderRadius: "10px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                    }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "#e8f5e9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "15px",
                            color: "#2e7d32",
                            fontSize: "20px"
                        }}>
                            📞
                        </div>
                        <div>
                            <h4 style={{ margin: "0 0 5px 0", color: "#333" }}>Call Support</h4>
                            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>+91 98765 43210</p>
                        </div>
                    </div>
                </a>

                {/* Email Support */}
                <a href="mailto:support@deliveryapp.com" style={{ textDecoration: "none" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "20px",
                        backgroundColor: "#fff",
                        border: "1px solid #e1e4e8",
                        borderRadius: "10px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                    }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "#e3f2fd",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "15px",
                            color: "#1565c0",
                            fontSize: "20px"
                        }}>
                            ✉️
                        </div>
                        <div>
                            <h4 style={{ margin: "0 0 5px 0", color: "#333" }}>Email Support</h4>
                            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>support@deliveryapp.com</p>
                        </div>
                    </div>
                </a>

                {/* Whatsapp Support */}
                <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "20px",
                        backgroundColor: "#fff",
                        border: "1px solid #e1e4e8",
                        borderRadius: "10px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                    }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "#e0f2f1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "15px",
                            color: "#00695c",
                            fontSize: "20px"
                        }}>
                            💬
                        </div>
                        <div>
                            <h4 style={{ margin: "0 0 5px 0", color: "#333" }}>WhatsApp Chat</h4>
                            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>Chat with us</p>
                        </div>
                    </div>
                </a>

            </div>
            {/* <BottomNav /> */}
        </div>
    );
}
