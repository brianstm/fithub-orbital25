"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Clock, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { WorkoutListProps } from "@/types";

export function WorkoutList({
  workouts = [],
  isLoading = false,
  showAll = false,
}: WorkoutListProps) {
  const [displayCount, setDisplayCount] = useState(5);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-3 border rounded-md"
            >
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="text-center py-8">
        <Dumbbell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No workouts recorded yet.</p>
        <Button variant="outline" size="sm" className="mt-4">
          Log Your First Workout
        </Button>
      </div>
    );
  }

  const displayedWorkouts = showAll
    ? workouts
    : workouts.slice(0, displayCount);

  return (
    <div className="space-y-4">
      {displayedWorkouts.map((workout) => (
        <Link
          href={`/dashboard/workouts/${workout._id}`}
          key={workout._id}
          className="flex items-start gap-4 p-3 border rounded-md hover:bg-accent transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{workout.title}</h4>
              <Badge variant="outline">
                {workout.exercises?.length || 0} exercises
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{format(new Date(workout.date), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{workout.duration} min</span>
              </div>
            </div>
          </div>
        </Link>
      ))}

      {!showAll && workouts.length > displayCount && (
        <div className="text-center pt-2">
          <Button
            variant="link"
            onClick={() => setDisplayCount((prev) => prev + 5)}
            className="text-sm"
          >
            Show More
          </Button>
        </div>
      )}
    </div>
  );
}
