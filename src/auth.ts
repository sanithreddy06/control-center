import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { createAdminClient } from "@/lib/supabase/client";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/validators";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const supabase = createAdminClient();

        const { data: user, error } = await supabase
          .from("users")
          .select("id, email, name, password_hash, role, theme")
          .eq("email", email.toLowerCase())
          .single();

        if (error || !user) return null;

        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as "user" | "admin",
          theme: user.theme as "light" | "dark" | "system",
        };
      },
    }),
  ],
});
