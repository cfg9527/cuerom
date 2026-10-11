"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { signIn, signOut } from "@/lib/auth";

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim() || null;
  const locale = String(formData.get("locale") ?? "en") === "zh" ? "zh" : "en";

  if (!email || password.length < 8) {
    return { error: "registerError" as const };
  }

  const db = getDb();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length) {
    return { error: "emailTaken" as const };
  }

  const passwordHash = await hash(password, 10);
  await db.insert(users).values({
    email,
    name,
    passwordHash,
    locale,
    authProviderId: `credentials:${email}`,
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/onboarding",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "registerError" as const };
    }
    throw e;
  }
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/today",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "invalidCredentials" as const };
    }
    throw e;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function deleteAccountAction(formData: FormData) {
  const confirm = String(formData.get("confirm") ?? "");
  if (confirm !== "DELETE") {
    return;
  }
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const db = getDb();
  await db.delete(users).where(eq(users.id, session.user.id));
  await signOut({ redirectTo: "/" });
}
