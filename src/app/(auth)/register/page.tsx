import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { registerAction } from "@/lib/actions/auth-actions";
import { messages } from "@/lib/i18n/messages";

export default function RegisterPage() {
  const m = messages.en;
  return (
    <main className="shell">
      <p className="nav-brand" style={{ marginBottom: "1.5rem" }}>
        <Link href="/">{m.brand}</Link>
      </p>
      <div className="auth-card">
        <h1 className="page-title">{m.createAccount}</h1>
        <p className="lede">{m.support}</p>
        <AuthForm mode="register" locale="en" action={registerAction} />
      </div>
    </main>
  );
}
