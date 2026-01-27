"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "../components/BottomNav";
import styles from "./myprofile.module.css";

export default function MyProfileMenu() {
    const router = useRouter();
    const [user, setUser] = useState({
        name: "",
        phone: ""
    });

    useEffect(() => {
        const name = localStorage.getItem("deliveryBoyName");
        const phone = localStorage.getItem("deliveryBoyPhone");

        setUser({
            name: name || "Delivery Partner",
            phone: phone || ""
        });
    }, []);

    const handleLogout = () => {
        if (!confirm("Are you sure you want to logout?")) return;

        localStorage.removeItem("userId");
        localStorage.removeItem("deliveryBoyName");
        localStorage.removeItem("deliveryBoyPhone");
        localStorage.removeItem("loginTimestamp");
        localStorage.removeItem("deliveryBoyActiveStatus");

        // Redirect to login
        router.push("/deliveryboy/login");
    };

   
    return (
        <div className={styles.pageContainer}>

            <div className="container pt-4">
                {/* Header Banner */}
                <div className={`d-flex align-items-center justify-content-between p-3 mb-4 shadow-sm ${styles.headerBanner}`}>
                    <div className="d-flex align-items-center">
                        <div className={styles.logoCircle}>
                            <span className={styles.logoText}>SPV</span>
                        </div>
                    </div>
                    <div className="text-end">
                        <p className={`m-0 fw-bold ${styles.headerTitle}`}>Delivery partner app</p>
                        <p className={`m-0 ${styles.headerSubtitle}`}>Thanks for your service</p>
                    </div>
                </div>

                {/* Setting Title Pill */}
                <div className={`d-inline-flex align-items-center px-4 py-2 mb-4 bg-white shadow-sm ${styles.settingPill}`}>
                    <i className={`bi bi-gear-fill me-2 ${styles.settingIcon}`}></i>
                    <span className={styles.settingText}>Setting</span>
                </div>

                {/* Main Menu Card */}
                <div className={`p-4 shadow-sm ${styles.mainCard}`}>

                    <div className="d-flex flex-column gap-3">
                        {/* My Profile Link */}
                        <Link href="/mydetails" className="text-decoration-none">
                            <div className={`d-flex align-items-center justify-content-between bg-white px-4 py-3 shadow-sm ${styles.menuItem}`}>
                                <div className="d-flex align-items-center">
                                    <i className={`bi bi-pencil-square text-black ${styles.menuIcon}`}></i>
                                    <span className={styles.menuText}>my profile</span>
                                </div>
                                <i className={`bi bi-play-fill text-black ${styles.arrowIcon}`}></i>
                            </div>
                        </Link>

                        {/* My Orders Link */}
                        <Link href="/myorders" className="text-decoration-none">
                            <div className={`d-flex align-items-center justify-content-between bg-white px-4 py-3 shadow-sm ${styles.menuItem}`}>
                                <div className="d-flex align-items-center">
                                    {/* Mailbox icon approximation */}
                                    <i className={`bi bi-mailbox text-black ${styles.menuIcon}`}></i>
                                    <span className={styles.menuText}>My Orders</span>
                                </div>
                                <i className={`bi bi-play-fill text-black ${styles.arrowIcon}`}></i>
                            </div>
                        </Link>

                        {/* Contact Us Link */}
                        <Link href="/contactus" className="text-decoration-none">
                            <div className={`d-flex align-items-center justify-content-between bg-white px-4 py-3 shadow-sm ${styles.menuItem}`}>
                                <div className="d-flex align-items-center">
                                    <i className={`bi bi-envelope text-black ${styles.menuIcon}`}></i>
                                    <span className={styles.menuText}>Contact Us</span>
                                </div>
                                <i className={`bi bi-play-fill text-black ${styles.arrowIcon}`}></i>
                            </div>
                        </Link>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className={`w-100 border-0 py-3 mt-4 shadow-sm text-center ${styles.logoutButton}`}
                        >
                            Logout
                        </button>
                    </div>

                </div>

            </div>
            <BottomNav />
        </div>
    );
}
