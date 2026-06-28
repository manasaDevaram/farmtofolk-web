"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { LeafDivider, LeafMark, Seedling } from "@/components/assets/FarmToFolkAssets";
import { authApi } from "@/lib/admin-api";
import { saveSession } from "@/lib/auth-session";

export function LoginView() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const session = await authApi.login(emailOrPhone.trim(), password);
      saveSession(session);
      router.push(session.user.role === "FARMER" ? "/farmer" : "/admin");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ftf-paper min-h-screen p-4 sm:p-8 lg:grid lg:place-items-center">
      <section className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[28px] border border-[var(--ftf-border)] bg-[var(--ftf-paper-light)] shadow-[0_24px_70px_rgba(65,49,29,0.16)] sm:min-h-[760px] lg:grid-cols-[1.12fr_0.88fr]">
        <div className="relative hidden overflow-hidden bg-[linear-gradient(150deg,#315335_0%,#527044_45%,#bd8f4b_100%)] lg:block">
          <div className="absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(110deg,transparent_0,transparent_18px,rgba(255,255,255,.28)_19px,transparent_20px)]" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(180deg,transparent,rgba(33,54,32,.28))]" />
          <div className="relative flex h-full flex-col justify-end p-12 text-white">
            <Seedling className="mb-7 h-20 w-20 opacity-90" />
            <p className="ftf-display text-5xl leading-tight">From honest soil<br />to every table.</p>
            <p className="mt-5 max-w-md text-lg leading-8 text-white/80">A transparent ledger for farmers, farms, harvests, and the people who trust them.</p>
          </div>
        </div>

        <div className="relative flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 text-[var(--ftf-green-900)]">
              <LeafMark className="h-12 w-12" />
              <div>
                <p className="ftf-display text-3xl font-bold">FarmToFolk</p>
                <p className="text-xs font-semibold tracking-wide text-[var(--ftf-muted)]">Traceable. Transparent. Trusted.</p>
              </div>
            </div>

            <div className="mt-12">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--ftf-green-700)]">Welcome back</p>
              <h1 className="mt-2 text-4xl font-bold text-[var(--ftf-text)]">Sign in to your account</h1>
              <p className="mt-3 text-[var(--ftf-muted)]">Manage the journey from farm records to public trace.</p>
            </div>

            <form className="mt-9 space-y-5" onSubmit={submit}>
              <label className="block">
                <span className="text-sm font-bold">Email or phone</span>
                <input
                  autoComplete="username"
                  className="ftf-focus mt-2 min-h-12 w-full rounded-[var(--ftf-radius-input)] border border-[var(--ftf-border)] bg-white/75 px-4 outline-none"
                  onChange={(event) => setEmailOrPhone(event.target.value)}
                  placeholder="admin@farmtofolk.in"
                  required
                  value={emailOrPhone}
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold">Password</span>
                <div className="relative mt-2">
                  <input
                    autoComplete="current-password"
                    className="ftf-focus min-h-12 w-full rounded-[var(--ftf-radius-input)] border border-[var(--ftf-border)] bg-white/75 px-4 pr-16 outline-none"
                    minLength={8}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                  />
                  <button className="ftf-focus absolute inset-y-0 right-3 text-sm font-bold text-[var(--ftf-green-700)]" onClick={() => setShowPassword((value) => !value)} type="button">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">{error}</p> : null}

              <button className="ftf-focus min-h-12 w-full rounded-[var(--ftf-radius-input)] bg-[var(--ftf-green-900)] px-5 font-bold text-white transition hover:bg-[var(--ftf-green-700)] disabled:cursor-wait disabled:opacity-60" disabled={loading} type="submit">
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-10"><LeafDivider /></div>
            <p className="mt-5 text-center text-sm italic text-[var(--ftf-muted)]">Growing trust. Nourishing futures.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
