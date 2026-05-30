import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isPublicRoute = ["/login", "/offline"].includes(pathname);
      const isApiAuth = pathname.startsWith("/api/auth");
      const isApiTrack = pathname === "/api/analytics/track";
      const isApiHealth = pathname === "/api/health";

      if (isApiAuth || isApiTrack || isApiHealth) return true;
      if (pathname === "/login" && isLoggedIn) return Response.redirect(new URL("/dashboard", request.nextUrl));
      if (!isLoggedIn && !isPublicRoute) return false;
      if (pathname === "/analytics" && auth?.user?.role !== "admin") {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.theme = user.theme;
      }
      if (trigger === "update" && session?.theme) {
        token.theme = session.theme;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "user" | "admin";
        session.user.theme = token.theme as "light" | "dark" | "system";
      }
      return session;
    },
  },
  providers: [],
  trustHost: true,
};
