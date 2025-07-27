"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dumbbell,
  LayoutDashboard,
  Calendar,
  Users,
  User,
  Settings,
  LogOut,
  Brain,
  ListChecks,
  MessageSquare,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  Award,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { useEffect, useState } from "react";

export function AppSidebar({ inSheet = false }: { inSheet?: boolean }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { expanded, setExpanded } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768 && !inSheet) {
        setExpanded(false);
      }
    };
    
    // Set initial value
    checkIfMobile();
    
    // Add event listener
    window.addEventListener("resize", checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, [setExpanded, inSheet]);

  const isAdmin = user?.role === "admin";

  // Toggle sidebar
  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  // If in Sheet, force expanded to true
  useEffect(() => {
    if (inSheet) {
      setExpanded(true);
    }
  }, [inSheet, setExpanded]);

  return (
    <>
      <Sidebar className="border-r border-border/40 bg-background/80 backdrop-blur-xl h-full">
        <SidebarHeader className="pb-1">
          <div className="flex items-center justify-between px-3 pt-3">
            <BlurFade delay={0} direction="right">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1 rounded-md">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                {expanded && <span className="text-xl font-bold">FitHub</span>}
              </div>
            </BlurFade>
            {!inSheet && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleSidebar}
                  className="h-8 w-8 hidden md:flex hover:bg-muted" 
                >
                  {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleSidebar}
                  className="h-8 w-8 md:hidden hover:bg-muted" 
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="px-3">
          {!isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <BlurFade delay={0.05} direction="right">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/dashboard"}
                        tooltip="Dashboard"
                        className="hover:bg-primary/10 data-[active=true]:bg-primary/15 transition-all"
                      >
                        <Link href="/dashboard">
                          <LayoutDashboard className="h-5 w-5" />
                          <span>Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </BlurFade>

                  <BlurFade delay={0.1} direction="right">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith("/dashboard/gyms")}
                        tooltip="Gyms"
                        className="hover:bg-primary/10 data-[active=true]:bg-primary/15 transition-all"
                      >
                        <Link href="/dashboard/gyms">
                          <Dumbbell className="h-5 w-5" />
                          <span>Gyms</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </BlurFade>

                  <BlurFade delay={0.15} direction="right">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith("/dashboard/bookings")}
                        tooltip="Bookings"
                        className="hover:bg-primary/10 data-[active=true]:bg-primary/15 transition-all"
                      >
                        <Link href="/dashboard/bookings">
                          <Calendar className="h-5 w-5" />
                          <span>Bookings</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </BlurFade>

                  <BlurFade delay={0.2} direction="right">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith("/dashboard/workouts")}
                        tooltip="Workouts"
                        className="hover:bg-primary/10 data-[active=true]:bg-primary/15 transition-all"
                      >
                        <Link href="/dashboard/workouts">
                          <ListChecks className="h-5 w-5" />
                          <span>Workouts</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </BlurFade>

                  <BlurFade delay={0.25} direction="right">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith("/dashboard/community")}
                        tooltip="Community"
                        className="hover:bg-primary/10 data-[active=true]:bg-primary/15 transition-all"
                      >
                        <Link href="/dashboard/community">
                          <MessageSquare className="h-5 w-5" />
                          <span>Community</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </BlurFade>

                  <BlurFade delay={0.3} direction="right">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith("/dashboard/badges")}
                        tooltip="Badges"
                        className="hover:bg-primary/10 data-[active=true]:bg-primary/15 transition-all"
                      >
                        <Link href="/dashboard/badges">
                          <Award className="h-5 w-5" />
                          <span>Badges</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </BlurFade>

                  <BlurFade delay={0.35} direction="right">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith("/dashboard/ai")}
                        tooltip="AI Trainer"
                        className="hover:bg-primary/10 data-[active=true]:bg-primary/15 transition-all"
                      >
                        <Link href="/dashboard/ai">
                          <Brain className="h-5 w-5" />
                          <span>AI Trainer</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </BlurFade>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <BlurFade delay={0.05} direction="right">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/dashboard/admin"}
                        tooltip="Admin Dashboard"
                        className="hover:bg-primary/10 data-[active=true]:bg-primary/15 transition-all"
                      >
                        <Link href="/dashboard/admin">
                          <ShieldCheck className="h-5 w-5" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </BlurFade>

                  <BlurFade delay={0.1} direction="right">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith("/dashboard/admin/users")}
                        tooltip="Manage Users"
                        className="hover:bg-primary/10 data-[active=true]:bg-primary/15 transition-all"
                      >
                        <Link href="/dashboard/admin/users">
                          <Users className="h-5 w-5" />
                          <span>Manage Users</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </BlurFade>

                  <BlurFade delay={0.15} direction="right">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith("/dashboard/admin/gyms")}
                        tooltip="Manage Gyms"
                        className="hover:bg-primary/10 data-[active=true]:bg-primary/15 transition-all"
                      >
                        <Link href="/dashboard/admin/gyms">
                          <Dumbbell className="h-5 w-5" />
                          <span>Manage Gyms</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </BlurFade>

                  <BlurFade delay={0.2} direction="right">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(
                          "/dashboard/admin/bookings"
                        )}
                        tooltip="Manage Bookings"
                        className="hover:bg-primary/10 data-[active=true]:bg-primary/15 transition-all"
                      >
                        <Link href="/dashboard/admin/bookings">
                          <Calendar className="h-5 w-5" />
                          <span>Manage Bookings</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </BlurFade>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter>
          <div className="px-3 py-2">
            {expanded ? (
              <BlurFade delay={0.1} direction="right">
                <div className="flex items-center gap-3">
                  <Avatar className="border border-border/40">
                    <AvatarImage src={user?.profilePicture} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium line-clamp-1">
                      {user?.name}
                    </span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </BlurFade>
            ) : (
              <div className="flex justify-center">
                <BlurFade delay={0.1} direction="right">
                  <Avatar className="border border-border/40">
                    <AvatarImage src={user?.profilePicture} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </BlurFade>
              </div>
            )}
          </div>

          <SidebarSeparator />

          <SidebarMenu>
            <BlurFade delay={0.2} direction="right">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="py-1 hover:bg-primary/10 transition-all">
                  <div className="py-1">
                    <span>Toggle Theme</span>
                    <ModeToggle />
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </BlurFade>

            {/* <BlurFade delay={0.25} direction="right">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/profile"}
                  tooltip="Profile"
                  className="hover:bg-primary/10 data-[active=true]:bg-primary/15 transition-all"
                >
                  <Link href="/dashboard/profile">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </BlurFade>

            <BlurFade delay={0.3} direction="right">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/settings"}
                  tooltip="Settings"
                  className="hover:bg-primary/10 data-[active=true]:bg-primary/15 transition-all"
                >
                  <Link href="/dashboard/settings">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </BlurFade> */}

            <BlurFade delay={0.35} direction="right">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Logout" 
                  onClick={logout}
                  className="hover:bg-red-500/10 transition-all text-red-500"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </BlurFade>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </>
  );
}
