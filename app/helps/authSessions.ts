import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/options";

export async function requireAuth(allowedRoles?: ("student" | "admin")[]) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error("Authentication required");
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    throw new Error(`Access denied. Required role: ${allowedRoles.join(" or ")}`);
  }

  return session;
}

export async function requireStudent() {
  return await requireAuth(["student"]);
}

export async function requireAdmin() {
  return await requireAuth(["admin"]);
}