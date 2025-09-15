"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tenant, setTenant] = useState(null);

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

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

  async function saveEdit(id) {
    const res = await apiFetch(`/api/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title: editTitle, content: editContent }),
    });
    if (!res.error) {
      setEditingNoteId(null);
      setEditTitle("");
      setEditContent("");
      loadNotes();
    } else {
      alert(res.error);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Notes</h1>

      {/* Upgrade button if free plan */}
      {tenant?.plan === "free" && (
        <div className="flex items-center justify-between bg-yellow-100 p-3 rounded">
          <span>Free plan: upgrade to create unlimited notes.</span>
          <Button className={'cursor-pointer'}
            onClick={() => (window.location.href = `/tenants/${tenant.slug}/upgrade`)}
          >
            Upgrade to Pro
          </Button>
        </div>
      )}

      {/* Add new note form (hidden while editing) */}
      {editingNoteId === null && (
        <div className="space-y-2">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button
            onClick={addNote}
            disabled={tenant?.plan === "free" && notes.length >= 3}
            className={'cursor-pointer'}
          >
            Add
          </Button>
          {tenant?.plan === "free" && notes.length >= 3 && (
            <p className="text-sm text-red-600 mt-1">
              Free plan limit reached (max 3 notes).
            </p>
          )}
        </div>
      )}

      {/* Notes list */}
      <div className="grid gap-3">
        {notes.map((note) => (
          <Card key={note.id} className="p-4">
            {editingNoteId === note.id ? (
              <div className="space-y-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={() => saveEdit(note.id)}className={'cursor-pointer'}>Save</Button>
                  <Button
                    variant="secondary"
                    className={'cursor-pointer'}
                    onClick={() => {
                      setEditingNoteId(null);
                      setEditTitle("");
                      setEditContent("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold">{note.title}</h2>
                  <p className="text-sm">{note.content}</p>
                </div>
                {editingNoteId === null && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className={'cursor-pointer'}
                      onClick={() => {
                        setEditingNoteId(note.id);
                        setEditTitle(note.title);
                        setEditContent(note.content);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteNote(note.id)}
                      className={'cursor-pointer'}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
