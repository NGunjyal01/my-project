import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Note from "@/models/note";
import { getUserFromReq } from "@/lib/auth";
import { cors } from "@/lib/cors";

// ✅ GET /api/notes → list notes for tenant
export async function GET(req) {
    await dbConnect();
    const authUser = await getUserFromReq(req);
    if (!authUser) {
        return cors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }

    const notes = await Note.find({ tenantId: authUser.tenantId })
        .sort({ createdAt: -1 })
        .lean();

    return cors(
        NextResponse.json(
        notes.map((n) => ({
            id: n._id,
            title: n.title,
            content: n.content,
            createdBy: n.createdBy,
            createdAt: n.createdAt,
        })),
        { status: 200 }
        )
    );
    }

    // ✅ POST /api/notes → create note
export async function POST(req) {
    await dbConnect();
    const authUser = await getUserFromReq(req);
    if (!authUser) {
        return cors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }

    const { title, content } = await req.json();
    if (!title) {
        return cors(NextResponse.json({ error: "Title required" }, { status: 400 }));
    }

    const note = await Note.create({
        title,
        content: content || "",
        tenantId: authUser.tenantId,
        createdBy: authUser.userId,
    });

    return cors(
        NextResponse.json(
        {
            id: note._id,
            title: note.title,
            content: note.content,
            createdBy: note.createdBy,
            createdAt: note.createdAt,
        },
        { status: 201 }
        )
    );
}

// Handle preflight
export async function OPTIONS() {
    return cors(NextResponse.json({}, { status: 200 }));
}
