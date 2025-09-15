import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import Tenant from "@/models/tenant";

export async function POST(req) {
    try {
        const { name, email, password, tenantSlug } = await req.json();
        if (!name || !email || !password || !tenantSlug) {
            return NextResponse.json({ error: "All fields required" }, { status: 400 });
        }

        await dbConnect();

        let tenant = await Tenant.findOne({ slug: tenantSlug });
        if (!tenant) {
            tenant = await Tenant.create({ name, slug: tenantSlug, plan: "free" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            passwordHash: hashedPassword,
            role: "admin", // first signup -> admin
            tenantId: tenant._id,
        });

        return NextResponse.json(
            { message: "User registered", user: { id: user._id, email: user.email, tenant: tenant.slug } },
            { status: 201 }
        );
    } catch (err) {
        console.error("Register error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
