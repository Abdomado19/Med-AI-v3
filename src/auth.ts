import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Route",
      credentials: {
        email: { placeholder: "Enter Your Email", type: "email" },
        password: { placeholder: "Enter Your Password", type: "password" },
      },
      async authorize(data) {
        // TODO: Replace with your actual backend API URL
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommerce.routemisr.com";
        const response = await fetch(
          `${API_URL}/api/v1/auth/signin`,
          {
            method: "POST",
            body: JSON.stringify({
              email: data?.email,
              password: data?.password,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        const payload = await response.json();
        if (payload.message==="success") {
          return {
            id: payload.user.email,
            user: payload.user,
            token: payload.token,
          };
        } else {
          throw new Error(payload.message);
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({token, user: userResponse}) {
        if (userResponse) {
          token.user = userResponse.user;
          token.token = userResponse.token;
        }

        return token

    },
    async session({session, token}) {
        if (token) {
          session.user = token.user
          session.token = token.token
        }
        return session

    },

  }
}