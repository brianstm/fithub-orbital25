"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Dumbbell, Edit, Sparkles, CalendarDays, Clipboard, BarChart } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Workout, WorkoutSet } from "@/types";
import { fetchWorkoutById } from "@/lib/api";
import { MagicCard, MagicCardContent, MagicCardHeader } from "@/components/ui/magic-card";
import { MagicButton } from "@/components/ui/magic-button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { ScrollProgress } from "@/components/magicui/scroll-progress";

export default function WorkoutDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const response = await fetchWorkoutById(workoutId);
        setWorkout(response.data.data);
      } catch (error) {
        console.error("Error loading workout:", error);
        toast.error("Failed to load workout. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (workoutId) {
      loadWorkout();
    }
  }, [workoutId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-48" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="p-6 rounded-full bg-primary/10 mb-6">
          <Dumbbell className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Workout Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The workout you're looking for doesn't exist or has been removed.
        </p>
        <MagicButton
          onClick={() => router.push("/dashboard/workouts")}
          hoverScale
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workouts
        </MagicButton>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:min-w-[800px]">
      
      <BlurFade delay={0} direction="up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/workouts")}
              className="hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Workouts
            </Button>
          </div>
          <MagicButton
            onClick={() => router.push(`/dashboard/workouts/${workoutId}/edit`)}
            hoverScale
            variant="outline"
            glowColor="rgba(var(--primary-rgb), 0.3)"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Workout
          </MagicButton>
        </div>
      </BlurFade>

      <BlurFade delay={0.1} direction="up">
        <MagicCard hoverEffect="border">
          <MagicCardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-2">
                  <Dumbbell className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-sm font-medium">{workout.exercises.length} Exercises</span>
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                  {workout.title}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-primary/60" />
                    {format(new Date(workout.date), "MMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary/60" />
                    {workout.duration} minutes
                  </div>
                </div>
                {workout.notes && (
                  <div className="mt-3 p-3 bg-secondary/30 rounded-md border border-border/40">
                    <div className="flex items-center gap-1.5 text-sm font-medium mb-1">
                      <Clipboard className="h-3.5 w-3.5 text-primary/70" />
                      Notes
                    </div>
                    <p className="text-sm text-muted-foreground">{workout.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </MagicCardHeader>
          <MagicCardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                  <BarChart className="h-5 w-5 text-primary/80" />
                  <span>Exercise Details</span>
                </h3>
                <div className="space-y-4">
                  {workout.exercises.map((exercise, index) => (
                    <BlurFade key={exercise._id || index} delay={0.05 * index} direction="up">
                      <MagicCard className="overflow-hidden" hoverEffect="border">
                        <MagicCardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div className="bg-primary/10 p-4 md:w-1/6 flex items-center justify-center">
                              <div className="font-bold text-xl text-primary">{index + 1}</div>
                            </div>
                            <div className="p-4 md:w-5/6">
                              <h4 className="text-lg font-semibold">{exercise.name}</h4>

                              {/* Show Sets Table */}
                              <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-muted-foreground border-b border-border/40">
                                      <th className="text-left pb-2 px-2">Set</th>
                                      <th className="text-left pb-2 px-2">Reps</th>
                                      <th className="text-left pb-2 px-2">Weight</th>
                                      <th className="text-left pb-2 px-2">Type</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {exercise.sets.map((set, setIndex) => (
                                      <tr key={set._id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="py-2 px-2 font-medium">{setIndex + 1}</td>
                                        <td className="py-2 px-2">{set.reps}</td>
                                        <td className="py-2 px-2">{set.weight} kg</td>
                                        <td className="py-2 px-2">
                                          <Badge
                                            variant="outline"
                                            className={`capitalize ${
                                              set.type === "warm_up"
                                                ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none"
                                                : set.type === "failure"
                                                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none"
                                                : "bg-primary/10 text-primary hover:bg-primary/20 border-none"
                                            }`}
                                          >
                                            {set.type.replace("_", " ")}
                                          </Badge>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {exercise.notes && (
                                <div className="mt-4 text-sm bg-secondary/20 p-3 rounded-md">
                                  <span className="font-medium text-primary/80">Notes: </span>
                                  <span className="text-muted-foreground">{exercise.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </MagicCardContent>
                      </MagicCard>
                    </BlurFade>
                  ))}
                </div>
              </div>

              <div className="text-sm text-muted-foreground border-t border-border/40 pt-4 flex flex-col sm:flex-row sm:justify-between gap-2">
                <p className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary/60" />
                  Created on {format(new Date(workout.createdAt), "MMM d, yyyy • h:mm a")}
                </p>
                {workout.updatedAt && (
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary/60" />
                    Last updated on {format(new Date(workout.updatedAt), "MMM d, yyyy • h:mm a")}
                  </p>
                )}
              </div>
            </div>
          </MagicCardContent>
        </MagicCard>
      </BlurFade>
    </div>
  );
}
