import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Tenant from "@/models/tenant";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { getUserFromReq } from "@/lib/auth";
import { cors } from "@/lib/cors";

export async function POST(req) {
    try {
        await dbConnect();

        const authUser = await getUserFromReq(req); // needs to accept NextRequest
        if (!authUser) {
            return cors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
        }
        if (authUser.role !== "admin") {
            return cors(NextResponse.json({ error: "Only admin can invite users" }, { status: 403 }));
        }

        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");

        const tenant = await Tenant.findOne({ slug });
        if (!tenant || String(tenant._id) !== String(authUser.tenantId)) {
            return cors(NextResponse.json({ error: "Tenant mismatch" }, { status: 404 }));
        }

        const { email, role = "member", password = "password" } = await req.json();
        if (!email) {
            return cors(NextResponse.json({ error: "email required" }, { status: 400 }));
        }

        const exists = await User.findOne({ email });
        if (exists) {
            return cors(NextResponse.json({ error: "User already exists" }, { status: 409 }));
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, passwordHash, role, tenantId: tenant._id });

        return cors(
            NextResponse.json(
                { email: user.email, role: user.role, tenant: tenant.slug },
                { status: 201 }
            )
        );
    } catch (err) {
        console.error("Invite error:", err);
        return cors(NextResponse.json({ error: "Server error" }, { status: 500 }));
    }
}

export async function OPTIONS() {
    return cors(NextResponse.json({}, { status: 200 }));
}
