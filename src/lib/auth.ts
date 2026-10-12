import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const db = getDb();
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        if (!user?.passwordHash) return null;

        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          locale: user.locale,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth: session, request }) {
      const path = request.nextUrl.pathname;
      const isProtected =
        path.startsWith("/today") ||
        path.startsWith("/habits") ||
        path.startsWith("/environments") ||
        path.startsWith("/settings") ||
        path.startsWith("/review") ||
        path.startsWith("/templates") ||
        path.startsWith("/onboarding");
      if (isProtected) return !!session?.user;
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.locale = (user as { locale?: string }).locale ?? "en";
      }
      if (trigger === "update" && session?.locale) {
        token.locale = session.locale;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.locale = (token.locale as string) ?? "en";
      }
      return session;
    },
  },
});
