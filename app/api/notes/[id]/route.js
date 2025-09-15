import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Note from "@/models/note";
import { getUserFromReq } from "@/lib/auth";
import { cors } from "@/lib/cors";

// ✅ PUT /api/notes/[id] → update note
export async function PUT(req, { params }) {
    await dbConnect();
    const authUser = await getUserFromReq(req);
    if (!authUser) {
        return cors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }

    const { id } = params;
    const { title, content } = await req.json();

    const note = await Note.findOne({ _id: id, tenantId: authUser.tenantId });
    if (!note) {
        return cors(NextResponse.json({ error: "Note not found" }, { status: 404 }));
    }

    if (title) note.title = title;
    if (content !== undefined) note.content = content;
    await note.save();

    return cors(
        NextResponse.json(
        { id: note._id, title: note.title, content: note.content },
        { status: 200 }
        )
    );
    }

// ✅ DELETE /api/notes/[id] → delete note
export async function DELETE(req, { params }) {
    await dbConnect();
    const authUser = await getUserFromReq(req);
    if (!authUser) {
        return cors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }

    const { id } = params;
    const note = await Note.findOneAndDelete({
        _id: id,
        tenantId: authUser.tenantId,
    });

    if (!note) {
        return cors(NextResponse.json({ error: "Note not found" }, { status: 404 }));
    }

    return cors(NextResponse.json({ success: true }, { status: 200 }));
    }

// Handle preflight
export async function OPTIONS() {
    return cors(NextResponse.json({}, { status: 200 }));
}
