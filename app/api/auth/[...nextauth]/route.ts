// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/libs/mongodb";
import bcrypt from "bcrypt";

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
  debug: true,

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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const client = await clientPromise;
        const db = client.db(process.env.DATABASE);

        const user = await db.collection("users").findOne({
          email: credentials.email,
        });

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
    async signIn({ user, account, profile }) {
      console.log("🔐 Sign in attempt:", { user, provider: account?.provider });

      // For OAuth logins, create/update user in database
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          const client = await clientPromise;
          const db = client.db(process.env.DATABASE);

          const existingUser = await db.collection("users").findOne({
            email: user.email,
          });

          if (!existingUser) {
            // Create new user
            const result = await db.collection("users").insertOne({
              name: user.name,
              email: user.email,
              image: user.image,
              emailVerified: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            user.id = result.insertedId.toString();
            console.log("🆕 Created new OAuth user:", user.id);
          } else {
            user.id = existingUser._id.toString();
            console.log("✅ Found existing user:", user.id);
          }
        } catch (error) {
          console.error("❌ Error in signIn callback:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        console.log("📝 Creating JWT for user:", user.id);
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      console.log("👤 Creating session for token:", token.id);
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      console.log("🔄 Redirect called:", { url, baseUrl });

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

  events: {
    async signIn({ user, account, isNewUser }) {
      console.log("✅ User signed in:", {
        userId: user.id,
        isNewUser,
        provider: account?.provider,
      });
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };