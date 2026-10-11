import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { registerAction } from "@/lib/actions/auth-actions";
import { getPublicLocale } from "@/lib/i18n/locale";
import { messages } from "@/lib/i18n/messages";

export default async function RegisterPage() {
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
        <h1 className="page-title">{m.createAccount}</h1>
        <p className="lede">{m.support}</p>
        <AuthForm mode="register" locale={locale} action={registerAction} />
      </div>
    </main>
  );
}
