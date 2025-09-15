import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Tenant from "@/models/tenant";
import { getUserFromReq } from "@/lib/auth";
import { cors } from "@/lib/cors";

export async function GET(req) {
    try {
        await dbConnect();

        const user = await getUserFromReq(req);
        if (!user) {
        return cors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
        }

        const tenant = await Tenant.findById(user.tenantId).lean();
        if (!tenant) {
        return cors(NextResponse.json({ error: "Tenant not found" }, { status: 404 }));
        }

        return cors(
        NextResponse.json(
            {
            slug: tenant.slug,
            name: tenant.name,
            plan: tenant.plan,
            user: { email: user.email, role: user.role },
            },
            { status: 200 }
        )
        );
    } catch (err) {
        console.error("Tenant me error:", err);
        return cors(NextResponse.json({ error: "Server error" }, { status: 500 }));
    }
}

export async function OPTIONS() {
    return cors(NextResponse.json({}, { status: 200 }));
}
