import mongoose from "mongoose";

const TenantSchema = new mongoose.Schema({
    slug: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
},{timestamps:true});

export default mongoose.models.Tenant || mongoose.model("Tenant", TenantSchema);
