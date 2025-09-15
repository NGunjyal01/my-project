import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
},{timestamps:true});

export default mongoose.models.User || mongoose.model("User", UserSchema);
