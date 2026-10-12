import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { loginAction } from "@/lib/actions/auth-actions";
import { getPublicLocale } from "@/lib/i18n/locale";
import { messages } from "@/lib/i18n/messages";

export default async function LoginPage() {
  const locale = await getPublicLocale();
  const m = messages[locale];
  return (
    <main className="shell" lang={locale}>
      <div className="auth-topbar">
        <p className="nav-brand" style={{ margin: 0 }}>
          <Link href="/">{m.brand}</Link>
        </p>
        <LocaleSwitcher locale={locale} tone="on-light" />
      </div>
      <div className="auth-card">
        <h1 className="page-title">{m.signIn}</h1>
        <p className="lede">{m.tagline}</p>
        <AuthForm mode="login" locale={locale} action={loginAction} />
      </div>
    </main>
  );
}
