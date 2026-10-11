import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { loginAction } from "@/lib/actions/auth-actions";
import { messages } from "@/lib/i18n/messages";

export default function LoginPage() {
  const m = messages.en;
  return (
    <main className="shell">
      <p className="nav-brand" style={{ marginBottom: "1.5rem" }}>
        <Link href="/">{m.brand}</Link>
      </p>
      <div className="auth-card">
        <h1 className="page-title">{m.signIn}</h1>
        <p className="lede">{m.tagline}</p>
        <AuthForm mode="login" locale="en" action={loginAction} />
      </div>
    </main>
  );
}
