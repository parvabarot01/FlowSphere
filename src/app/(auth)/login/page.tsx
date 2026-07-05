"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { login } from "@/app/(auth)/actions";
import { SubmitButton } from "@/components/submit-button";

export default function LoginPage() {
  const [state, formAction] = useFormState(login, {});

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Log in to FlowSphere</h1>
        <p className="text-sm text-slate-500">Welcome back — enter your details below.</p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <SubmitButton label="Log in" pendingLabel="Logging in..." className="w-full" />
      </form>

      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-slate-900 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
