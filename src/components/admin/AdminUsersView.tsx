"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { adminUserApi } from "@/lib/admin-api";
import { getSessionUser } from "@/lib/auth-session";
import { formatUserRole } from "@/lib/user-role";
import type {
  CreateInternalUserRequest,
  InternalUserResponse,
  InternalUserRole,
  UserRole,
  UpdateInternalUserRequest,
} from "@/types/admin";
import {
  AdminShell,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  PageHeader,
  StatusBadge,
  inputClass,
} from "./AdminPrimitives";

type Editor =
  { mode: "create"; role: InternalUserRole } | { mode: "edit"; user: InternalUserResponse };

export function AdminUsersView() {
  const currentUser = getSessionUser();
  const [users, setUsers] = useState<InternalUserResponse[]>([]);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const filteredUsers = users.filter(
    (user) => roleFilter === "ALL" || user.role === roleFilter,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await adminUserApi.list());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => void load(), [load]);

  async function act(operation: () => Promise<unknown>) {
    setActionError("");
    try {
      await operation();
      await load();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Could not update user.");
    }
  }

  return (
    <AdminShell>
      <PageHeader
        title="Users"
        description="View users by role and manage administrator or field-officer access."
        actions={
          <>
            <Button onClick={() => setEditor({ mode: "create", role: "ADMIN" })}>Add Admin</Button>
            <Button
              variant="secondary"
              onClick={() => setEditor({ mode: "create", role: "FIELD_OFFICER" })}
            >
              Add Field Officer
            </Button>
          </>
        }
      />
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter users by role">
        {(
          [
            ["ALL", "All Users"],
            ["ADMIN", "Admins"],
            ["FIELD_OFFICER", "Field Officers"],
            ["FARMER", "Farmers"],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            onClick={() => setRoleFilter(value)}
            variant={roleFilter === value ? "primary" : "secondary"}
          >
            {label} (
            {value === "ALL"
              ? users.length
              : users.filter((user) => user.role === value).length}
            )
          </Button>
        ))}
      </div>
      {editor ? (
        <UserEditor
          editor={editor}
          onCancel={() => setEditor(null)}
          onSaved={async () => {
            setEditor(null);
            await load();
          }}
        />
      ) : null}
      {loading ? <LoadingState label="Loading users..." /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {actionError ? (
        <div className="mb-4">
          <ErrorState message={actionError} />
        </div>
      ) : null}
      {!loading && !error && !filteredUsers.length ? (
        <EmptyState message="No users match this role filter." />
      ) : null}
      {!loading && !error && filteredUsers.length ? (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-[var(--ftf-border)] bg-[var(--ftf-sage)]/35">
              <tr>
                {["Name", "Email", "Phone", "Role", "Status", "Actions"].map((heading) => (
                  <th className="p-4 font-bold" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ftf-border)]">
              {filteredUsers.map((user) => {
                const isCurrentUser = user.id === currentUser?.id;
                return (
                  <tr key={user.id}>
                    <td className="p-4 font-bold">
                      {user.name}{" "}
                      {isCurrentUser ? (
                        <span className="text-[var(--ftf-muted)]">(You)</span>
                      ) : null}
                    </td>
                    <td className="p-4">{user.email ?? "Not available"}</td>
                    <td className="p-4">{user.phone || "Not available"}</td>
                    <td className="p-4">{formatUserRole(user.role)}</td>
                    <td className="p-4">
                      <StatusBadge active={user.active} />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {user.role === "FARMER" ? (
                          <span className="text-xs font-bold text-[var(--ftf-muted)]">
                            Managed from Farmers
                          </span>
                        ) : (
                          <>
                            <Button
                              variant="secondary"
                              onClick={() => setEditor({ mode: "edit", user })}
                            >
                              Edit
                            </Button>
                            <Button
                              disabled={isCurrentUser}
                              variant="secondary"
                              onClick={() =>
                                void act(() =>
                                  adminUserApi.updateRole(user.id, {
                                    role: user.role === "ADMIN" ? "FIELD_OFFICER" : "ADMIN",
                                  }),
                                )
                              }
                            >
                              Make {user.role === "ADMIN" ? "Field Officer" : "Admin"}
                            </Button>
                            <Button
                              disabled={isCurrentUser}
                              variant={user.active ? "danger" : "primary"}
                              onClick={() =>
                                void act(() =>
                                  adminUserApi.updateStatus(user.id, { active: !user.active }),
                                )
                              }
                            >
                              {user.active ? "Deactivate" : "Activate"}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : null}
    </AdminShell>
  );
}

function UserEditor({
  editor,
  onCancel,
  onSaved,
}: {
  editor: Editor;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const existing = editor.mode === "edit" ? editor.user : null;
  const [name, setName] = useState(existing?.name ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !phone.trim() || (!existing && !password)) {
      setError("Please fill all required user fields.");
      return;
    }
    setSaving(true);
    try {
      if (editor.mode === "edit") {
        const payload: UpdateInternalUserRequest = {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        };
        await adminUserApi.update(editor.user.id, payload);
      } else {
        const payload: CreateInternalUserRequest = {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role: editor.role,
          initialPassword: password,
        };
        await adminUserApi.create(payload);
      }
      await onSaved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save user.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mb-5">
      <form onSubmit={submit}>
        <h2 className="text-xl font-bold">
          {existing
            ? "Edit user"
            : `Add ${editor.mode === "create" && editor.role === "FIELD_OFFICER" ? "Field Officer" : "Admin"}`}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Name" required>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email" required>
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Phone" required>
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          {!existing ? (
            <Field label="Initial password" required>
              <input
                className={inputClass}
                minLength={8}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
          ) : null}
        </div>
        {error ? <p className="mt-3 text-sm font-bold text-red-700">{error}</p> : null}
        <div className="mt-5 flex gap-2">
          <Button disabled={saving} type="submit">
            {saving ? "Saving..." : "Save user"}
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
