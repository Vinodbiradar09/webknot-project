import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import Student from "@/app/model/Students";
import Admin from "@/app/model/Admins";
import bcrypt from "bcrypt";
import { connectDB } from "@/app/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" } 
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          return null;
        }

        await connectDB();

        try {
          if (credentials.role === "student") {
          
            const student = await Student.findOne({ email: credentials.email });
            if (!student) return null;

            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              student.password
            );
            if (!isPasswordValid) return null;

            return {
              id: student._id.toString(),
              email: student.email,
              name: student.name,
              role: "student", 
              usn: student.usn,
              branch: student.branch,
              isVerified: student.isVerified,
            };

          } else if (credentials.role === "admin") {
          
            const admin = await Admin.findOne({ email: credentials.email });
            if (!admin) return null;

            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              admin.password
            );
            if (!isPasswordValid) return null;

            return {
              id: admin._id.toString(),
              email: admin.email,
              name: admin.name,
              role: "admin", 
              isVerified: admin.isVerified,
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.usn = (user as any).usn;
        token.branch = (user as any).branch;
        token.isVerified = (user as any).isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role as "student" | "admin",
        usn: token.usn as string | undefined,
        branch: token.branch as string | undefined,
        isVerified: token.isVerified as boolean,
      };
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
