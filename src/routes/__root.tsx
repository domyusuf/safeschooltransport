import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import { AppLayout } from "@/components/layout";
import { getSession } from "@/lib/auth-client";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

export type UserRole = "parent" | "driver" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
}

interface MyRouterContext {
  queryClient: QueryClient;
  auth: {
    user: AuthUser | null;
    isAuthenticated: boolean;
  };
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  // Load session data before rendering protected routes only
  beforeLoad: async ({ location }) => {
    // Skip auth check for public routes - they handle it client-side
    const publicPaths = ["/", "/auth/login", "/auth/register"];
    const isPublicRoute = publicPaths.some(
      (path) => location.pathname === path
    );

    if (isPublicRoute) {
      return {
        auth: {
          user: null,
          isAuthenticated: false,
        },
      };
    }

    // Fetch session for protected routes
    try {
      const session = await getSession();
      const user: AuthUser | null = session.data?.user
        ? {
            id: session.data.user.id,
            name: session.data.user.name,
            email: session.data.user.email,
            role: (session.data.user as { role?: UserRole }).role ?? "parent",
            image: session.data.user.image,
          }
        : null;

      return {
        auth: {
          user,
          isAuthenticated: !!user,
        },
      };
    } catch {
      return {
        auth: {
          user: null,
          isAuthenticated: false,
        },
      };
    }
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Glidee - Safe School Transport",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootComponent,
  shellComponent: RootDocument,
});

function RootComponent() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        {children}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
