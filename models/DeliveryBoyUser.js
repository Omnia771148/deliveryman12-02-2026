import mongoose from "mongoose";

const deliveryBoySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    // NEW: Firebase UID to link the authenticated phone user
    firebaseUid: { type: String, required: true },
    // NEW: Document URLs from Firebase Storage
    aadharUrl: { type: String, required: true },
    rcUrl: { type: String, required: true },
    licenseUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { 
    collection: "deliveryboyusers",
    timestamps: true // Added this to automatically track when they joined
  }
);

export default mongoose.models.DeliveryBoyUser ||
  mongoose.model("DeliveryBoyUser", deliveryBoySchema);