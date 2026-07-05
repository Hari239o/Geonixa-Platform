import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

// Force environment variables to prevent Vercel Server Error
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = "y8/m1T7v0+W2q5L9zX6R4bN3kE8cQ5aJ";
}
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = "https://kalinq.vercel.app";
}

const globalAny: any = global;

const handler = NextAuth({
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

        // TEMPORARY BYPASS FOR DEVELOPMENT
        if (credentials.otp === "1234" || credentials.otp === "123456") {
           // Auto-save to database!
           let dbUser = await prisma.user.findUnique({ where: { phone: formattedPhone } });
           if (!dbUser) {
             dbUser = await prisma.user.create({ data: { phone: formattedPhone, role: "user" } });
           }
           return {
             id: dbUser.id,
             name: "Kalinq User",
             email: `${formattedPhone.replace('+', '')}@kalinq.auth`,
           }
        }

        // Verify OTP from global store
        const store = globalAny.otpStore;
        if (store) {
          const storedData = store.get(formattedPhone);
          if (storedData && storedData.otp === credentials.otp && storedData.expiresAt > Date.now()) {
              store.delete(formattedPhone);
              
              // Auto-save to database!
              let dbUser = await prisma.user.findUnique({ where: { phone: formattedPhone } });
              if (!dbUser) {
                dbUser = await prisma.user.create({ data: { phone: formattedPhone, role: "user" } });
              }

              return {
                id: dbUser.id,
                name: "Kalinq User",
                email: `${formattedPhone.replace('+', '')}@kalinq.auth`,
              }
          }
        }
        return null
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET || "y8/m1T7v0+W2q5L9zX6R4bN3kE8cQ5aJ",
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const signupRole = cookieStore.get("signupRole")?.value || "user";

      // Automatically save Google users to the database
      if (account?.provider === 'google' && user.email) {
        const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "Google User",
              role: signupRole
            }
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        let dbUser = null;
        if (session.user.email && !session.user.email.endsWith('@kalinq.auth')) {
          dbUser = await prisma.user.findUnique({ where: { email: session.user.email }});
        } else if (token.id) {
          dbUser = await prisma.user.findUnique({ where: { id: token.id as string }});
        }
        
        if (dbUser) {
          (session.user as any).id = dbUser.id;
          (session.user as any).role = dbUser.role;
          (session.user as any).phone = dbUser.phone;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  }
})

export { handler as GET, handler as POST }
