import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUsersCollection } from "@/utils/mongodb";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials", // tack tis any name
      credentials: {
        //feild take from user
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const users = await getUsersCollection();
        const user = await users.findOne({ email: credentials.email }); //chack is user
        if (!user) {
          throw new Error("No user found");
          //throw new Error("user or password is invalid");
        }
        const isValid = await bcrypt.compare(
          //chack pass is compare
          credentials.password,
          user.password
        );
        if (!isValid) {
          throw new Error("Invalid password");
          //throw new Error("user or password is invalid");
        }
        return {
          // return values
          id: user._id.toString(),
          email: user.email,
          name: user.firstName + " " + user.lastName,
          // role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt", // save data in session JSON Web Tokens
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
