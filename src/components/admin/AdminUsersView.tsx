"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { adminUserApi } from "@/lib/admin-api";
import type { CreateInternalUserRequest, InternalUserResponse, InternalUserRole, UpdateInternalUserRequest } from "@/types/admin";
import { AdminShell, Button, Card, EmptyState, ErrorState, Field, LoadingState, PageHeader, StatusBadge, inputClass } from "./AdminPrimitives";

type Editor = { mode: "create"; role: InternalUserRole } | { mode: "edit"; user: InternalUserResponse };

export function AdminUsersView() {
  const [users, setUsers] = useState<InternalUserResponse[]>([]);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setUsers(await adminUserApi.list()); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not load users."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => void load(), [load]);

  async function act(operation: () => Promise<unknown>) {
    setActionError("");
    try { await operation(); await load(); }
    catch (caught) { setActionError(caught instanceof Error ? caught.message : "Could not update user."); }
  }

  return (
    <AdminShell>
      <PageHeader
        title="Internal Users"
        description="Manage administrators and field officers. Farmer onboarding remains separate."
        actions={<><Button onClick={() => setEditor({ mode: "create", role: "ADMIN" })}>Add Admin</Button><Button variant="secondary" onClick={() => setEditor({ mode: "create", role: "FIELD_OFFICER" })}>Add Field Officer</Button></>}
      />
      {editor ? <UserEditor editor={editor} onCancel={() => setEditor(null)} onSaved={async () => { setEditor(null); await load(); }} /> : null}
      {loading ? <LoadingState label="Loading internal users..." /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {actionError ? <div className="mb-4"><ErrorState message={actionError} /></div> : null}
      {!loading && !error && !users.length ? <EmptyState message="No internal users have been added yet." /> : null}
      {!loading && !error && users.length ? (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-[var(--ftf-border)] bg-[var(--ftf-sage)]/35"><tr>{["Name", "Email", "Phone", "Role", "Status", "Actions"].map((heading) => <th className="p-4 font-bold" key={heading}>{heading}</th>)}</tr></thead>
            <tbody className="divide-y divide-[var(--ftf-border)]">
              {users.map((user) => <tr key={user.id}>
                <td className="p-4 font-bold">{user.name}</td><td className="p-4">{user.email || "—"}</td><td className="p-4">{user.phone || "—"}</td><td className="p-4">{user.role === "FIELD_OFFICER" ? "Field Officer" : "Admin"}</td><td className="p-4"><StatusBadge active={user.active} /></td>
                <td className="p-4"><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setEditor({ mode: "edit", user })}>Edit</Button><Button variant="secondary" onClick={() => void act(() => adminUserApi.updateRole(user.id, { role: user.role === "ADMIN" ? "FIELD_OFFICER" : "ADMIN" }))}>Make {user.role === "ADMIN" ? "Field Officer" : "Admin"}</Button><Button variant={user.active ? "danger" : "primary"} onClick={() => void act(() => adminUserApi.updateStatus(user.id, { active: !user.active }))}>{user.active ? "Deactivate" : "Activate"}</Button></div></td>
              </tr>)}
            </tbody>
          </table>
        </Card>
      ) : null}
    </AdminShell>
  );
}

function UserEditor({ editor, onCancel, onSaved }: { editor: Editor; onCancel: () => void; onSaved: () => Promise<void> }) {
  const existing = editor.mode === "edit" ? editor.user : null;
  const [name, setName] = useState(existing?.name ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (!name.trim() || !email.trim() || !phone.trim() || (!existing && !password)) { setError("Please fill all required user fields."); return; }
    setSaving(true);
    try {
      if (existing) {
        const payload: UpdateInternalUserRequest = { name: name.trim(), email: email.trim(), phone: phone.trim() };
        await adminUserApi.update(existing.id, payload);
      } else {
        const payload: CreateInternalUserRequest = { name: name.trim(), email: email.trim(), phone: phone.trim(), role: editor.mode === "create" ? editor.role : "ADMIN", initialPassword: password };
        await adminUserApi.create(payload);
      }
      await onSaved();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save user."); }
    finally { setSaving(false); }
  }

  return <Card className="mb-5"><form onSubmit={submit}><h2 className="text-xl font-bold">{existing ? "Edit user" : `Add ${editor.mode === "create" && editor.role === "FIELD_OFFICER" ? "Field Officer" : "Admin"}`}</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Name" required><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} /></Field><Field label="Email" required><input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field><Field label="Phone" required><input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>{!existing ? <Field label="Initial password" required><input className={inputClass} minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field> : null}</div>{error ? <p className="mt-3 text-sm font-bold text-red-700">{error}</p> : null}<div className="mt-5 flex gap-2"><Button disabled={saving} type="submit">{saving ? "Saving..." : "Save user"}</Button><Button variant="secondary" onClick={onCancel}>Cancel</Button></div></form></Card>;
}
