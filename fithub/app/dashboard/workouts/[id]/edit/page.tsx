"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CalendarDays, Clock, Dumbbell, FileText, Plus, Trash2, BarChart } from "lucide-react";
import { toast } from "sonner";
import { Workout, Exercise, WorkoutSet } from "@/types";
import { fetchWorkoutById, updateWorkout } from "@/lib/api";
import { MagicCard, MagicCardContent, MagicCardHeader } from "@/components/ui/magic-card";
import { MagicButton } from "@/components/ui/magic-button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditWorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (workout) {
      setWorkout({ ...workout, title: e.target.value });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (workout) {
      setWorkout({ ...workout, date: e.target.value });
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (workout) {
      setWorkout({ ...workout, duration: parseInt(e.target.value) });
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (workout) {
      setWorkout({ ...workout, notes: e.target.value });
    }
  };

  const handleExerciseNameChange = (index: number, value: string) => {
    if (workout) {
      const updatedExercises = [...workout.exercises];
      updatedExercises[index] = {
        ...updatedExercises[index],
        name: value,
      };
      setWorkout({ ...workout, exercises: updatedExercises });
    }
  };

  const handleExerciseNotesChange = (index: number, value: string) => {
    if (workout) {
      const updatedExercises = [...workout.exercises];
      updatedExercises[index] = {
        ...updatedExercises[index],
        notes: value,
      };
      setWorkout({ ...workout, exercises: updatedExercises });
    }
  };

  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof WorkoutSet,
    value: string | number
  ) => {
    if (workout) {
      const updatedExercises = [...workout.exercises];
      const updatedSets = [...updatedExercises[exerciseIndex].sets];
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        [field]: value,
      };
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        sets: updatedSets,
      };
      setWorkout({ ...workout, exercises: updatedExercises });
    }
  };

  const addSet = (exerciseIndex: number) => {
    if (workout) {
      const updatedExercises = [...workout.exercises];
      const newSet: WorkoutSet = {
        _id: Math.random().toString(36).substr(2, 9),
        reps: 0,
        weight: 0,
        type: "normal",
      };
      updatedExercises[exerciseIndex].sets.push(newSet);
      setWorkout({ ...workout, exercises: updatedExercises });
    }
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    if (workout) {
      const updatedExercises = [...workout.exercises];
      updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
      setWorkout({ ...workout, exercises: updatedExercises });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workout) return;

    setIsSaving(true);
    try {
      await updateWorkout(workoutId, workout);
      toast.success("Workout updated successfully");
      router.push(`/dashboard/workouts/${workoutId}`);
    } catch (error) {
      console.error("Error updating workout:", error);
      toast.error("Failed to update workout. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
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
    <div className="space-y-6">

      <BlurFade delay={0} direction="up">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/workouts/${workoutId}`)}
            className="hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workout
          </Button>
        </div>
      </BlurFade>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <BlurFade delay={0.1} direction="up">
            <MagicCard hoverEffect="border">
              <MagicCardHeader>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-2">
                  <Dumbbell className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-sm font-medium">Edit Workout</span>
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                  Update Your Workout
                </CardTitle>
              </MagicCardHeader>
              <MagicCardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="flex items-center gap-1.5 text-sm mb-1.5">
                        <FileText className="h-3.5 w-3.5 text-primary/70" />
                        Workout Title
                      </Label>
                      <Input
                        id="title"
                        value={workout.title}
                        onChange={handleTitleChange}
                        className="border-border/40 focus-visible:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes" className="flex items-center gap-1.5 text-sm mb-1.5">
                        <FileText className="h-3.5 w-3.5 text-primary/70" />
                        Notes (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        value={workout.notes || ""}
                        onChange={handleNotesChange}
                        placeholder="Add any notes about this workout"
                        className="min-h-[120px] border-border/40 focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="date" className="flex items-center gap-1.5 text-sm mb-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-primary/70" />
                        Workout Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={new Date(workout.date).toISOString().split("T")[0]}
                        onChange={handleDateChange}
                        className="border-border/40 focus-visible:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration" className="flex items-center gap-1.5 text-sm mb-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary/70" />
                        Duration (minutes)
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={workout.duration}
                        onChange={handleDurationChange}
                        className="border-border/40 focus-visible:ring-primary"
                        required
                      />
                    </div>
                  </div>
                </div>
              </MagicCardContent>
            </MagicCard>
          </BlurFade>

          <BlurFade delay={0.2} direction="up">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary/80" />
                <span>Exercises</span>
              </h3>
            </div>

            <div className="space-y-6">
              {workout.exercises.map((exercise, exerciseIndex) => (
                <BlurFade key={exercise._id} delay={0.05 * exerciseIndex} direction="up">
                  <MagicCard className="overflow-hidden" hoverEffect="border">
                    <MagicCardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="bg-primary/10 p-4 md:w-1/6 flex items-center justify-center">
                          <div className="font-bold text-xl text-primary">{exerciseIndex + 1}</div>
                        </div>
                        <div className="p-4 md:w-5/6 space-y-4">
                          <div>
                            <Label htmlFor={`exercise-name-${exerciseIndex}`} className="text-sm mb-1.5 block">
                              Exercise Name
                            </Label>
                            <Input
                              id={`exercise-name-${exerciseIndex}`}
                              value={exercise.name}
                              onChange={(e) => handleExerciseNameChange(exerciseIndex, e.target.value)}
                              className="border-border/40 focus-visible:ring-primary"
                              required
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm">Sets</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addSet(exerciseIndex)}
                                className="h-7 px-2 text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Set
                              </Button>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-muted-foreground border-b border-border/40">
                                    <th className="text-left pb-2 px-2">Set</th>
                                    <th className="text-left pb-2 px-2">Reps</th>
                                    <th className="text-left pb-2 px-2">Weight (kg)</th>
                                    <th className="text-left pb-2 px-2">Type</th>
                                    <th className="text-left pb-2 px-2 w-[80px]">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {exercise.sets.map((set, setIndex) => (
                                    <tr key={set._id} className="hover:bg-secondary/20 transition-colors">
                                      <td className="py-2 px-2 font-medium">{setIndex + 1}</td>
                                      <td className="py-2 px-2">
                                        <Input
                                          type="number"
                                          min="0"
                                          value={set.reps}
                                          onChange={(e) =>
                                            handleSetChange(
                                              exerciseIndex,
                                              setIndex,
                                              "reps",
                                              parseInt(e.target.value)
                                            )
                                          }
                                          className="h-8 w-20 border-border/40 focus-visible:ring-primary"
                                          required
                                        />
                                      </td>
                                      <td className="py-2 px-2">
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.5"
                                          value={set.weight}
                                          onChange={(e) =>
                                            handleSetChange(
                                              exerciseIndex,
                                              setIndex,
                                              "weight",
                                              parseFloat(e.target.value)
                                            )
                                          }
                                          className="h-8 w-20 border-border/40 focus-visible:ring-primary"
                                          required
                                        />
                                      </td>
                                      <td className="py-2 px-2">
                                        <select
                                          value={set.type}
                                          onChange={(e) =>
                                            handleSetChange(
                                              exerciseIndex,
                                              setIndex,
                                              "type",
                                              e.target.value
                                            )
                                          }
                                          className="h-8 w-full px-2 border border-border/40 rounded-md bg-background focus:ring-primary focus:border-primary text-sm"
                                        >
                                          <option value="normal">Normal</option>
                                          <option value="warm_up">Warm Up</option>
                                          <option value="failure">Failure</option>
                                        </select>
                                      </td>
                                      <td className="py-2 px-2">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => removeSet(exerciseIndex, setIndex)}
                                          disabled={exercise.sets.length <= 1}
                                          className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-100/10"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`exercise-notes-${exerciseIndex}`} className="text-sm mb-1.5 block">
                              Notes (Optional)
                            </Label>
                            <Textarea
                              id={`exercise-notes-${exerciseIndex}`}
                              value={exercise.notes || ""}
                              onChange={(e) => handleExerciseNotesChange(exerciseIndex, e.target.value)}
                              placeholder="Notes about this exercise"
                              className="min-h-[80px] border-border/40 focus-visible:ring-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </MagicCardContent>
                  </MagicCard>
                </BlurFade>
              ))}
            </div>
          </BlurFade>

          <BlurFade delay={0.3} direction="up">
            <div className="flex justify-end gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/workouts/${workoutId}`)}
                className="border-border/40"
              >
                Cancel
              </Button>
              <MagicButton
                type="submit"
                disabled={isSaving}
                hoverScale
                glowColor="rgba(var(--primary-rgb), 0.3)"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </MagicButton>
            </div>
          </BlurFade>
        </div>
      </form>
    </div>
  );
}
