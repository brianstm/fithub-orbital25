"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getExerciseSuggestions } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Lightbulb, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { MagicButton } from "@/components/ui/magic-button";

export interface ExerciseSuggestion {
  name: string;
  description: string;
  muscleGroup: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  recommendedSets: number;
  recommendedReps: number;
  recommendedWeight?: number;
  formTips: string[];
  benefits: string[];
  notes: string;
}

interface ExerciseSuggestionDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onExerciseSelect?: (exercise: ExerciseSuggestion) => void;
  currentExercises?: Array<{ name: string }>;
  workoutType?: string;
}

const workoutDayOptions = [
  { value: "general", label: "General" },
  { value: "push", label: "Push Day" },
  { value: "pull", label: "Pull Day" },
  { value: "legs", label: "Leg Day" },
  { value: "upper", label: "Upper Body" },
  { value: "lower", label: "Lower Body" },
  { value: "cardio", label: "Cardio" },
  { value: "core", label: "Core" },
];

const muscleGroupOptions = [
  { value: "all", label: "All Muscle Groups" },
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "biceps", label: "Biceps" },
  { value: "triceps", label: "Triceps" },
  { value: "legs", label: "Legs (All)" },
  { value: "quads", label: "Quadriceps" },
  { value: "hamstrings", label: "Hamstrings" },
  { value: "glutes", label: "Glutes" },
  { value: "calves", label: "Calves" },
  { value: "core", label: "Core/Abs" },
];

export function ExerciseSuggestionDialog({
  open,
  onOpenChange,
  onExerciseSelect,
  currentExercises = [],
  workoutType,
}: ExerciseSuggestionDialogProps) {
  const [isOpen, setIsOpen] = useState(open || false);
  const [isLoading, setIsLoading] = useState(false);
  const [workoutDay, setWorkoutDay] = useState(workoutType || "general");
  const [muscleGroup, setMuscleGroup] = useState("all");
  const [suggestions, setSuggestions] = useState<ExerciseSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workoutType) {
      setWorkoutDay(workoutType);
    }
  }, [workoutType]);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
    if (isOpen) {
      fetchExerciseSuggestions();
    }
  }, [isOpen, onOpenChange]);

  const fetchExerciseSuggestions = async () => {
    if (!isOpen) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getExerciseSuggestions(
        workoutDay,
        muscleGroup === "all" ? undefined : muscleGroup
      );

      if (response.success && response.data?.suggestions) {
        let suggestions = response.data.suggestions;

        if (currentExercises && currentExercises.length > 0) {
          const currentExerciseNames = currentExercises.map((e) =>
            e.name.toLowerCase()
          );

          suggestions = suggestions.filter(
            (suggestion: ExerciseSuggestion) =>
              !currentExerciseNames.includes(suggestion.name.toLowerCase())
          );
        }

        setSuggestions(suggestions);
      } else {
        setError(response.message || "Failed to get suggestions");
        toast.error("Could not load exercise suggestions");
      }
    } catch (err) {
      console.error("Error fetching exercise suggestions:", err);
      setError("Something went wrong. Please try again.");
      toast.error("Could not load exercise suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkoutDayChange = (value: string) => {
    setWorkoutDay(value);
  };

  const handleMuscleGroupChange = (value: string) => {
    setMuscleGroup(value);
  };

  useEffect(() => {
    if (isOpen) {
      fetchExerciseSuggestions();
    }
  }, [workoutDay, muscleGroup]);

  const handleExerciseSelect = (exercise: ExerciseSuggestion) => {
    if (onExerciseSelect) {
      onExerciseSelect(exercise);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <MagicButton
          variant="outline"
          size="sm"
          hoverScale
          glowColor="rgba(var(--primary-rgb), 0.3)"
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          Exercise Ideas
        </MagicButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle>Exercise Suggestions</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex flex-col gap-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="workoutDay" className="text-sm font-medium block mb-2">
                  Workout Type
                </label>
                <Select value={workoutDay} onValueChange={handleWorkoutDayChange}>
                  <SelectTrigger id="workoutDay" className="w-full">
                    <SelectValue placeholder="Select workout type" />
                  </SelectTrigger>
                  <SelectContent>
                    {workoutDayOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="muscleGroup" className="text-sm font-medium block mb-2">
                  Muscle Group
                </label>
                <Select
                  value={muscleGroup}
                  onValueChange={handleMuscleGroupChange}
                >
                  <SelectTrigger id="muscleGroup" className="w-full">
                    <SelectValue placeholder="Select muscle group" />
                  </SelectTrigger>
                  <SelectContent>
                    {muscleGroupOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No exercise suggestions found for the selected criteria.
                <br />
                Try changing the workout type or muscle group.
              </div>
            ) : (
              <div className="space-y-6">
                {suggestions.map((exercise, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{exercise.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {exercise.description}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            exercise.difficulty === "beginner"
                              ? "outline"
                              : exercise.difficulty === "intermediate"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {exercise.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-semibold">Details:</p>
                          <ul className="list-disc list-inside space-y-1 mt-1">
                            <li>Muscle Group: {exercise.muscleGroup}</li>
                            <li>
                              Recommended: {exercise.recommendedSets} sets ×{" "}
                              {exercise.recommendedReps} reps
                            </li>
                            {exercise.recommendedWeight && (
                              <li>
                                Suggested Weight: {exercise.recommendedWeight}kg
                              </li>
                            )}
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold">Benefits:</p>
                          <ul className="list-disc list-inside space-y-1 mt-1">
                            {exercise.benefits.map((benefit, i) => (
                              <li key={i}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="font-semibold">Form Tips:</p>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          {exercise.formTips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <MagicButton
                        onClick={() => handleExerciseSelect(exercise)}
                        hoverScale
                        glowColor="rgba(var(--primary-rgb), 0.3)"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Exercise
                      </MagicButton>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="flex justify-between border-t pt-4">
          <Button
            onClick={fetchExerciseSuggestions}
            variant="outline"
            disabled={isLoading}
          >
            Refresh Suggestions
          </Button>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
