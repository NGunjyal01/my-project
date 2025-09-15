import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import Tenant from "@/models/tenant";
import { signToken, cors } from "@/lib/auth";

// Handle CORS preflight
export async function OPTIONS() {
    return cors(NextResponse.json({}, { status: 200 }));
}

// Handle POST /api/auth/register
export async function POST(req) {
      try {
        const { email, password, tenantSlug } = await req.json();
        if (!email || !password || !tenantSlug) {
            return cors(NextResponse.json({ error: "All fields required" }, { status: 400 }));
        }

        await dbConnect();

        // Find or create tenant
        let tenant = await Tenant.findOne({ slug: tenantSlug });
        if (!tenant) {
            tenant = await Tenant.create({ name: name || tenantSlug, slug: tenantSlug, plan: "free" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return cors(NextResponse.json({ error: "User already exists" }, { status: 400 }));
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user (first user of tenant = admin)
        const user = await User.create({
            email,
            passwordHash: hashedPassword,
            role: "admin",
            tenantId: tenant._id,
        });

        // Create JWT
        const token = signToken({
            userId: String(user._id),
            tenantId: String(user.tenantId),
            role: user.role,
            email: user.email,
        });

        return cors(
            NextResponse.json(
                {
                message: "User registered",
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    tenant: tenant.slug,
                },
                },
                { status: 201 }
            )
        );
    } catch (err) {
        console.error("Register error:", err);
        return cors(NextResponse.json({ error: "Server error" }, { status: 500 }));
    }
}
