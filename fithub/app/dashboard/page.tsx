"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dumbbell,
  Calendar,
  TrendingUp,
  Activity,
  Sparkles,
  Plus,
  Target,
  Timer,
  Award,
  TrendingUp as TrendingUpIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import {
  fetchUserWorkouts,
  fetchUserBookings,
  getUserProfileSummary,
  getWorkoutSuggestions,
} from "@/lib/api";
import { WorkoutList } from "@/components/workout-list";
import { BookingList } from "@/components/booking-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Workout, Booking } from "@/types";
import { useRouter } from "next/navigation";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import ReactMarkdown from "react-markdown";
import { WorkoutSuggestionDialog } from "./workouts/new/workout-suggestion-dialog";
import { ExerciseSuggestionDialog } from "./workouts/new/exercise-suggestion-dialog";
import { toast } from "sonner";
import type { Metadata } from "next";
import { MagicButton } from "@/components/ui/magic-button";
import {
  MagicCard,
  MagicCardHeader,
  MagicCardContent,
} from "@/components/ui/magic-card";
import { BlurFade } from "@/components/magicui/blur-fade";

interface WorkoutSuggestion {
  title: string;
  description: string;
  duration: number;
  exercises: Array<{
    name: string;
    sets: Array<{
      reps: number;
      weight?: number;
      type: string;
      notes?: string;
    }>;
    notes?: string;
  }>;
  notes?: string;
}

