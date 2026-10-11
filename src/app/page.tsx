import Link from "next/link";
import { redirect } from "next/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { auth } from "@/lib/auth";
import { getPublicLocale } from "@/lib/i18n/locale";
import { messages } from "@/lib/i18n/messages";

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/today");
  }

  const locale = await getPublicLocale();
  const m = messages[locale];

  return (
    <main className="landing" lang={locale}>
      <div className="landing-topbar">
        <LocaleSwitcher locale={locale} tone="on-dark" />
      </div>
      <section className="landing-hero">
        <h1 className="landing-brand">{m.brand}</h1>
        <p className="landing-tag">{m.tagline}</p>
        <p className="landing-support">{m.support}</p>
        <div className="landing-ctas">
          <Link className="btn btn-primary" href="/register">
            {m.getStarted}
          </Link>
          <Link className="btn btn-ghost" href="/login">
            {m.signIn}
          </Link>
        </div>
      </section>
    </main>
  );
}
