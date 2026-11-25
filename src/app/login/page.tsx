"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <main className="min-h-screen grid place-items-center bg-slate-50 p-4">
      <form action={action} className="w-full max-w-sm bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold">Jiffy Hardware</h1>
        <input name="email" type="email" required placeholder="อีเมล" className="w-full border rounded-lg px-3 py-2" />
        <input name="password" type="password" required placeholder="รหัสผ่าน" className="w-full border rounded-lg px-3 py-2" />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button disabled={pending} className="w-full bg-slate-900 text-white rounded-lg py-2 disabled:opacity-50">
          {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
    </main>
  );
}
