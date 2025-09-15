import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import Tenant from "@/models/tenant";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { setCorsHeaders } from "@/lib/cors";

export default async function handler(req, res) {
    setCorsHeaders(res);
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    await dbConnect();
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const tenant = await Tenant.findById(user.tenantId).lean();

    const token = signToken({
        userId: String(user._id),
        tenantId: String(user.tenantId),
        role: user.role,
        email: user.email
    });

    return res.status(200).json({
        token,
        user: { email: user.email, role: user.role, tenant: tenant ? tenant.slug : null }
    });
}
