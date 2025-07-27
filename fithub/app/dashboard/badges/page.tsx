"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Award,
  Trophy,
  Target,
  Flame,
  Calendar,
  TrendingUp,
  Users,
  Medal,
  Star,
  BarChart3,
  Dumbbell,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  MagicCard,
  MagicCardContent,
  MagicCardHeader,
} from "@/components/ui/magic-card";
import { BlurFade } from "@/components/magicui/blur-fade";
import { useAuth } from "@/context/auth-context";
import { fetchUserBadges, fetchLeaderboards } from "@/lib/api";
import { useRouter } from "next/navigation";

interface BadgeData {
  name: string;
  description: string;
  icon: string;
  category: "consistency" | "strength" | "milestone" | "achievement";
  earnedAt: string;
  criteria?: any;
}

interface UserStats {
  totalWorkouts: number;
  totalVolumeLiftedKg: number;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate?: string;
  weeklyWorkouts: number;
  monthlyWorkouts: number;
  averageWorkoutsPerWeek: number;
  personalRecords: Record<string, number>;
  totalWorkoutDuration: number;
  favoriteExercises: string[];
}

interface LeaderboardEntry {
  rank: number;
  user: {
    name: string;
    profilePicture?: string;
  };
  streak?: number;
  volume?: number;
  workouts?: number;
  longestStreak?: number;
  badges: number;
}

interface LeaderboardData {
  weeklyStreaks: LeaderboardEntry[];
  totalVolume: LeaderboardEntry[];
  totalWorkouts: LeaderboardEntry[];
  consistency: LeaderboardEntry[];
}

const categoryColors = {
  consistency: "bg-blue-500",
  strength: "bg-red-500",
  milestone: "bg-green-500",
  achievement: "bg-purple-500",
};

const categoryEmojis = {
  consistency: "🔥",
  strength: "💪",
  milestone: "🎯",
  achievement: "🏆",
};

const categoryIcons = {
  consistency: Flame,
  strength: Dumbbell,
  milestone: Target,
  achievement: Trophy,
};

