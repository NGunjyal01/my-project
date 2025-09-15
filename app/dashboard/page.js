"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tenant, setTenant] = useState(null);

    async function loadNotes() {
        const notesRes = await apiFetch("/api/notes");
        if (!notesRes.error) setNotes(Array.isArray(notesRes) ? notesRes : []);
        else console.error(notesRes.error);

        const tenantRes = await apiFetch("/api/tenant/me");
        if (!tenantRes.error) setTenant(tenantRes);
    }

    async function addNote() {
        const res = await apiFetch("/api/notes", {
            method: "POST",
            body: JSON.stringify({ title, content }),
        });
        if (res.error) alert(res.error);
        else {
            setTitle("");
            setContent("");
            loadNotes();
        }
    }

    async function deleteNote(id) {
        const res = await apiFetch(`/api/notes/${id}`, { method: "DELETE" });
        if (!res.error) loadNotes();
        else alert(res.error);
    }

    useEffect(() => {
        loadNotes();
    }, []);

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">Notes</h1>

            {tenant?.plan === "free" && notes.length >= 3 && (
                <div className="bg-yellow-100 p-3 rounded">
                    Free plan limit reached!{" "}
                    <a href={`/tenants/${tenant.slug}/upgrade`} className="underline">
                        Upgrade to Pro
                    </a>
                </div>
            )}

            <div className="flex gap-2">
                <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Input placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
                <Button onClick={addNote}>Add</Button>
            </div>

            <div className="grid gap-3">
                {notes.map((note) => (
                    <Card key={note.id} className="p-4 flex justify-between">
                        <div>
                            <h2 className="font-semibold">{note.title}</h2>
                            <p className="text-sm">{note.content}</p>
                        </div>
                        <Button variant="destructive" onClick={() => deleteNote(note.id)}>
                            Delete
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
}
