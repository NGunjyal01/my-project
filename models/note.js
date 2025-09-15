import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, default: "" },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
},{timestamps:true});

NoteSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
