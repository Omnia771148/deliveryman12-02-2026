"use client";
import { useState } from "react";
import { storage, auth } from "../../../../lib/firebase"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"; 
import imageCompression from 'browser-image-compression';
import Loading from "../../loading/page";

export default function DeliveryBoySignup() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: ""
  });
  
  // COMMENTED OUT: Document storage state
  const [selectedFiles, setSelectedFiles] = useState({
    /* aadharUrl: null,
    rcUrl: null,
    licenseUrl: null */
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!form.phone.startsWith("+")) {
      alert("Please enter phone number with country code (e.g., +919876543210)");
      return;
    }

    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
      const result = await signInWithPhoneNumber(auth, form.phone, window.recaptchaVerifier);
      setConfirmationResult(result);
      setIsOtpSent(true);
      alert("OTP sent to your phone!");
    } catch (error) {
      console.error("OTP Error:", error);
      alert("Failed to send OTP. Check console.");
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // COMMENTED OUT: Document validation
    /* if (!selectedFiles.aadharUrl || !selectedFiles.rcUrl || !selectedFiles.licenseUrl) {
      alert("Please select all 3 photos first!");
      return;
    } */

    setIsSubmitting(true);

    try {
      const result = await confirmationResult.confirm(otp);
      const firebaseUser = result.user; 

      const uploadResults = {};
      
      // COMMENTED OUT: The upload loop for documents
      /*
      const fileKeys = ["aadharUrl", "rcUrl", "licenseUrl"];
      for (const key of fileKeys) {
        const file = selectedFiles[key];
        const options = { maxSizeMB: 0.1, maxWidthOrHeight: 800, useWebWorker: true, initialQuality: 0.5 };
        const compressedFile = await imageCompression(file, options);

        const storageRef = ref(storage, `delivery_docs/${form.phone}/${key}`);
        await uploadBytes(storageRef, compressedFile);
        const url = await getDownloadURL(storageRef);
        uploadResults[key] = url;
      }
      */

      // API CALL TO MONGODB (Removed uploadResults from here)
      const finalFormData = { ...form, firebaseUid: firebaseUser.uid };
      const res = await fetch("/api/deliveryboy/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalFormData),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        window.location.href = "/deliveryboy/login";
      } else {
        alert(data.message || "Signup failed");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Verification/Signup error:", error);
      alert("Invalid OTP or Registration failed.");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 350, margin: "40px auto", padding: "20px", fontFamily: "sans-serif" }}>
      {isSubmitting && <Loading />}
      <div id="recaptcha-container"></div>

      <h2>Delivery Boy Signup</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} style={inputStyle} required />
        <input name="email" placeholder="Email" onChange={handleChange} style={inputStyle} required />
        <input name="phone" placeholder="Phone" onChange={handleChange} style={inputStyle} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} style={inputStyle} required />
        
        {[ 
          { label: "Aadhar Card", field: "aadharUrl" },
          { label: "RC Book", field: "rcUrl" },
          { label: "Driving License", field: "licenseUrl" }
        ].map((item) => (
          <div key={item.field} style={uploadBox}>
            <label style={{ fontSize: "14px", fontWeight: "bold" }}>{item.label}:</label>
            <input 
              type="file" accept="image/*" capture="environment" 
              onChange={(e) => handleFileChange(e, item.field)} 
              style={{ display: "block", marginTop: "5px" }}
            />
            {selectedFiles[item.field] && (
              <span style={{ color: "blue", fontSize: "12px" }}>📍 File Selected</span>
            )}
          </div>
        ))}

        <button type="submit" style={btnStyle} disabled={isSubmitting}>
          {isSubmitting ? "Uploading & Saving..." : "Signup"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" };
const uploadBox = { marginBottom: "15px", padding: "12px", background: "#fefefe", borderRadius: "8px", border: "1px solid #eee", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" };
const btnStyle = { width: "100%", padding: "12px", background: "#0070f3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };