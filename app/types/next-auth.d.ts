// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: "student" | "admin";
      usn?: string;
      name?: string;
      branch?: string;        // Added this - students have branch field
      isVerified: boolean;
    };
  }
  
  interface User {
    id: string;
    email: string;
    role: "student" | "admin";
    usn?: string;
    name?: string;
    branch?: string;       
    isVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: "student" | "admin";
    usn?: string;
    name?: string;
    branch?: string;       
    isVerified: boolean;
  }
}