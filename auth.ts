import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "./app/lib/prisma";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "./auth.config";
import { CredentialsSignin } from "next-auth";

class UnverifiedEmailError extends CredentialsSignin {
  code = "Email not verified. Please check your inbox for the verification link.";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
           console.log("LOGIN ATTEMPT", credentials?.email, "- Zod validation failed");
           return null;
        }

        const { email, password } = parsedCredentials.data;
        console.log("LOGIN ATTEMPT", email);
        
        const user = await prisma.user.findUnique({ where: { email } });
        console.log("USER FOUND", !!user);
        
        if (!user) {
          return null;
        }
        
        // console.log("EMAIL VERIFIED", user.emailVerified);
        
        // Temporarily bypassed until SMTP email verification is implemented
        // if (!user.emailVerified) {
        //   throw new UnverifiedEmailError();
        // }

        if (!user.password) {
           return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);
        console.log("PASSWORD MATCH", passwordsMatch);
        
        if (passwordsMatch) {
           return user;
        }
        
        return null;
      },
    }),
  ],
});