interface ProfileStats {
  totalWorkouts: number;
  totalDuration: number;
  avgDuration: number;
  topExercises: Array<{
    name: string;
    count: number;
    avgWeight: number | null;
  }>;
  fitnessScore: number;
  consistencyScore: number;
  progressScore: number;
  weeklyStats: Array<{
    week: string;
    workouts: number;
    duration: number;
    exercises: number;
  }>;
  monthlyStats: Array<{
    month: string;
    workouts: number;
    duration: number;
    exercises: number;
  }>;
  exerciseDistribution: Record<
    string,
    {
      count: number;
      totalSets: number;
      totalReps: number;
      totalWeight: number;
    }
  >;
  workoutTrends: {
    increasing: string[];
    decreasing: string[];
    stable: string[];
  };
  fitnessStyles: {
    calisthenics: number;
    bodybuilding: number;
    powerlifting: number;
    endurance: number;
    flexibility: number;
    hiit: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalBookings: 0,
    streakDays: 0,
    totalExercises: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [profileSummary, setProfileSummary] = useState<string>("");
  const [workoutSuggestion, setWorkoutSuggestion] =
    useState<WorkoutSuggestion | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(true);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch user workouts
        const workoutsResponse = await fetchUserWorkouts();
        setRecentWorkouts(workoutsResponse.data.data.slice(0, 5));

        // Fetch user bookings
        const bookingsResponse = await fetchUserBookings();
        const allBookings = bookingsResponse.data.data;
        const upcomingBookings = allBookings.filter(
          (booking: Booking) => new Date(booking.date) > new Date()
        );
        setUpcomingBookings(upcomingBookings.slice(0, 5));

        // Calculate stats
        setStats({
          totalWorkouts: workoutsResponse.data.data.length,
          totalBookings: upcomingBookings.length,
          streakDays: calculateWorkoutStreak(workoutsResponse.data.data),
          totalExercises: calculateTotalExercises(workoutsResponse.data.data),
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const loadAIData = async () => {
      setIsLoadingSummary(true);
      setIsLoadingSuggestion(true);
      try {
        // Fetch profile summary from AI
        const summaryResponse = await getUserProfileSummary();
        if (summaryResponse.data?.data?.summary) {
          setProfileSummary(summaryResponse.data.data.summary);
        }
        if (summaryResponse.data?.data?.stats) {
          setProfileStats(summaryResponse.data.data.stats);
        }
        setIsLoadingSummary(false);

        // Fetch workout suggestions from AI
        const suggestionParams = {
          fitnessLevel: "intermediate",
          focus: "general",
          duration: 45,
          workoutDay: "Monday",
        };

        const suggestionResponse = await getWorkoutSuggestions(
          suggestionParams.fitnessLevel,
          suggestionParams.focus,
          suggestionParams.duration,
          suggestionParams.workoutDay
        );
        if (suggestionResponse.success && suggestionResponse.data?.suggestion) {
          setWorkoutSuggestion(
            suggestionResponse.data.suggestion as WorkoutSuggestion
          );
        }
        setIsLoadingSuggestion(false);
      } catch (error) {
        console.error("Error loading AI data:", error);
        setIsLoadingSummary(false);
        setIsLoadingSuggestion(false);
      }
    };

    if (user) {
      loadDashboardData();
      loadAIData();
    }
  }, [user]);

  const calculateWorkoutStreak = (workouts: Workout[]) => {
    if (!workouts || workouts.length === 0) return 0;

    // Sort workouts by date in descending order
    const sortedWorkouts = [...workouts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    let currentDate = new Date(sortedWorkouts[0].date);

    // Helper function to check if two dates are consecutive
    const isConsecutiveDay = (date1: Date, date2: Date) => {
      const diffTime = Math.abs(date1.getTime() - date2.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays === 1;
    };

    // Helper function to check if a date is today or yesterday
    const isRecentDate = (date: Date) => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      return (
        date.toDateString() === today.toDateString() ||
        date.toDateString() === yesterday.toDateString()
      );
    };

    // Check if the most recent workout was today or yesterday
    if (!isRecentDate(currentDate)) {
      return 0; // Streak broken if most recent workout wasn't today or yesterday
    }

    streak = 1;

    // Calculate consecutive days
    for (let i = 1; i < sortedWorkouts.length; i++) {
      const nextDate = new Date(sortedWorkouts[i].date);

      if (isConsecutiveDay(currentDate, nextDate)) {
        streak++;
        currentDate = nextDate;
      } else {
        break; // Streak broken
      }
    }

    return streak;
  };

  const calculateTotalExercises = (workouts: Workout[]) => {
    return workouts.reduce(
      (total: number, workout: Workout) =>
        total + (workout.exercises?.length || 0),
      0
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <BlurFade delay={0} direction="up" inView>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || "Fitness Enthusiast"}!
            </p>
          </div>
        </BlurFade>
        <BlurFade delay={0.1} direction="up" inView>
          <div className="flex gap-2">
            <MagicButton
              variant="outline"
              size="sm"
              hoverScale={true}
              onClick={() => router.push("/dashboard/workouts")}
            >
              <Calendar className="mr-2 h-4 w-4" />
              View Workouts
            </MagicButton>
            <MagicButton
              size="sm"
              hoverScale={true}
              onClick={() => router.push("/dashboard/workouts/new")}
            >
              <Dumbbell className="mr-2 h-4 w-4" />
              New Workout
            </MagicButton>
          </div>
        </BlurFade>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BlurFade delay={0.2} direction="up" inView>
          <StatCard
            title="Total Workouts"
            value={stats.totalWorkouts}
            description="All time"
            icon={<Dumbbell className="h-4 w-4 text-muted-foreground" />}
          />
        </BlurFade>
        <BlurFade delay={0.3} direction="up" inView>
          <StatCard
            title="Upcoming Bookings"
            value={stats.totalBookings}
            description="Next 7 days"
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          />
        </BlurFade>
        <BlurFade delay={0.4} direction="up" inView>
          <StatCard
            title="Workout Streak"
            value={stats.streakDays}
            description="Days in a row"
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          />
        </BlurFade>
        <BlurFade delay={0.5} direction="up" inView>
          <StatCard
            title="Total Exercises"
            value={stats.totalExercises}
            description="All time"
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          />
        </BlurFade>
      </div>

      <Tabs defaultValue="overview">
        <BlurFade delay={0.6} direction="up" inView>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>
        </BlurFade>
        <BlurFade delay={0.1} direction="up" inView>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MagicCard hoverEffect="lift" gradient>
                <MagicCardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    Recent Workouts
                  </CardTitle>
                  <CardDescription>
                    Your last 5 workout sessions
                  </CardDescription>
                </MagicCardHeader>
                <MagicCardContent>
                  <WorkoutList
                    workouts={recentWorkouts}
                    isLoading={isLoading}
                  />
                </MagicCardContent>
              </MagicCard>
              <MagicCard hoverEffect="lift" gradient>
                <MagicCardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Bookings
                  </CardTitle>
                  <CardDescription>
                    Your next scheduled gym sessions
                  </CardDescription>
                </MagicCardHeader>
                <MagicCardContent>
                  <BookingList
                    bookings={upcomingBookings}
                    isLoading={isLoading}
                  />
                </MagicCardContent>
              </MagicCard>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MagicCard hoverEffect="glow" gradient>
                <MagicCardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    AI Fitness Summary
                  </CardTitle>
                  <CardDescription>
                    Your personalized fitness profile
                  </CardDescription>
                </MagicCardHeader>
                <MagicCardContent>
                  {isLoadingSummary ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-24" />
                        <Skeleton className="h-24" />
                        <Skeleton className="h-24" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[90%]" />
                        <Skeleton className="h-4 w-[80%]" />
                        <Skeleton className="h-4 w-[85%]" />
                      </div>
                    </div>
                  ) : profileStats ? (
                    <div className="space-y-6">
                      {/* Fitness Scores */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-primary/10 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-primary" />
                            <h4 className="font-medium">Fitness Score</h4>
                          </div>
                          <div className="text-2xl font-bold">
                            {profileStats.fitnessScore}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            / 100
                          </div>
                          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${profileStats.fitnessScore}%` }}
                            />
                          </div>
                        </div>
                        <div className="bg-primary/10 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Timer className="h-4 w-4 text-primary" />
                            <h4 className="font-medium">Consistency</h4>
                          </div>
                          <div className="text-2xl font-bold">
                            {profileStats.consistencyScore}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            / 100
                          </div>
                          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{
                                width: `${profileStats.consistencyScore}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="bg-primary/10 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="h-4 w-4 text-primary" />
                            <h4 className="font-medium">Progress</h4>
                          </div>
                          <div className="text-2xl font-bold">
                            {profileStats.progressScore}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            / 100
                          </div>
                          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{
                                width: `${profileStats.progressScore}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Monthly Progress Chart */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Monthly Progress</h4>
                        <div className="h-full w-full">
                          {profileStats &&
                          profileStats.monthlyStats.length > 0 ? (
                            <ChartContainer
                              config={{
                                workouts: {
                                  label: "Workouts",
                                  color: "hsl(var(--chart-1))",
                                },
                                duration: {
                                  label: "Duration (min)",
                                  color: "hsl(var(--chart-2))",
                                },
                              }}
                            >
                              <div className="w-full h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart
                                    data={profileStats.monthlyStats}
                                    margin={{
                                      top: 20,
                                      right: 30,
                                      left: 20,
                                      bottom: 10,
                                    }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                      dataKey="month"
                                      angle={-45}
                                      textAnchor="end"
                                      height={80}
                                      interval={0}
                                    />
                                    <YAxis yAxisId="left" orientation="left" />
                                    <YAxis
                                      yAxisId="right"
                                      orientation="right"
                                    />
                                    <ChartTooltip
                                      content={<ChartTooltipContent />}
                                    />
                                    <Line
                                      yAxisId="left"
                                      type="monotone"
                                      dataKey="workouts"
                                      name="workouts"
                                      stroke="hsl(var(--chart-1))"
                                      strokeWidth={2}
                                      activeDot={{ r: 8 }}
                                    />
                                    <Line
                                      yAxisId="right"
                                      type="monotone"
                                      dataKey="duration"
                                      name="duration"
                                      stroke="hsl(var(--chart-2))"
                                      strokeWidth={2}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                                <ChartLegend>
                                  <ChartLegendContent />
                                </ChartLegend>
                              </div>
                            </ChartContainer>
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              No monthly data available
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Exercise Distribution</h4>
                        <div className="h-full w-full">
                          {profileStats &&
                          Object.keys(profileStats.exerciseDistribution)
                            .length > 0 ? (
                            <ChartContainer
                              config={{
                                count: {
                                  label: "Times Performed",
                                  color: "hsl(var(--chart-1))",
                                },
                                avgWeight: {
                                  label: "Avg Weight (kg)",
                                  color: "hsl(var(--chart-2))",
                                },
                              }}
                            >
                              <div className="w-full h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={Object.entries(
                                      profileStats.exerciseDistribution
                                    )
                                      .map(([name, data]) => ({
                                        name,
                                        count: data.count,
                                        avgWeight:
                                          data.totalWeight / data.count,
                                      }))
                                      .sort((a, b) => b.count - a.count)
                                      .slice(0, 10)} // Show top 10 exercises
                                    margin={{
                                      top: 20,
                                      right: 30,
                                      left: 20,
                                      bottom: 70,
                                    }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                      dataKey="name"
                                      angle={-45}
                                      textAnchor="end"
                                      height={80}
                                      interval={0}
                                    />
                                    <YAxis yAxisId="left" orientation="left" />
                                    <YAxis
                                      yAxisId="right"
                                      orientation="right"
                                    />
                                    <ChartTooltip
                                      content={<ChartTooltipContent />}
                                    />
                                    <Bar
                                      yAxisId="left"
                                      dataKey="count"
                                      name="count"
                                      fill="hsl(var(--chart-1))"
                                    />
                                    <Line
                                      yAxisId="right"
                                      type="monotone"
                                      dataKey="avgWeight"
                                      name="avgWeight"
                                      stroke="hsl(var(--chart-2))"
                                      strokeWidth={2}
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                                <ChartLegend>
                                  <ChartLegendContent />
                                </ChartLegend>
                              </div>
                            </ChartContainer>
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              No exercise data available
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">FitHub Score</h4>
                        <div className="h-full w-full">
                          {profileStats && profileStats.fitnessStyles ? (
                            <ChartContainer
                              config={{
                                value: {
                                  label: "Score",
                                  color: "hsl(var(--chart-1))",
                                },
                              }}
                            >
                              <div className="w-full h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart
                                    data={[
                                      {
                                        name: "Calisthenics",
                                        value:
                                          profileStats.fitnessStyles
                                            .calisthenics,
                                      },
                                      {
                                        name: "Bodybuilding",
                                        value:
                                          profileStats.fitnessStyles
                                            .bodybuilding,
                                      },
                                      {
                                        name: "Powerlifting",
                                        value:
                                          profileStats.fitnessStyles
                                            .powerlifting,
                                      },
                                      {
                                        name: "Endurance",
                                        value:
                                          profileStats.fitnessStyles.endurance,
                                      },
                                      {
                                        name: "Flexibility",
                                        value:
                                          profileStats.fitnessStyles
                                            .flexibility,
                                      },
                                      {
                                        name: "HIIT",
                                        value: profileStats.fitnessStyles.hiit,
                                      },
                                    ]}
                                    outerRadius={90}
                                    margin={{
                                      top: 20,
                                      right: 30,
                                      left: 20,
                                      bottom: 10,
                                    }}
                                  >
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="name" />
                                    <ChartTooltip
                                      cursor={false}
                                      content={<ChartTooltipContent />}
                                    />
                                    <Radar
                                      name="value"
                                      dataKey="value"
                                      stroke="hsl(var(--chart-1))"
                                      fill="hsl(var(--chart-1))"
                                      fillOpacity={0.6}
                                    />
                                  </RadarChart>
                                </ResponsiveContainer>
                                <ChartLegend>
                                  <ChartLegendContent />
                                </ChartLegend>
                              </div>
                            </ChartContainer>
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              No fitness style data available
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Workout Trends */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Exercise Trends</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <ArrowUpRight className="h-4 w-4 text-green-600" />
                              <h4 className="font-medium text-green-600">
                                Improving
                              </h4>
                            </div>
                            <ul className="space-y-1">
                              {profileStats.workoutTrends.increasing.map(
                                (exercise) => (
                                  <li
                                    key={exercise}
                                    className="text-sm text-green-600"
                                  >
                                    {exercise}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                          <div className="bg-red-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                              <h4 className="font-medium text-red-600">
                                Declining
                              </h4>
                            </div>
                            <ul className="space-y-1">
                              {profileStats.workoutTrends.decreasing.map(
                                (exercise) => (
                                  <li
                                    key={exercise}
                                    className="text-sm text-red-600"
                                  >
                                    {exercise}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Minus className="h-4 w-4 text-blue-600" />
                              <h4 className="font-medium text-blue-600">
                                Stable
                              </h4>
                            </div>
                            <ul className="space-y-1">
                              {profileStats.workoutTrends.stable.map(
                                (exercise) => (
                                  <li
                                    key={exercise}
                                    className="text-sm text-blue-600"
                                  >
                                    {exercise}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">AI Analysis</h4>
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{profileSummary}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">
                        Start logging workouts to get your personalized fitness
                        profile and insights
                      </p>
                      <MagicButton
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        sparkle={true}
                        onClick={() => router.push("/dashboard/workouts/new")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Workout
                      </MagicButton>
                    </div>
                  )}
                </MagicCardContent>
              </MagicCard>
              <MagicCard hoverEffect="glow" gradient>
                <MagicCardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Workout Suggestion
                    </CardTitle>
                    <CardDescription>
                      Personalized workout for you
                    </CardDescription>
                  </div>
                </MagicCardHeader>
                <MagicCardContent>
                  {isLoadingSuggestion ? (
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-[90%]" />
                      <div className="space-y-2 mt-4">
                        <Skeleton className="h-4 w-[60%]" />
                        <Skeleton className="h-4 w-[80%]" />
                        <Skeleton className="h-4 w-[70%]" />
                      </div>
                    </div>
                  ) : workoutSuggestion ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">
                          {workoutSuggestion.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {workoutSuggestion.description}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Exercises</h4>
                          <span className="text-sm text-muted-foreground">
                            {workoutSuggestion.exercises.length} exercises
                          </span>
                        </div>
                        <div className="space-y-4">
                          {workoutSuggestion.exercises.map(
                            (exercise, index) => (
                              <div
                                key={index}
                                className="bg-muted/50 p-4 rounded-lg"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-medium pr-4">
                                    {exercise.name}
                                  </p>
                                  {exercise.notes && (
                                    <span className="text-xs text-muted-foreground">
                                      {exercise.notes}
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {exercise.sets.map((set, setIndex) => (
                                    <div
                                      key={setIndex}
                                      className="bg-background p-2 rounded-md text-sm"
                                    >
                                      <div className="font-medium">
                                        Set {setIndex + 1}
                                      </div>
                                      <div className="text-muted-foreground">
                                        {set.reps} reps
                                        {set.weight && ` • ${set.weight}kg`}
                                        {set.type !== "normal" && (
                                          <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                            {set.type == "normal"
                                              ? "Normal"
                                              : set.type == "warm_up"
                                              ? "Warm up"
                                              : set.type == "drop_set"
                                              ? "Drop set"
                                              : set.type == "failure"
                                              ? "Failure"
                                              : set.type}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {workoutSuggestion.notes && (
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Additional Notes</h4>
                          <p className="text-sm text-muted-foreground">
                            {workoutSuggestion.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <MagicButton
                          variant="outline"
                          className="flex-1"
                          sparkle={true}
                          onClick={() => router.push("/dashboard/ai")}
                        >
                          Generate More
                        </MagicButton>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Sparkles className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">
                        Get personalized workout suggestions based on your
                        fitness goals and history
                      </p>
                      <MagicButton
                        className="w-full"
                        sparkle={true}
                        hoverScale={true}
                        onClick={() => router.push("/dashboard/ai")}
                      >
                        Generate a Workout
                      </MagicButton>
                    </div>
                  )}
                </MagicCardContent>
              </MagicCard>
            </div>
          </TabsContent>
        </BlurFade>
        <BlurFade delay={0.1} direction="up" inView>
          <TabsContent value="workouts">
            <MagicCard hoverEffect="lift" gradient>
              <MagicCardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  Your Workout History
                </CardTitle>
                <CardDescription>Track your progress over time</CardDescription>
              </MagicCardHeader>
              <MagicCardContent>
                <WorkoutList
                  workouts={recentWorkouts}
                  isLoading={isLoading}
                  showAll
                />
              </MagicCardContent>
            </MagicCard>
          </TabsContent>
        </BlurFade>
        <BlurFade delay={0.1} direction="up" inView>
          <TabsContent value="bookings">
            <MagicCard hoverEffect="lift" gradient>
              <MagicCardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Your Gym Bookings
                </CardTitle>
                <CardDescription>
                  Manage your scheduled sessions
                </CardDescription>
              </MagicCardHeader>
              <MagicCardContent>
                <BookingList
                  bookings={upcomingBookings}
                  isLoading={isLoading}
                  showAll
                />
              </MagicCardContent>
            </MagicCard>
          </TabsContent>
        </BlurFade>
      </Tabs>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <MagicCard hoverEffect="glow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">
              {title}
            </span>
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-xs text-muted-foreground">{description}</span>
          </div>
          <div className="bg-primary/10 p-2 rounded-full transform transition-transform hover:scale-110 hover:rotate-12">
            {icon}
          </div>
        </div>
      </CardContent>
    </MagicCard>
  );
}
