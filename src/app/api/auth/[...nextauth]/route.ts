import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

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

        // Verify OTP from global store
        const store = globalAny.otpStore;
        
        // TEMPORARY BYPASS FOR DEVELOPMENT
        if (credentials.otp === "1234" || credentials.otp === "123456") {
          return {
            id: formattedPhone,
            name: "Kalinq User",
            email: `${formattedPhone.replace('+', '')}@kalinq.auth`,
            image: "https://github.com/shadcn.png"
          }
        }

        if (store) {
          const storedData = store.get(formattedPhone);
          if (storedData) {
            // Check if OTP matches and is not expired
            if (storedData.otp === credentials.otp && storedData.expiresAt > Date.now()) {
              // Valid! Remove it from store so it can't be reused
              store.delete(formattedPhone);
              return {
                id: formattedPhone,
                name: "Kalinq User",
                email: `${formattedPhone.replace('+', '')}@kalinq.auth`,
                image: "https://github.com/shadcn.png"
              }
            }
          }
        }

        return null
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET || "y8/m1T7v0+W2q5L9zX6R4bN3kE8cQ5aJ",
  pages: {
    signIn: "/auth/login", // Redirect back to our custom login page on error
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  }
})

export { handler as GET, handler as POST }
