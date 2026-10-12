"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Locale, MessageKey } from "@/lib/i18n/messages";
import { messages } from "@/lib/i18n/messages";

type Mode = "login" | "register";

type Props = {
  mode: Mode;
  locale: Locale;
  action: (formData: FormData) => Promise<{ error: MessageKey } | void>;
};

export function AuthForm({ mode, locale, action }: Props) {
  const m = messages[locale];
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="auth-form"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await action(fd);
          if (result?.error) {
            setError(m[result.error] ?? m.registerError);
          }
        });
      }}
    >
      {mode === "register" ? (
        <label>
          <span>{m.name}</span>
          <input name="name" type="text" autoComplete="name" />
        </label>
      ) : null}
      <label>
        <span>{m.email}</span>
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        <span>{m.password}</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </label>
      <input type="hidden" name="locale" value={locale} />
      {error ? <p className="form-error">{error}</p> : null}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {mode === "login" ? m.signIn : m.createAccount}
      </button>
      <p className="auth-switch">
        {mode === "login" ? (
          <>
            {m.needAccount} <Link href="/register">{m.createAccount}</Link>
          </>
        ) : (
          <>
            {m.alreadyHaveAccount} <Link href="/login">{m.signIn}</Link>
          </>
        )}
      </p>
    </form>
  );
}
