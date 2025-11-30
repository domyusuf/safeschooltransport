import { signIn, signUp, signOut } from "@/lib/auth-client";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { useCallback } from "react";
import { useRouter } from "@tanstack/react-router";

export type UserRole = "parent" | "driver" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
}

/**
 * Custom hook for authentication
 * Reads pre-loaded session from route context (no loading state needed!)
 */
export function useAuth() {
  const navigate = useNavigate();
  const router = useRouter();

  // Get auth data from route context (loaded in __root.tsx beforeLoad)
  const context = useRouteContext({ from: "__root__" });
  const { user, isAuthenticated } = context.auth;

  const handleSignIn = useCallback(
    async (email: string, password: string) => {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        throw new Error(result.error.message || "Sign in failed");
      }

      // Invalidate router to refetch session in beforeLoad
      await router.invalidate();

      // Navigate based on role
      const userRole =
        (result.data?.user as { role?: UserRole })?.role ?? "parent";
      switch (userRole) {
        case "admin":
          navigate({ to: "/admin" });
          break;
        case "driver":
          navigate({ to: "/driver/dashboard" });
          break;
        default:
          navigate({ to: "/dashboard" });
      }

      return result;
    },
    [navigate, router]
  );

  const handleSignUp = useCallback(
    async (data: {
      email: string;
      password: string;
      name: string;
      role?: UserRole;
    }) => {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        // @ts-expect-error - role is defined in additionalFields but may not be in the type
        role: data.role ?? "parent",
      });

      if (result.error) {
        throw new Error(result.error.message || "Sign up failed");
      }

      // Invalidate router to refetch session
      await router.invalidate();

      // Navigate to appropriate dashboard
      switch (data.role) {
        case "admin":
          navigate({ to: "/admin" });
          break;
        case "driver":
          navigate({ to: "/driver/dashboard" });
          break;
        default:
          navigate({ to: "/dashboard" });
      }

      return result;
    },
    [navigate, router]
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
    // Invalidate router to clear session
    await router.invalidate();
    navigate({ to: "/" });
  }, [navigate, router]);

  return {
    user,
    isAuthenticated,
    // No loading state - data is pre-loaded!
    isLoading: false,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };
}
