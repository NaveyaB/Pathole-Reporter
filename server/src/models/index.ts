import mongoose from "mongoose";

const idField = { type: String, index: true };

export const userSchema = new mongoose.Schema(
  {
    id: idField,
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    password: { type: String, required: true },
    phone: String,
    role: { type: String, enum: ["citizen", "contractor", "admin", "super_admin"], default: "citizen", index: true },
    avatar: String,
    address: String,
    district: String,
    location: { lat: Number, lng: Number },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    verified: { type: Boolean, default: true },
    contractor: {
      specialty: String,
      teamSize: Number,
      rating: Number,
      completedJobs: Number,
    },
    createdAt: String,
    updatedAt: String,
  },
  { id: false, versionKey: false, collection: "users" }
);

export const complaintSchema = new mongoose.Schema(
  {
    id: idField,
    reportNumber: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: String,
    images: [{ url: String, publicId: String, width: Number, height: Number }],
    location: { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
    address: String,
    district: String,
    type: { type: String, enum: ["pothole", "crack", "rutting", "depression", "surface_damage", "edge_damage", "sinkhole", "other"], index: true },
    status: { type: String, enum: ["submitted", "under_review", "verified", "assigned", "in_progress", "completed", "rejected"], default: "submitted", index: true },
    priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium", index: true },
    reporter: { type: String, index: true },
    assignedContractor: String,
    aiAnalysis: {
      detected: { type: String, enum: ["pothole", "crack", "rutting", "depression", "surface_damage", "edge_damage", "sinkhole", "other"] },
      severity: { type: String, enum: ["low", "medium", "high", "critical"] },
      confidence: Number,
      recommendation: String,
      isRoadImage: Boolean,
      tags: [String],
      model: String,
      analyzedAt: String,
      raw: mongoose.Schema.Types.Mixed,
    },
    duplicateOf: String,
    completion: {
      beforeImages: [{ url: String, publicId: String, width: Number, height: Number }],
      afterImages: [{ url: String, publicId: String, width: Number, height: Number }],
      notes: String,
      repairType: String,
      completedBy: String,
      completedAt: String,
      durationHours: Number,
    },
    feedback: { rating: Number, comment: String, createdAt: String },
    verifiedBy: String,
    verifiedAt: String,
    assignedAt: String,
    startedAt: String,
    completedAt: String,
    rejectedReason: String,
    timestamps: { created: String, updated: String },
  },
  { id: false, versionKey: false, collection: "complaints" }
);

export const notificationSchema = new mongoose.Schema(
  {
    id: idField,
    user: { type: String, index: true },
    type: { type: String, enum: ["complaint", "ai", "assignment", "completion", "feedback", "system", "info"], default: "info" },
    title: String,
    message: String,
    link: String,
    read: { type: Boolean, default: false, index: true },
    createdAt: String,
  },
  { id: false, versionKey: false, collection: "notifications" }
);

export const activityLogSchema = new mongoose.Schema(
  {
    id: idField,
    action: String,
    user: String,
    userName: String,
    complaint: String,
    complaintNumber: String,
    description: String,
    createdAt: String,
  },
  { id: false, versionKey: false, collection: "activity_logs" }
);

export const UserModel = mongoose.model("User", userSchema);
export const ComplaintModel = mongoose.model("Complaint", complaintSchema);
export const NotificationModel = mongoose.model("Notification", notificationSchema);
export const ActivityLogModel = mongoose.model("ActivityLog", activityLogSchema);
