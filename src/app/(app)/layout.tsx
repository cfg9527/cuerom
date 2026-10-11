import { redirect } from "next/navigation";
import { AppNav } from "@/components/nav";
import { auth } from "@/lib/auth";
import { getUserLocale } from "@/lib/session";
import type { Locale } from "@/lib/i18n/messages";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const locale = (await getUserLocale(session.user.id)) as Locale;

  return (
    <div className="shell">
      <AppNav locale={locale} />
      {children}
    </div>
  );
}
