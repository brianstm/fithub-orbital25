"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { getWorkoutSuggestions } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Info, Check } from "lucide-react";
import { MagicButton } from "@/components/ui/magic-button";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface WorkoutSuggestionDialogProps {
  onSuggestedWorkout: (workout: WorkoutSuggestion) => void;
  duration?: number;
}

export function WorkoutSuggestionDialog({
  onSuggestedWorkout,
  duration = 45,
}: WorkoutSuggestionDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workoutDay, setWorkoutDay] = useState<string>("general");
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      // Get suggestions for different focus areas
      const focusAreas = ["strength", "cardio", "hypertrophy", "push"];
      const allSuggestions: WorkoutSuggestion[] = [];

      for (const focus of focusAreas) {
        try {
          const response = await getWorkoutSuggestions(
            "intermediate",
            focus,
            duration,
            workoutDay
          );

          if (response.success && response.data?.suggestion) {
            allSuggestions.push(response.data.suggestion);
          }
        } catch (error) {
          console.error(`Error fetching ${focus} workout suggestion:`, error);
        }
      }

      setSuggestions(allSuggestions);
    } catch (error) {
      console.error("Error fetching workout suggestions:", error);
      setError("Failed to load workout suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSuggestions();
    }
  }, [open, workoutDay]);

  const handleWorkoutSelect = (workout: WorkoutSuggestion) => {
    onSuggestedWorkout(workout);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <MagicButton
          variant="outline"
          size="sm"
          hoverScale
          glowColor="rgba(var(--primary-rgb), 0.3)"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Workout Ideas
        </MagicButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Workout Suggestions</DialogTitle>
          <DialogDescription>
            Choose a suggested workout to get started quickly
          </DialogDescription>
        </DialogHeader>

        <div className="pb-4 pt-2">
          <div className="mb-4">
            <Label htmlFor="workout-day" className="text-sm mb-1.5 block">
              Workout Focus
            </Label>
            <Select value={workoutDay} onValueChange={setWorkoutDay}>
              <SelectTrigger
                id="workout-day"
                className="focus:ring-primary focus:border-primary/60"
              >
                <SelectValue placeholder="Select a workout focus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="push">Push Day</SelectItem>
                <SelectItem value="pull">Pull Day</SelectItem>
                <SelectItem value="legs">Leg Day</SelectItem>
                <SelectItem value="upper">Upper Body</SelectItem>
                <SelectItem value="lower">Lower Body</SelectItem>
                <SelectItem value="full">Full Body</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="w-full">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            suggestions.length > 0 && (
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {suggestions.map((suggestion, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          {suggestion.title}
                        </CardTitle>
                        <CardDescription>
                          {suggestion.duration} min workout
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm">{suggestion.description}</p>
                        <div className="text-sm">
                          <span className="font-medium">Exercises: </span>
                          {suggestion.exercises.length}
                        </div>
                        <div className="flex flex-wrap gap-1 text-xs">
                          {suggestion.exercises
                            .slice(0, 3)
                            .map((exercise, i) => (
                              <span
                                key={i}
                                className="bg-muted rounded-full px-2 py-1"
                              >
                                {exercise.name}
                              </span>
                            ))}
                          {suggestion.exercises.length > 3 && (
                            <span className="bg-muted rounded-full px-2 py-1">
                              +{suggestion.exercises.length - 3} more
                            </span>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <MagicButton
                          className="w-full"
                          onClick={() => handleWorkoutSelect(suggestion)}
                          hoverScale
                          glowColor="rgba(var(--primary-rgb), 0.3)"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Select This Workout
                        </MagicButton>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Info className="h-3 w-3 mr-1" />
            Suggestions are personalized based on your workout history and
            selected day
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
