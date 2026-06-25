import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

const globalAny: any = global;

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Email-OTP",
      credentials: {
        email: { label: "Email", type: "text" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) {
          return null
        }

        // Verify OTP from global store
        const store = globalAny.otpStore;
        if (store) {
          const storedData = store.get(credentials.email.toLowerCase());
          if (storedData) {
            // Check if OTP matches and is not expired
            if (storedData.otp === credentials.otp && storedData.expiresAt > Date.now()) {
              // Valid! Remove it from store so it can't be reused
              store.delete(credentials.email.toLowerCase());
              return {
                id: credentials.email,
                name: "Kalinq User",
                email: credentials.email,
                image: "https://github.com/shadcn.png"
              }
            }
          }
        }

        return null
      }
    })
  ],
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
