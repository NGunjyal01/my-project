import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { cors } from "@/lib/cors";

export async function GET() {
    try {
        await dbConnect();
        return cors(NextResponse.json({ status: "ok" }, { status: 200 }));
    } catch (err) {
        console.error("Health check failed:", err);
        return cors(NextResponse.json({ status: "error" }, { status: 500 }));
    }
}

export async function OPTIONS() {
    return cors(NextResponse.json({}, { status: 200 }));
}
