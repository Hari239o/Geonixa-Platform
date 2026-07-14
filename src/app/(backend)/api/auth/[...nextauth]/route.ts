import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"


import { NextAuthOptions } from "next-auth"

// Force environment variables to prevent Vercel Server Error
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = "y8/m1T7v0+W2q5L9zX6R4bN3kE8cQ5aJ";
}

const globalAny: any = global;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Phone-OTP",
      credentials: {
        phoneNumber: { label: "Phone Number", type: "text" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.phoneNumber || !credentials?.otp) {
          return null
        }

        // Clean phone number to match the format used in send-otp/route.ts
        let cleanPhone = credentials.phoneNumber.replace(/\D/g, '');
        if (!cleanPhone.startsWith('91')) {
          cleanPhone = '91' + cleanPhone;
        }
        const formattedPhone = '+' + cleanPhone;

        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: formattedPhone },
              { email: credentials.phoneNumber }
            ]
          }
        });

        if (!user) {
          throw new Error("You don't have an account, go to signup");
        }

        if (user.password) {
          const bcrypt = require('bcryptjs');
          const isValid = await bcrypt.compare(credentials.otp, user.password);
          if (!isValid) {
            throw new Error("Invalid password");
          }
          return {
            id: user.id,
            name: user.name || "Kalinq User",
            email: user.email || `${formattedPhone.replace('+', '')}@kalinq.auth`,
          };
        }

        // Verify OTP from global store for OTP based login
        const store = globalAny.otpStore;
        if (store) {
          const storedData = store.get(formattedPhone);
          if (storedData && storedData.otp === credentials.otp && storedData.expiresAt > Date.now()) {
              store.delete(formattedPhone);
              return {
                id: user.id,
                name: user.name || "Kalinq User",
                email: user.email || `${formattedPhone.replace('+', '')}@kalinq.auth`,
                role: user.role,
                profileCompleted: user.profileCompleted
              }
          }
        }

        // Mock setup fallback
        if (credentials.otp === "1234" || credentials.otp === "123456") {
           return {
             id: user.id,
             name: user.name || "Kalinq User",
             email: user.email || `${formattedPhone.replace('+', '')}@kalinq.auth`,
             role: user.role,
             profileCompleted: user.profileCompleted
           }
        }

        return null
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET || "y8/m1T7v0+W2q5L9zX6R4bN3kE8cQ5aJ",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days persistent login
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {

    async signIn({ user, account }) {
      try {
        // Automatically save Google users to the database
        if (account?.provider === 'google' && user.email) {
          const existingUser = await prisma.user.findFirst({ where: { email: user.email } });
          
          let roleToAssign = "user";
          let hasSignupCookie = false;
          try {
            const cookieStore = await cookies();
            const savedRole = cookieStore.get("signupRole")?.value;
            if (savedRole === "brand" || savedRole === "partner" || savedRole === "creator") {
              roleToAssign = savedRole;
              hasSignupCookie = true;
            }
          } catch (e) {
            console.error("Could not read cookies:", e);
          }

          if (!existingUser) {
            if (hasSignupCookie) {
              await prisma.user.create({
                data: {
                  email: user.email,
                  name: user.name || "Google User",
                  role: roleToAssign
                }
              });
            } else {
              throw new Error("You don't have an account, go to signup");
            }
          } else {
            // If they already exist, but they are coming from a signup page 
            // update their role to their new choice
            if (hasSignupCookie && existingUser.role !== roleToAssign) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { 
                  role: roleToAssign,
                  profileCompleted: false
                }
              });
            }
          }
        }
        return true;
      } catch (error: any) {
        console.error("SignIn Error:", error);
        return `/auth/login?error=${encodeURIComponent(error.message || "Unknown Database Error")}`;
      }
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.profileCompleted = (user as any).profileCompleted;
      }
      
      // Allow updating session
      if (trigger === "update" && session) {
        if (session.role) token.role = session.role;
        if (session.profileCompleted !== undefined) token.profileCompleted = session.profileCompleted;
      }
      return token;
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          let dbUser = null;
          if (session.user.email && !session.user.email.endsWith('@kalinq.auth')) {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            dbUser = await prisma.user.findFirst({ where: { email: session.user.email }});
          } else if (token.id) {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            dbUser = await prisma.user.findFirst({ where: { id: token.id as string }});
          }
          
          if (dbUser) {
            (session.user as any).id = dbUser.id;
            (session.user as any).role = dbUser.role;
            (session.user as any).phone = dbUser.phone;
            (session.user as any).profileCompleted = dbUser.profileCompleted;
            (session.user as any).credits = dbUser.credits;
          } else {
            (session.user as any).id = token.id;
            (session.user as any).role = token.role;
            (session.user as any).profileCompleted = token.profileCompleted;
          }
        }
      } catch (error: any) {
        console.error("Session Error:", error);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
