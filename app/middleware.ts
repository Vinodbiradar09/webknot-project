// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Allow public routes
    const publicPaths = [
      "/",
      "/auth/login",
      "/auth/signup/student", 
      "/auth/signup/admin",
    ];

    const isPublic =
      publicPaths.some((p) => pathname.startsWith(p)) ||
      pathname.startsWith("/verify");

    if (isPublic) return NextResponse.next();

    // Force unverified users to verification page
    if (!token?.isVerified) {
      if (token?.role === "student" && token.usn) {
        return NextResponse.redirect(
          new URL(`/verify/${token.usn}`, req.url)
        );
      }
      if (token?.role === "admin" && token.id) {
        return NextResponse.redirect(
          new URL(`/verify/admin/${token.id}`, req.url)
        );
      }
    }

    // Handle API routes with JSON responses
    if (pathname.startsWith("/api/")) {
      // Student API protection
      if (pathname.startsWith("/api/students") && token?.role !== "student") {
        return NextResponse.json(
          { error: "Unauthorized - Students only" },
          { status: 403 }
        );
      }
      
      // Admin API protection  
      if ((pathname.startsWith("/api/admins") || 
           pathname.startsWith("/api/admin")) && 
          token?.role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized - Admins only" },
          { status: 403 }
        );
      }
      
      return NextResponse.next();
    }

    // Student-only page routes (redirect for pages)
    if (
      (pathname.startsWith("/dashboard") ||
        pathname.startsWith("/events") ||
        pathname.startsWith("/my-events") ||
        pathname.startsWith("/profile")) &&
      token?.role !== "student"
    ) {
      return NextResponse.redirect(
        new URL("/auth/login?error=unauthorized", req.url)
      );
    }

    // Admin-only page routes (redirect for pages)
    if (pathname.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(
        new URL("/auth/login?error=unauthorized", req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};