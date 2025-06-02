"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchUsers, fetchGyms, fetchUserBookings } from "@/lib/api";
import {
  Dumbbell,
  Calendar,
  Users,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGyms: 0,
    totalBookings: 0,
    pendingBookings: 0,
  });

  useEffect(() => {
    // Redirect if user is not admin
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }

    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch users
        const usersResponse = await fetchUsers();
        const users = usersResponse.data.data;

        // Fetch gyms
        const gymsResponse = await fetchGyms();
        const gyms = gymsResponse.data.data || [];

        // Fetch bookings
        const bookingsResponse = await fetchUserBookings();
        const bookings = bookingsResponse.data.data || [];

        // Calculate stats
        setStats({
          totalUsers: users.length,
          totalGyms: gyms.length,
          totalBookings: bookings.length,
          pendingBookings: bookings.filter(
            (booking: any) => booking.status === "pending"
          ).length,
        });
      } catch (error) {
        console.error("Error loading admin dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === "admin") {
      loadDashboardData();
    }
  }, [user, router]);

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Manage your FitHub application
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={
            isLoading ? <Skeleton className="h-8 w-16" /> : stats.totalUsers
          }
          icon={<Users className="h-5 w-5" />}
          description="Registered accounts"
          linkHref="/dashboard/admin/users"
          linkText="Manage Users"
        />
        <StatCard
          title="Total Gyms"
          value={
            isLoading ? <Skeleton className="h-8 w-16" /> : stats.totalGyms
          }
          icon={<Dumbbell className="h-5 w-5" />}
          description="Available facilities"
          linkHref="/dashboard/admin/gyms"
          linkText="Manage Gyms"
        />
        <StatCard
          title="Total Bookings"
          value={
            isLoading ? <Skeleton className="h-8 w-16" /> : stats.totalBookings
          }
          icon={<Calendar className="h-5 w-5" />}
          description="All time"
          linkHref="/dashboard/admin/bookings"
          linkText="View Bookings"
        />
        <StatCard
          title="Pending Bookings"
          value={
            isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              stats.pendingBookings
            )
          }
          icon={<Calendar className="h-5 w-5" />}
          description="Require approval"
          linkHref="/dashboard/admin/bookings?status=pending"
          linkText="View Pending"
          highlight={stats.pendingBookings > 0}
        />
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="gyms">Gyms</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="posts">Community Posts</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>
                View and manage all registered users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-2">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 border rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-3 w-24 mt-1" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Click the button below to manage users.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push("/dashboard/admin/users")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="gyms">
          <Card>
            <CardHeader>
              <CardTitle>Gyms Management</CardTitle>
              <CardDescription>
                Add, edit, or remove gym facilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-2">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 border rounded-md"
                      >
                        <div>
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-72 mt-1" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Click the button below to manage gyms.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push("/dashboard/admin/gyms")}
                  >
                    <Dumbbell className="mr-2 h-4 w-4" />
                    Manage Gyms
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Bookings Management</CardTitle>
              <CardDescription>
                View and manage all gym bookings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-2">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 border rounded-md"
                      >
                        <div>
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-72 mt-1" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Click the button below to manage bookings.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push("/dashboard/admin/bookings")}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Manage Bookings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Community Posts Management</CardTitle>
              <CardDescription>
                Moderate community posts and comments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-2">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 border rounded-md"
                      >
                        <div>
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-72 mt-1" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Click the button below to manage posts.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push("/dashboard/admin/posts")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Manage Posts
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  linkHref,
  linkText,
  highlight = false,
}: {
  title: string;
  value: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  linkHref?: string;
  linkText?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary" : ""}>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {title}
            </span>
            <div
              className={`bg-primary/10 p-2 rounded-full ${
                highlight ? "bg-primary/20" : ""
              }`}
            >
              {icon}
            </div>
          </div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
          {linkHref && (
            <Button variant="link" className="p-0 h-auto" asChild>
              <a href={linkHref}>{linkText}</a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
