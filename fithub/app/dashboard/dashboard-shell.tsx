"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Loader2,
  Menu,
  Dumbbell,
  LayoutDashboard,
  Calendar,
  ListChecks,
  MessageSquare,
  Brain,
  User,
  Settings,
  LogOut,
  Award,
} from "lucide-react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";

// Navigation links data to avoid repetition
const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/dashboard/gyms", label: "Gyms", icon: Dumbbell },
  { href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
  { href: "/dashboard/workouts", label: "Workouts", icon: ListChecks },
  { href: "/dashboard/community", label: "Community", icon: MessageSquare },
  { href: "/dashboard/ai", label: "AI Trainer", icon: Brain },
];

const ACCOUNT_ITEMS = [
  { href: "/dashboard/profile", label: "Profile", icon: User, exact: true },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    exact: true,
  },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const checkIfMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Close sheet when pathname changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Set initial value
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, [checkIfMobile]);

  useEffect(() => {
    if (!isLoading) {
      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      // Redirect admin to admin dashboard if they're on the main dashboard
      if (user?.role === "admin" && pathname === "/dashboard") {
        router.push("/dashboard/admin");
        return;
      }

      // Redirect non-admin users away from admin pages
      if (user?.role !== "admin" && pathname.startsWith("/dashboard/admin")) {
        router.push("/dashboard");
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Render nav item with proper active state
  const renderNavItem = (item: (typeof NAV_ITEMS)[0]) => {
    const isActive = item.exact
      ? pathname === item.href
      : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          isActive ? "bg-primary/15 text-primary" : "hover:bg-primary/10"
        )}
        onClick={() => setIsSidebarOpen(false)}
      >
        <item.icon className="h-5 w-5" />
        <span>{item.label}</span>
      </Link>
    );
  };

  // Desktop layout
  if (!isMobile) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <ScrollProgress />
            <main className="flex-1 p-6 overflow-auto">
              <BlurFade direction="up" delay={0} startOnView={false}>
                {children}
              </BlurFade>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Mobile layout with Sheet component
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 sm:max-w-[300px] flex flex-col"
            >
              <SheetHeader className="p-4 pb-2 border-b border-border/40">
                <SheetTitle className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-md">
                    <Dumbbell className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-xl font-bold">FitHub</span>
                </SheetTitle>
              </SheetHeader>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Navigation Links */}
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                    Navigation
                  </h4>
                  {NAV_ITEMS.map(renderNavItem)}
                </div>

                <div className="mt-6 pt-6 border-t border-border/40">
                  {/* User Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="border border-border/40 h-9 w-9">
                        <AvatarImage src={user?.profilePicture} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium line-clamp-1">
                          {user?.name || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {user?.email || "user@example.com"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Links */}
                  <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                    Account
                  </h4>
                  <div className="space-y-1">
                    {ACCOUNT_ITEMS.map(renderNavItem)}

                    <Button
                      variant="ghost"
                      className="w-full justify-start px-3 py-2 text-sm hover:bg-red-500/10 text-red-500"
                      onClick={() => {
                        setIsSidebarOpen(false);
                        logout();
                      }}
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      <span>Logout</span>
                    </Button>

                    <div className="py-2 mt-4 flex items-center">
                      <span className="text-sm font-medium pr-2">Theme</span>
                      <ModeToggle />
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex-1 flex items-center">
            <div className="p-1 rounded-md">
              <BlurFade delay={0} direction="right">
                <div className="flex items-center gap-1">
                  <div className="p-1 rounded-md">
                    <Dumbbell className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xl font-bold">FitHub</span>
                </div>
              </BlurFade>
            </div>
          </div>
        </header>
        <div className="flex-1 flex flex-col">
          <ScrollProgress />
          <main className="flex-1 p-4 overflow-auto w-full">
            <BlurFade direction="up" delay={0} startOnView={false}>
              {children}
            </BlurFade>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