export default function BadgesPage() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [leaderboards, setLeaderboards] = useState<LeaderboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("badges");
  const router = useRouter();

  useEffect(() => {
    fetchBadgesAndStats();
    fetchLeaderboardsData();
  }, []);

  const fetchBadgesAndStats = async () => {
    try {
      const response = await fetchUserBadges();
      setBadges(response.data.data.badges || []);
      setStats(response.data.data.stats || null);
    } catch (error) {
      console.error("Error fetching badges:", error);
      toast.error("Error loading badges");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboardsData = async () => {
    try {
      const response = await fetchLeaderboards();
      setLeaderboards(response.data.data.leaderboards);
    } catch (error) {
      console.error("Error fetching leaderboards:", error);
    }
  };

  const renderBadgeCard = (badge: BadgeData, index: number) => {
    const colorClass = categoryColors[badge.category];
    const CategoryIcon = categoryIcons[badge.category];

    const handleShareBadge = () => {
      // Navigate to new post page with badge pre-selected
      const badgeData = encodeURIComponent(JSON.stringify([badge]));
      router.push(`/dashboard/community/new?badges=${badgeData}`);
    };

    return (
      <BlurFade key={badge.name} delay={0.05 * index} direction="up">
        <MagicCard className="h-full" hoverEffect="border">
          <MagicCardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div
                  className={`p-4 rounded-full ${colorClass} text-white shadow-lg`}
                >
                  <CategoryIcon className="h-8 w-8" />
                </div>
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                  <Star className="h-4 w-4 text-yellow-800" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg">{badge.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {badge.description}
                </p>
                <Badge variant="secondary" className="capitalize">
                  {badge.category}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Earned {new Date(badge.earnedAt).toLocaleDateString()}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={handleShareBadge}
              >
                <Users className="h-4 w-4 mr-2" />
                Share in Community
              </Button>
            </div>
          </MagicCardContent>
        </MagicCard>
      </BlurFade>
    );
  };

  const renderLeaderboardCard = (
    title: string,
    data: LeaderboardEntry[],
    valueKey: string,
    valueLabel: string,
    icon: React.ComponentType<any>
  ) => {
    const IconComponent = icon;

    return (
      <MagicCard className="h-full" hoverEffect="border">
        <MagicCardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconComponent className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </MagicCardHeader>
        <MagicCardContent>
          <div className="space-y-3">
            {data.slice(0, 5).map((entry, index) => (
              <div
                key={entry.rank}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {entry.rank}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.user.profilePicture} />
                    <AvatarFallback>{entry.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{entry.user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {entry.badges} badges
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {(entry as any)[valueKey] || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {valueLabel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </MagicCardContent>
      </MagicCard>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BlurFade delay={0} direction="up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-2">
              <Award className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-sm font-medium">Leaderboard</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Badges & Achievements
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your fitness journey and compete with the community
            </p>
          </div>
        </div>
      </BlurFade>

      <BlurFade delay={0.1} direction="up">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              My Badges ({badges.length})
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger
              value="leaderboards"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Leaderboards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="badges" className="space-y-6">
            {badges.length > 0 ? (
              <>
                <BlurFade delay={0.15} direction="up">
                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <Button
                      onClick={() => {
                        const badgeData = encodeURIComponent(
                          JSON.stringify(badges)
                        );
                        router.push(
                          `/dashboard/community/new?badges=${badgeData}`
                        );
                      }}
                      className="flex-1 sm:flex-none"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Share All Badges
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const latestBadge = badges.sort(
                          (a, b) =>
                            new Date(b.earnedAt).getTime() -
                            new Date(a.earnedAt).getTime()
                        )[0];
                        const badgeData = encodeURIComponent(
                          JSON.stringify([latestBadge])
                        );
                        router.push(
                          `/dashboard/community/new?badges=${badgeData}`
                        );
                      }}
                      className="flex-1 sm:flex-none"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Share Latest Badge
                    </Button>
                  </div>
                </BlurFade>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {badges.map((badge, index) => renderBadgeCard(badge, index))}
                </div>
              </>
            ) : (
              <BlurFade delay={0.2} direction="up">
                <MagicCard>
                  <MagicCardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Award className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      No Badges Yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start working out to earn your first badge!
                    </p>
                    <Button
                      onClick={() =>
                        (window.location.href = "/dashboard/workouts/new")
                      }
                    >
                      Create Workout
                    </Button>
                  </MagicCardContent>
                </MagicCard>
              </BlurFade>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            {stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <BlurFade delay={0.1} direction="up">
                  <MagicCard>
                    <MagicCardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                          <Dumbbell className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Total Workouts</h3>
                          <p className="text-2xl font-bold">
                            {stats.totalWorkouts}
                          </p>
                        </div>
                      </div>
                    </MagicCardContent>
                  </MagicCard>
                </BlurFade>

                <BlurFade delay={0.15} direction="up">
                  <MagicCard>
                    <MagicCardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-red-500/10 p-2 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Total Volume</h3>
                          <p className="text-2xl font-bold">
                            {stats.totalVolumeLiftedKg.toLocaleString()} kg
                          </p>
                        </div>
                      </div>
                    </MagicCardContent>
                  </MagicCard>
                </BlurFade>

                <BlurFade delay={0.2} direction="up">
                  <MagicCard>
                    <MagicCardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-green-500/10 p-2 rounded-lg">
                          <Flame className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Current Streak</h3>
                          <p className="text-2xl font-bold">
                            {stats.currentStreak} days
                          </p>
                        </div>
                      </div>
                    </MagicCardContent>
                  </MagicCard>
                </BlurFade>

                <BlurFade delay={0.25} direction="up">
                  <MagicCard>
                    <MagicCardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-purple-500/10 p-2 rounded-lg">
                          <Trophy className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Longest Streak</h3>
                          <p className="text-2xl font-bold">
                            {stats.longestStreak} days
                          </p>
                        </div>
                      </div>
                    </MagicCardContent>
                  </MagicCard>
                </BlurFade>

                <BlurFade delay={0.3} direction="up">
                  <MagicCard>
                    <MagicCardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-orange-500/10 p-2 rounded-lg">
                          <Clock className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Total Duration</h3>
                          <p className="text-2xl font-bold">
                            {Math.round(stats.totalWorkoutDuration / 60)} hours
                          </p>
                        </div>
                      </div>
                    </MagicCardContent>
                  </MagicCard>
                </BlurFade>

                <BlurFade delay={0.35} direction="up">
                  <MagicCard>
                    <MagicCardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-pink-500/10 p-2 rounded-lg">
                          <Medal className="h-5 w-5 text-pink-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Badges Earned</h3>
                          <p className="text-2xl font-bold">{badges.length}</p>
                        </div>
                      </div>
                    </MagicCardContent>
                  </MagicCard>
                </BlurFade>
              </div>
            ) : (
              <BlurFade delay={0.2} direction="up">
                <MagicCard>
                  <MagicCardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      No Statistics Yet
                    </h3>
                    <p className="text-muted-foreground">
                      Complete your first workout to see your statistics!
                    </p>
                  </MagicCardContent>
                </MagicCard>
              </BlurFade>
            )}
          </TabsContent>

          <TabsContent value="leaderboards" className="space-y-6">
            {leaderboards ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BlurFade delay={0.1} direction="up">
                  {renderLeaderboardCard(
                    "Current Streaks",
                    leaderboards.weeklyStreaks,
                    "streak",
                    "days",
                    Flame
                  )}
                </BlurFade>

                <BlurFade delay={0.15} direction="up">
                  {renderLeaderboardCard(
                    "Total Volume",
                    leaderboards.totalVolume,
                    "volume",
                    "kg lifted",
                    TrendingUp
                  )}
                </BlurFade>

                <BlurFade delay={0.2} direction="up">
                  {renderLeaderboardCard(
                    "Total Workouts",
                    leaderboards.totalWorkouts,
                    "workouts",
                    "workouts",
                    Dumbbell
                  )}
                </BlurFade>

                <BlurFade delay={0.25} direction="up">
                  {renderLeaderboardCard(
                    "Consistency Champions",
                    leaderboards.consistency,
                    "longestStreak",
                    "longest streak",
                    Trophy
                  )}
                </BlurFade>
              </div>
            ) : (
              <BlurFade delay={0.2} direction="up">
                <MagicCard>
                  <MagicCardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      Loading Leaderboards
                    </h3>
                    <p className="text-muted-foreground">
                      Fetching community rankings...
                    </p>
                  </MagicCardContent>
                </MagicCard>
              </BlurFade>
            )}
          </TabsContent>
        </Tabs>
      </BlurFade>
    </div>
  );
}
