import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  Home,
  Calendar,
  MapPin,
  Bell,
  User,
  Bus,
  AlertTriangle,
  LayoutDashboard,
  Route,
  LogOut,
  Menu,
  X,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export type UserRole = "parent" | "driver" | "admin" | "guest";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface AppLayoutProps {
  children: React.ReactNode;
  role?: UserRole;
}

const parentNavItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
  { label: "Book", href: "/book", icon: <Calendar className="w-5 h-5" /> },
  { label: "Rides", href: "/rides", icon: <MapPin className="w-5 h-5" /> },
  {
    label: "Alerts",
    href: "/notifications",
    icon: <Bell className="w-5 h-5" />,
  },
  { label: "Profile", href: "/profile", icon: <User className="w-5 h-5" /> },
];

const driverNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/driver/dashboard",
    icon: <Home className="w-5 h-5" />,
  },
  {
    label: "Incidents",
    href: "/driver/incidents",
    icon: <AlertTriangle className="w-5 h-5" />,
  },
];

const adminNavItems: NavItem[] = [
  {
    label: "Overview",
    href: "/admin",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: "Live Map",
    href: "/admin/live-map",
    icon: <MapPin className="w-5 h-5" />,
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    label: "Routes",
    href: "/admin/routes",
    icon: <Route className="w-5 h-5" />,
  },
  { label: "Fleet", href: "/admin/fleet", icon: <Bus className="w-5 h-5" /> },
];

// Mock user data - in real app this would come from auth context
const mockUsers = {
  parent: { name: "Sarah Johnson", email: "sarah@example.com", avatar: "" },
  driver: { name: "Michael Driver", email: "michael@example.com", avatar: "" },
  admin: { name: "Admin User", email: "admin@example.com", avatar: "" },
};

export function AppLayout({ children, role = "guest" }: AppLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();

  // Determine role from session first, then URL path
  const effectiveRole: UserRole = user?.role
    ? user.role
    : role !== "guest"
    ? role
    : location.pathname.startsWith("/admin")
    ? "admin"
    : location.pathname.startsWith("/driver")
    ? "driver"
    : location.pathname.startsWith("/dashboard") ||
      location.pathname.startsWith("/book") ||
      location.pathname.startsWith("/rides") ||
      location.pathname.startsWith("/notifications") ||
      location.pathname.startsWith("/profile")
    ? "parent"
    : "guest";

  const navItems =
    effectiveRole === "admin"
      ? adminNavItems
      : effectiveRole === "driver"
      ? driverNavItems
      : effectiveRole === "parent"
      ? parentNavItems
      : [];

  // Use real user data if authenticated, fallback to mock for demo
  const currentUser = user
    ? { name: user.name, email: user.email, avatar: user.image || "" }
    : mockUsers[effectiveRole as keyof typeof mockUsers];

  const handleSignOut = async () => {
    await signOut();
  };

  // Guest/public pages (landing, auth)
  if (effectiveRole === "guest") {
    return <>{children}</>;
  }

  // Admin uses sidebar layout
  if (effectiveRole === "admin") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gray-900 text-white hidden lg:block">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
              <Bus className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold">Glidee Admin</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    location.pathname === item.href
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User */}
            <div className="px-4 py-4 border-t border-gray-800">
              <div className="flex items-center gap-3 px-4 py-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={currentUser?.avatar} />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {currentUser?.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {currentUser?.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {currentUser?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-2 mt-2 text-gray-400 hover:text-white transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Bus className="w-6 h-6 text-blue-400" />
              <span className="font-bold">Glidee Admin</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-gray-800"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </header>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <aside
          className={cn(
            "lg:hidden fixed left-0 top-0 z-50 h-screen w-64 bg-gray-900 text-white transform transition-transform duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col pt-16">
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    location.pathname === item.href
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">{children}</main>
      </div>
    );
  }

  // Parent/Driver uses bottom tab bar (mobile-first)
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Bus className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-gray-900">Glidee</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/notifications" className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                3
              </span>
            </Link>
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback className="bg-blue-600 text-white text-xs">
                {currentUser?.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-16">{children}</main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/dashboard" &&
                item.href !== "/driver/dashboard" &&
                location.pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 min-w-16 transition-colors",
                  isActive ? "text-blue-600" : "text-gray-500"
                )}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
