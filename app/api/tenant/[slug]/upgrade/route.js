import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Tenant from "@/models/tenant";
import { getUserFromReq } from "@/lib/auth";
import { cors } from "@/lib/cors";

export async function POST(req, { params }) {
    try {
        await dbConnect();

        const user = await getUserFromReq(req);
        if (!user) {
        return cors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
        }
        if (user.role !== "admin") {
        return cors(NextResponse.json({ error: "Forbidden" }, { status: 403 }));
        }

        const { slug } = params;
        const tenant = await Tenant.findOne({ slug });
        if (!tenant || String(tenant._id) !== String(user.tenantId)) {
        return cors(
            NextResponse.json(
            { error: "Tenant not found or you don't belong to that tenant" },
            { status: 404 }
            )
        );
        }

        tenant.plan = "pro";
        await tenant.save();

        return cors(NextResponse.json({ success: true, plan: "pro" }, { status: 200 }));
    } catch (err) {
        console.error("Upgrade error:", err);
        return cors(NextResponse.json({ error: "Server error" }, { status: 500 }));
    }
}

export async function OPTIONS() {
    return cors(NextResponse.json({}, { status: 200 }));
}
