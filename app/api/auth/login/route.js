import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import Tenant from "@/models/tenant";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cors } from "@/lib/auth"; // using your cors helper

// Handle CORS preflight
export async function OPTIONS() {
    return cors(NextResponse.json({}, { status: 200 }));
}

// Handle POST /api/auth/login
export async function POST(request) {
    await dbConnect();

    const { email, password } = await request.json();
    if (!email || !password) {
        return cors(NextResponse.json({ error: "Email and password required" }, { status: 400 }));
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
        return cors(NextResponse.json({ error: "Invalid credentials" }, { status: 401 }));
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        return cors(NextResponse.json({ error: "Invalid credentials" }, { status: 401 }));
    }

    const tenant = await Tenant.findById(user.tenantId).lean();

    const token = signToken({
        userId: String(user._id),
        tenantId: String(user.tenantId),
        role: user.role,
        email: user.email,
    });

    return cors(
        NextResponse.json(
            {
            token,
            user: {
                email: user.email,
                role: user.role,
                tenant: tenant ? tenant.slug : null,
            },
            },
            { status: 200 }
        )
    );
}
