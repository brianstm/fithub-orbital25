"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  Plus,
  Edit,
  Trash2,
  Sparkles,
  Clock,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Workout } from "@/types";
import { fetchUserWorkouts, deleteWorkout } from "@/lib/api";
import Link from "next/link";
import {
  MagicCard,
  MagicCardContent,
  MagicCardHeader,
} from "@/components/ui/magic-card";
import { MagicButton } from "@/components/ui/magic-button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function WorkoutsPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const response = await fetchUserWorkouts();
        setWorkouts(response.data.data);
      } catch (error) {
        console.error("Error loading workouts:", error);
        toast.error("Failed to load workouts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkouts();
  }, []);

  const handleDeleteClick = (workoutId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWorkoutToDelete(workoutId);
    setIsAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!workoutToDelete) return;
    
    try {
      await deleteWorkout(workoutToDelete);
      setWorkouts(workouts.filter((workout) => workout._id !== workoutToDelete));
      toast.success("Workout deleted successfully");
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast.error("Failed to delete workout. Please try again.");
    } finally {
      setWorkoutToDelete(null);
      setIsAlertOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setWorkoutToDelete(null);
    setIsAlertOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workout? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BlurFade delay={0} direction="up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-2">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-sm font-medium">Training Progress</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Workout History
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your fitness sessions
            </p>
          </div>
          <MagicButton
            onClick={() => router.push("/dashboard/workouts/new")}
            hoverScale
            glowColor="rgba(var(--primary-rgb), 0.5)"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Workout
          </MagicButton>
        </div>
      </BlurFade>

      {workouts.length === 0 ? (
        <BlurFade delay={0.1} direction="up">
          <MagicCard hoverEffect="border">
            <MagicCardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Dumbbell className="h-12 w-12 text-primary" />
              </div>
              <p className="text-muted-foreground text-lg mb-4">
                No workouts found
              </p>
              <MagicButton
                onClick={() => router.push("/dashboard/workouts/new")}
                sparkle
                hoverScale
              >
                Create Your First Workout
              </MagicButton>
            </MagicCardContent>
          </MagicCard>
        </BlurFade>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout, index) => (
            <BlurFade
              key={workout._id}
              delay={0.1 + index * 0.05}
              direction="up"
            >
              <Link
                href={`/dashboard/workouts/${workout._id}`}
                className="h-full w-full block"
              >
                <MagicCard
                  hoverEffect="border"
                  className="h-full min-w-64 group"
                >
                  <MagicCardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {workout.title}
                        </CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-primary/60" />
                          {format(new Date(workout.date), "MMM d, yyyy")}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary hover:bg-primary/20 border-none transition-colors"
                      >
                        {workout.exercises.length} exercises
                      </Badge>
                    </div>
                  </MagicCardHeader>
                  <MagicCardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 text-primary/60" />
                        {workout.duration} minutes
                      </div>
                      {workout.notes ? (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {workout.notes}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          No notes
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary border-primary/20"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(
                            `/dashboard/workouts/${workout._id}/edit`
                          );
                        }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500 border-red-500/20"
                        onClick={(e) => handleDeleteClick(workout._id, e)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </MagicCardContent>
                </MagicCard>
              </Link>
            </BlurFade>
          ))}
        </div>
      )}
    </div>
  );
}
