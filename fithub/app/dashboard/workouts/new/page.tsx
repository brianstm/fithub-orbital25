"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Dumbbell,
  Plus,
  Trash2,
  FileText,
  BarChart,
} from "lucide-react";
import { toast } from "sonner";
import { createWorkout } from "@/lib/api";
import { WorkoutSuggestionDialog } from "./workout-suggestion-dialog";
import {
  ExerciseSuggestionDialog,
  ExerciseSuggestion,
} from "./exercise-suggestion-dialog";
import {
  MagicCard,
  MagicCardContent,
  MagicCardHeader,
} from "@/components/ui/magic-card";
import { MagicButton } from "@/components/ui/magic-button";
import { BlurFade } from "@/components/magicui/blur-fade";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BadgeNotification,
  useBadgeNotifications,
} from "@/components/badge-notification";

interface WorkoutSet {
  reps: number;
  weight: number;
  type: string;
}

interface Exercise {
  name: string;
  notes?: string;
  sets: WorkoutSet[];
}

interface WorkoutFormData {
  title: string;
  date: string;
  duration: number;
  notes?: string;
  exercises: Exercise[];
}

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

export default function NewWorkoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const suggestionParam = searchParams.get("suggestion");
  const [isSaving, setIsSaving] = useState(false);
  const [workoutData, setWorkoutData] = useState<WorkoutFormData>({
    title: "",
    date: new Date().toISOString().split("T")[0],
    duration: 60,
    notes: "",
    exercises: [
      {
        name: "",
        notes: "",
        sets: [
          {
            reps: 0,
            weight: 0,
            type: "normal",
          },
        ],
      },
    ],
  });

  // Track last save time
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isMac, setIsMac] = useState(false);
  const { newBadges, checkForNewBadges, clearBadges } = useBadgeNotifications();

  useEffect(() => {
    setIsMac(navigator.platform.toLowerCase().includes("mac"));
  }, []);

  // Function to save workout data
  const saveWorkoutData = useCallback(() => {
    // Only save if there's actual data
    if (workoutData.title || workoutData.exercises.some((ex) => ex.name)) {
      const dataToSave = {
        ...workoutData,
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem("newWorkout", JSON.stringify(dataToSave));
      setLastSaveTime(new Date());
      toast.success("Workout progress saved", {
        id: "save-toast",
        duration: 2000,
      });
    }
  }, [workoutData]);

  // Set up interval for auto-save
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveWorkoutData();
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [saveWorkoutData]);

  // Set up keyboard shortcut for saving (Ctrl+S or Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault(); // Prevent browser save dialog
        saveWorkoutData();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [saveWorkoutData]);

  // Separate useEffect to handle localStorage data specifically
  useEffect(() => {
    // Check for a workout saved in localStorage from AI page
    const savedWorkout = localStorage.getItem("newWorkout");

    if (savedWorkout) {
      try {
        const parsedWorkout = JSON.parse(savedWorkout);

        // Check if the workout data is expired (12 hours)
        const lastUpdated = new Date(parsedWorkout.lastUpdated);
        const now = new Date();
        const hoursDiff =
          (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

        if (hoursDiff > 12) {
          // Data is expired, remove it
          localStorage.removeItem("newWorkout");
          return;
        }

        // Set the workout data from localStorage
        setWorkoutData({
          title: parsedWorkout.title || "",
          date: new Date().toISOString().split("T")[0],
          duration: parsedWorkout.duration || 60,
          notes: parsedWorkout.notes || parsedWorkout.description || "",
          exercises: parsedWorkout.exercises?.length
            ? parsedWorkout.exercises.map((exercise: any) => ({
                name: exercise.name || "",
                notes: exercise.notes || "",
                sets: exercise.sets?.length
                  ? exercise.sets.map((set: any) => ({
                      reps: set.reps || 0,
                      weight: set.weight || 0,
                      type: set.type || "normal",
                    }))
                  : [
                      {
                        reps: 0,
                        weight: 0,
                        type: "normal",
                      },
                    ],
              }))
            : [
                {
                  name: "",
                  notes: "",
                  sets: [
                    {
                      reps: 0,
                      weight: 0,
                      type: "normal",
                    },
                  ],
                },
              ],
        });

        toast.success("Workout loaded from cache");
      } catch (error) {
        console.error("Error parsing saved workout:", error);
        toast.error("Failed to load saved workout");
      }
    }
  }, []); // Empty dependency array to run only on mount

  useEffect(() => {
    // Handle suggestion from URL parameter
    if (suggestionParam) {
      try {
        const suggestion = JSON.parse(decodeURIComponent(suggestionParam));
        handleSuggestedWorkout(suggestion);
      } catch (err) {
        console.error("Error parsing suggestion from URL:", err);
        toast.error("Could not load the suggested workout");
      }
    }

    // Handle exercise from URL parameter
    const exerciseParam = searchParams.get("exercise");
    if (exerciseParam) {
      try {
        const exercise = JSON.parse(decodeURIComponent(exerciseParam));
        handleExerciseSuggestionSelect(exercise);
      } catch (err) {
        console.error("Error parsing exercise from URL:", err);
        toast.error("Could not load the suggested exercise");
      }
    }
  }, [searchParams]); // Depends on searchParams

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setWorkoutData((prev) => ({ ...prev, title: newTitle }));
    },
    []
  );

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value;
      setWorkoutData((prev) => ({ ...prev, date: newDate }));
    },
    []
  );

  const handleDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDuration = parseInt(e.target.value);
      setWorkoutData((prev) => ({ ...prev, duration: newDuration }));
    },
    []
  );

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newNotes = e.target.value;
      setWorkoutData((prev) => ({ ...prev, notes: newNotes }));
    },
    []
  );

  const handleExerciseNameChange = useCallback(
    (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value;
      setWorkoutData((prev) => {
        const updatedExercises = [...prev.exercises];
        updatedExercises[index] = {
          ...updatedExercises[index],
          name: newName,
        };
        return { ...prev, exercises: updatedExercises };
      });
    },
    []
  );

  const handleExerciseNotesChange = useCallback(
    (index: number, e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newNotes = e.target.value;
      setWorkoutData((prev) => {
        const updatedExercises = [...prev.exercises];
        updatedExercises[index] = {
          ...updatedExercises[index],
          notes: newNotes,
        };
        return { ...prev, exercises: updatedExercises };
      });
    },
    []
  );

  const handleSetChange = useCallback(
    (
      exerciseIndex: number,
      setIndex: number,
      field: keyof WorkoutSet,
      value: any
    ) => {
      setWorkoutData((prev) => {
        const updatedExercises = [...prev.exercises];
        const updatedSets = [...updatedExercises[exerciseIndex].sets];
        updatedSets[setIndex] = {
          ...updatedSets[setIndex],
          [field]: value,
        };
        updatedExercises[exerciseIndex] = {
          ...updatedExercises[exerciseIndex],
          sets: updatedSets,
        };
        return { ...prev, exercises: updatedExercises };
      });
    },
    []
  );

  const addExercise = useCallback(() => {
    const newExercise: Exercise = {
      name: "",
      sets: [
        {
          reps: 0,
          weight: 0,
          type: "normal",
        },
      ],
      notes: "",
    };
    setWorkoutData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));
  }, []);

  const removeExercise = useCallback((index: number) => {
    setWorkoutData((prev) => {
      const updatedExercises = [...prev.exercises];
      updatedExercises.splice(index, 1);
      return { ...prev, exercises: updatedExercises };
    });
  }, []);

  const addSet = useCallback((exerciseIndex: number) => {
    setWorkoutData((prev) => {
      const updatedExercises = [...prev.exercises];
      updatedExercises[exerciseIndex].sets.push({
        reps: 0,
        weight: 0,
        type: "normal",
      });
      return { ...prev, exercises: updatedExercises };
    });
  }, []);

  const removeSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setWorkoutData((prev) => {
      const updatedExercises = [...prev.exercises];
      updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
      return { ...prev, exercises: updatedExercises };
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!workoutData.title.trim()) {
      toast.error("Please enter a workout title");
      return;
    }

    if (workoutData.exercises.length === 0) {
      toast.error("Please add at least one exercise");
      return;
    }

    for (const exercise of workoutData.exercises) {
      if (!exercise.name.trim()) {
        toast.error("All exercises must have a name");
        return;
      }

      if (exercise.sets.length === 0) {
        toast.error(`Please add at least one set to "${exercise.name}"`);
        return;
      }
    }

    // Save progress before submitting
    saveWorkoutData();

    setIsSaving(true);

    try {
      await createWorkout({
        title: workoutData.title,
        date: workoutData.date,
        duration: workoutData.duration,
        notes: workoutData.notes,
        exercises: workoutData.exercises.map((exercise) => ({
          name: exercise.name,
          notes: exercise.notes,
          sets: exercise.sets.map((set) => ({
            reps: set.reps,
            weight: set.weight,
            type: set.type,
          })),
        })),
      });

      // Clear the cached data after successful save
      localStorage.removeItem("newWorkout");

      // Check for new badges after workout creation
      await checkForNewBadges();

      toast.success("Workout created successfully!");
      router.push("/dashboard/workouts");
    } catch (error) {
      console.error("Error creating workout:", error);
      toast.error("Failed to create workout. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuggestedWorkout = (suggestion: WorkoutSuggestion) => {
    // Map suggestion to form format with correct types
    const exercises: Exercise[] = suggestion.exercises.map((exercise) => {
      return {
        name: exercise.name,
        sets: exercise.sets.map((set) => {
          return {
            reps: set.reps,
            weight: set.weight ?? 0,
            type: set.type || "normal",
            notes: set.notes || "",
          } as WorkoutSet;
        }),
        notes: exercise.notes || "",
      };
    });

    // Update form state
    setWorkoutData({
      ...workoutData,
      title: suggestion.title,
      notes: suggestion.notes || "",
      exercises: exercises,
    });
  };

  const handleExerciseSuggestionSelect = (suggestion: ExerciseSuggestion) => {
    // Create a new exercise from the suggestion
    const newExercise: Exercise = {
      name: suggestion.name,
      notes: `${
        suggestion.description
      }\n\nForm tips: ${suggestion.formTips.join(
        ", "
      )}\n\nBenefits: ${suggestion.benefits.join(", ")}`,
      sets: Array(suggestion.recommendedSets)
        .fill(0)
        .map(() => ({
          reps: suggestion.recommendedReps,
          weight: suggestion.recommendedWeight || 0,
          type: "normal",
        })),
    };

    // Add the new exercise to the form data
    setWorkoutData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));

    toast.success(`Added ${suggestion.name} to your workout`);
  };

  const handleSelectedExercise = (exercise: ExerciseSuggestion) => {
    // Create a new exercise from the suggestion
    const newExercise: Exercise = {
      name: exercise.name,
      sets: [
        {
          reps: exercise.recommendedReps,
          weight: exercise.recommendedWeight ?? 0,
          type: "normal",
        },
      ],
      notes: `${exercise.notes}`,
    };

    // Add the exercise to the workout
    setWorkoutData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));

    toast.success(`Added ${exercise.name} to your workout`);
  };

  return (
    <div className="space-y-6">
      <BadgeNotification badges={newBadges} onClose={clearBadges} />
      <BlurFade delay={0} direction="up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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
          <div className="flex gap-2 items-center">
            {lastSaveTime && (
              <span className="text-xs text-muted-foreground">
                Last saved: {lastSaveTime.toLocaleTimeString()}
              </span>
            )}
            <MagicButton
              variant="outline"
              size="sm"
              onClick={saveWorkoutData}
              className="ml-2"
              hoverScale
              glowColor="rgba(var(--primary-rgb), 0.3)"
            >
              Save Progress
              <span className="ml-1 text-xs text-muted-foreground">
                {isMac ? "(⌘S)" : "(Ctrl+S)"}
              </span>
            </MagicButton>
            <WorkoutSuggestionDialog
              onSuggestedWorkout={handleSuggestedWorkout}
              duration={workoutData.duration}
            />
          </div>
        </div>
      </BlurFade>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <BlurFade delay={0.1} direction="up">
            <MagicCard hoverEffect="border">
              <MagicCardHeader>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-2">
                  <Dumbbell className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-sm font-medium">New Workout</span>
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                  Create Your Workout
                </CardTitle>
              </MagicCardHeader>
              <MagicCardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="title"
                        className="flex items-center gap-1.5 text-sm mb-1.5"
                      >
                        <FileText className="h-3.5 w-3.5 text-primary/70" />
                        Workout Title
                      </Label>
                      <Input
                        id="title"
                        value={workoutData.title}
                        onChange={handleTitleChange}
                        placeholder="E.g., Morning Strength Training"
                        className="border-border/40 focus-visible:ring-primary"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="notes"
                        className="flex items-center gap-1.5 text-sm mb-1.5"
                      >
                        <FileText className="h-3.5 w-3.5 text-primary/70" />
                        Notes (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        value={workoutData.notes}
                        onChange={handleNotesChange}
                        placeholder="Add any notes about this workout"
                        className="min-h-[120px] border-border/40 focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="date"
                        className="flex items-center gap-1.5 text-sm mb-1.5"
                      >
                        <CalendarDays className="h-3.5 w-3.5 text-primary/70" />
                        Workout Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={workoutData.date}
                        onChange={handleDateChange}
                        className="border-border/40 focus-visible:ring-primary"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="duration"
                        className="flex items-center gap-1.5 text-sm mb-1.5"
                      >
                        <Clock className="h-3.5 w-3.5 text-primary/70" />
                        Duration (minutes)
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={workoutData.duration}
                        onChange={handleDurationChange}
                        className="border-border/40 focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </MagicCardContent>
            </MagicCard>
          </BlurFade>

          <BlurFade delay={0.2} direction="up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary/80" />
                <span>Exercises</span>
              </h3>
              <div className="flex md:flex-row flex-col items-center gap-2">
                <ExerciseSuggestionDialog
                  onExerciseSelect={handleSelectedExercise}
                />
                <MagicButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExercise}
                  hoverScale
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exercise
                </MagicButton>
              </div>
            </div>

            <div className="space-y-6">
              {workoutData.exercises.map((exercise, exerciseIndex) => (
                <BlurFade
                  key={`exercise-${exerciseIndex}`}
                  delay={0.05 * exerciseIndex}
                  direction="up"
                >
                  <MagicCard className="overflow-hidden" hoverEffect="border">
                    <MagicCardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="bg-primary/10 p-4 md:w-1/6 flex items-center justify-center">
                          <div className="font-bold text-xl text-primary">
                            {exerciseIndex + 1}
                          </div>
                        </div>
                        <div className="p-4 md:w-5/6 space-y-4">
                          <div className="flex flex-row justify-between gap-4">
                            <div className="flex-1">
                              <Label
                                htmlFor={`exercise-name-${exerciseIndex}`}
                                className="text-sm mb-1.5 block"
                              >
                                Exercise Name
                              </Label>
                              <Input
                                id={`exercise-name-${exerciseIndex}`}
                                value={exercise.name}
                                onChange={(e) =>
                                  handleExerciseNameChange(exerciseIndex, e)
                                }
                                placeholder="E.g., Bench Press"
                                className="border-border/40 focus-visible:ring-primary"
                              />
                            </div>
                            <div className="flex items-start">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeExercise(exerciseIndex)}
                                disabled={workoutData.exercises.length <= 1}
                                className="mt-7"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
                                    <th className="text-left pb-2 px-2">
                                      Reps
                                    </th>
                                    <th className="text-left pb-2 px-2">
                                      Weight (kg)
                                    </th>
                                    <th className="text-left pb-2 px-2">
                                      Type
                                    </th>
                                    <th className="text-left pb-2 px-2"></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {exercise.sets.map((set, setIndex) => (
                                    <tr
                                      key={`set-${exerciseIndex}-${setIndex}`}
                                      className="hover:bg-secondary/20 transition-colors"
                                    >
                                      <td className="py-2 px-2 font-medium">
                                        {setIndex + 1}
                                      </td>
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
                                          className="h-8 md:w-20 w-12 border-border/40 focus-visible:ring-primary"
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
                                          className="h-8 md:w-20 w-12 border-border/40 focus-visible:ring-primary"
                                        />
                                      </td>
                                      <td className="py-2 px-2">
                                        <Select
                                          value={set.type}
                                          onValueChange={(value) =>
                                            handleSetChange(
                                              exerciseIndex,
                                              setIndex,
                                              "type",
                                              value
                                            )
                                          }
                                        >
                                          <SelectTrigger className="h-8 w-full border-border/40">
                                            <SelectValue placeholder="Select type" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="normal">
                                              Normal
                                            </SelectItem>
                                            <SelectItem value="warm_up">
                                              Warm Up
                                            </SelectItem>
                                            <SelectItem value="failure">
                                              Failure
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </td>
                                      <td className="py-2 px-2">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            removeSet(exerciseIndex, setIndex)
                                          }
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
                            <Label
                              htmlFor={`exercise-notes-${exerciseIndex}`}
                              className="text-sm mb-1.5 block"
                            >
                              Notes (Optional)
                            </Label>
                            <Textarea
                              id={`exercise-notes-${exerciseIndex}`}
                              value={exercise.notes}
                              onChange={(e) =>
                                handleExerciseNotesChange(exerciseIndex, e)
                              }
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
                onClick={() => router.push("/dashboard/workouts")}
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
                {isSaving ? "Saving..." : "Save Workout"}
              </MagicButton>
            </div>
          </BlurFade>
        </div>
      </form>
    </div>
  );
}
