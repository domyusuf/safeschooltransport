import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import type { UserRole } from "@/db/schema";

// Server function to get current session
export const getServerSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const request = getRequest();
    if (!request) return null;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    return session;
  }
);

// Server function to require authentication
export const requireAuth = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getServerSession();

    if (!session?.user) {
      throw new Error("Unauthorized: Please sign in");
    }

    return session;
  }
);

// Helper to check if user has required role
export const checkRole = (
  userRole: UserRole | undefined,
  allowedRoles: UserRole[]
): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

// Route protection configuration
export const routeProtection: Record<string, UserRole[]> = {
  "/admin": ["admin"],
  "/driver": ["driver"],
  "/dashboard": ["parent"],
  "/book": ["parent"],
  "/rides": ["parent"],
  "/notifications": ["parent"],
  "/profile": ["parent", "driver", "admin"],
};

// Get required roles for a path
export const getRequiredRoles = (pathname: string): UserRole[] | null => {
  for (const [path, roles] of Object.entries(routeProtection)) {
    if (pathname.startsWith(path)) {
      return roles;
    }
  }
  return null; // Public route
};
