// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { isValidEmail, normalizeEmail } from "@/libs/authValidation";
import clientPromise from "@/libs/mongodb";
import bcrypt from "bcrypt";

const isDevelopment = process.env.NODE_ENV === "development";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id: string;
    };
  }

  interface User {
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  debug: isDevelopment,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (typeof credentials?.email !== "string" || typeof credentials?.password !== "string") {
          throw new Error("Invalid credentials");
        }

        const email = normalizeEmail(credentials.email);
        if (!isValidEmail(email)) {
          throw new Error("Invalid credentials");
        }

        const client = await clientPromise;
        const db = client.db(process.env.DATABASE);

        const user = await db.collection("users").findOne(
          { email },
          { collation: { locale: "en", strength: 2 } }
        );

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user._id.toString(),
          email: user.email!,
          name: user.name!,
        };
      },
    }),
  ],

  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
    newUser: "/dashboard",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account }) {
      // For OAuth logins, create/update user in database
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          if (typeof user.email !== "string") {
            return false;
          }

          const email = normalizeEmail(user.email);
          if (!isValidEmail(email)) {
            return false;
          }

          const client = await clientPromise;
          const db = client.db(process.env.DATABASE);

          const existingUser = await db.collection("users").findOne(
            { email },
            { collation: { locale: "en", strength: 2 } }
          );

          if (!existingUser) {
            // Create new user
            const result = await db.collection("users").insertOne({
              name: user.name,
              email,
              image: user.image,
              emailVerified: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            user.id = result.insertedId.toString();
          } else {
            user.id = existingUser._id.toString();

            if (existingUser.email !== email) {
              await db.collection("users").updateOne(
                { _id: existingUser._id },
                { $set: { email, updatedAt: new Date() } }
              );
            }
          }

          user.email = email;
        } catch (error) {
          console.error(
            "OAuth sign-in callback failed:",
            isDevelopment && error instanceof Error ? error.message : "Internal error"
          );
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.includes("/signout") || url.includes("/logout")) {
        return `${baseUrl}/auth/login`;
      }

      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return `${baseUrl}/dashboard`;
    },
  },

};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
