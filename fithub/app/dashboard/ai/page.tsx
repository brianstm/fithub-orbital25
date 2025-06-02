"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { generateWorkoutPlan, WorkoutGenerationParams } from "@/lib/api";
import { toast } from "sonner";
import {
  Brain,
  Dumbbell,
  Loader2,
  Save,
  Sparkles,
  BarChart3,
  Zap,
  Target,
  Lightbulb,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MagicCard,
  MagicCardContent,
  MagicCardHeader,
} from "@/components/ui/magic-card";
import { MagicButton } from "@/components/ui/magic-button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { ScrollProgress } from "@/components/magicui/scroll-progress";

const workoutGenerationSchema = z.object({
  fitnessLevel: z.string().min(1, "Please select your fitness level"),
  workoutType: z.string().min(1, "Please select a workout type"),
  goals: z.string().optional(),
  duration: z.coerce
    .number()
    .min(10, "Duration must be at least 10 minutes")
    .max(120, "Duration cannot exceed 120 minutes"),
  useHistory: z.boolean().default(true),
});

interface GeneratedWorkout {
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

export default function AITrainerPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] =
    useState<GeneratedWorkout | null>(null);
  const [activeTab, setActiveTab] = useState("generator");

  const form = useForm<z.infer<typeof workoutGenerationSchema>>({
    resolver: zodResolver(workoutGenerationSchema),
    defaultValues: {
      fitnessLevel: "",
      workoutType: "",
      goals: "",
      duration: 45,
      useHistory: true,
    },
  });

  const onSubmit = async (data: z.infer<typeof workoutGenerationSchema>) => {
    setIsGenerating(true);
    try {
      const params: WorkoutGenerationParams = {
        fitnessLevel: data.fitnessLevel,
        workoutType: data.workoutType,
        duration: data.duration,
        useHistory: data.useHistory,
      };

      if (data.goals) {
        params.goals = [data.goals];
      }

      const response = await generateWorkoutPlan(params);

      if (response.data && response.data.success) {
        setGeneratedWorkout(response.data.data);
        setActiveTab("result");
        toast.success("Workout plan generated successfully!");
      } else {
        toast.error("Failed to generate workout plan. Please try again.");
      }
    } catch (error) {
      console.error("Error generating workout plan:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveWorkout = () => {
    if (!generatedWorkout) return;

    // Format workout data for localStorage
    const workoutData = {
      title: generatedWorkout.title,
      description: generatedWorkout.description,
      duration: generatedWorkout.duration,
      exercises:
        generatedWorkout.exercises?.map((exercise) => ({
          name: exercise.name,
          notes: exercise.notes || "",
          sets:
            exercise.sets?.map((set) => ({
              reps: set.reps,
              weight: set.weight || 0,
              type: set.type || "normal",
            })) || [],
        })) || [],
      notes: generatedWorkout.notes || "",
      lastUpdated: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem("newWorkout", JSON.stringify(workoutData));

    setTimeout(() => {
      // Navigate to the new workout page
      router.push("/dashboard/workouts/new");
      toast.success("Transferring workout to editor...");
    }, 100);
  };

  return (
    <div className="space-y-6">
      <BlurFade delay={0} direction="up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-2">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-sm font-medium">AI-Powered</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Smart Trainer
            </h1>
            <p className="text-muted-foreground mt-1">
              Get AI-generated workout plans tailored to your fitness goals
            </p>
          </div>
        </div>
      </BlurFade>

      <BlurFade delay={0.1} direction="up">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto mb-6">
            <TabsTrigger
              value="generator"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <Zap className="h-4 w-4 mr-2" />
              Generator
            </TabsTrigger>
            <TabsTrigger
              value="result"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              disabled={!generatedWorkout}
            >
              <Target className="h-4 w-4 mr-2" />
              Your Workout
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator">
            <div className="grid gap-6 md:grid-cols-5">
              <MagicCard className="md:col-span-3" hoverEffect="border">
                <MagicCardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-primary" />
                    Workout Generator
                  </CardTitle>
                  <CardDescription>
                    Fill in the details below to generate a personalized workout
                    plan
                  </CardDescription>
                </MagicCardHeader>
                <MagicCardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="fitnessLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fitness Level</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="focus:ring-primary focus:border-primary/60">
                                    <SelectValue placeholder="Select your fitness level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="beginner">
                                    Beginner
                                  </SelectItem>
                                  <SelectItem value="intermediate">
                                    Intermediate
                                  </SelectItem>
                                  <SelectItem value="advanced">
                                    Advanced
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="workoutType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Workout Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="focus:ring-primary focus:border-primary/60">
                                    <SelectValue placeholder="Select a workout type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="push">Push</SelectItem>
                                  <SelectItem value="pull">Pull</SelectItem>
                                  <SelectItem value="legs">Legs</SelectItem>
                                  <SelectItem value="push without shoulders">
                                    Push without Shoulders
                                  </SelectItem>
                                  <SelectItem value="pull without shoulders">
                                    Pull without Shoulders
                                  </SelectItem>
                                  <SelectItem value="chest">Chest</SelectItem>
                                  <SelectItem value="back">Back</SelectItem>
                                  <SelectItem value="arms">Arms</SelectItem>
                                  <SelectItem value="shoulders">
                                    Shoulders
                                  </SelectItem>
                                  <SelectItem value="triceps">
                                    Triceps
                                  </SelectItem>
                                  <SelectItem value="biceps">Biceps</SelectItem>
                                  <SelectItem value="strength">
                                    Strength Training
                                  </SelectItem>
                                  <SelectItem value="cardio">Cardio</SelectItem>
                                  <SelectItem value="hiit">HIIT</SelectItem>
                                  <SelectItem value="flexibility">
                                    Flexibility
                                  </SelectItem>
                                  <SelectItem value="general">
                                    General Fitness
                                  </SelectItem>
                                  <SelectItem value="full body">
                                    Full Body
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="goals"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specific Goals (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Build bigger arms, improve endurance"
                                {...field}
                                className="focus:ring-primary focus:border-primary/60"
                              />
                            </FormControl>
                            <FormDescription>
                              Enter any specific goals or areas you want to
                              focus on
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Workout Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                className="focus:ring-primary focus:border-primary/60"
                              />
                            </FormControl>
                            <FormDescription>
                              How long would you like your workout to be (10-120
                              minutes)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end pt-2">
                        <MagicButton
                          type="submit"
                          disabled={isGenerating}
                          hoverScale
                          glowColor="rgba(var(--primary-rgb), 0.5)"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate Workout
                            </>
                          )}
                        </MagicButton>
                      </div>
                    </form>
                  </Form>
                </MagicCardContent>
              </MagicCard>

              <MagicCard className="md:col-span-2" hoverEffect="glow">
                <MagicCardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                    How It Works
                  </CardTitle>
                  <CardDescription>
                    Understanding our AI workout generator
                  </CardDescription>
                </MagicCardHeader>
                <MagicCardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-full">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Personalized Plans</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Our AI analyzes your fitness level and goals to create
                        custom workout plans.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-full">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Progress Tracking</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Workouts are tailored based on your historic performance
                        for optimal progress.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-full">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Exercise Variety</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        The system ensures balanced workouts with proper
                        exercise selection.
                      </p>
                    </div>
                  </div>
                </MagicCardContent>
              </MagicCard>
            </div>
          </TabsContent>

          <TabsContent value="result">
            {generatedWorkout ? (
              <BlurFade delay={0} direction="up">
                <MagicCard hoverEffect="border">
                  <MagicCardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-xl md:text-2xl">
                          {generatedWorkout.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {generatedWorkout.duration} minutes |{" "}
                          {generatedWorkout.exercises?.length || 0} exercises
                        </CardDescription>
                      </div>
                      <MagicButton
                        onClick={saveWorkout}
                        variant="outline"
                        hoverScale
                        glowColor="rgba(var(--primary-rgb), 0.3)"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Workout
                      </MagicButton>
                    </div>
                  </MagicCardHeader>
                  <MagicCardContent>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Description</h3>
                      <p className="text-muted-foreground">
                        {generatedWorkout.description}
                      </p>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Exercises</h3>
                      {generatedWorkout.exercises?.map((exercise, index) => (
                        <BlurFade
                          key={index}
                          delay={0.05 * index}
                          direction="up"
                        >
                          <MagicCard className="overflow-hidden">
                            <MagicCardContent className="p-0">
                              <div className="flex flex-col md:flex-row">
                                <div className="bg-primary/10 p-4 md:w-1/6 flex items-center justify-center">
                                  <div className="font-bold text-xl text-primary">
                                    {index + 1}
                                  </div>
                                </div>
                                <div className="p-4 md:w-5/6">
                                  <h4 className="font-semibold text-lg mb-2">
                                    {exercise.name}
                                  </h4>

                                  <div className="space-y-2 mt-4">
                                    <h5 className="text-sm font-medium text-muted-foreground">
                                      Sets:
                                    </h5>
                                    {exercise.sets?.map((set, setIndex) => (
                                      <div
                                        key={setIndex}
                                        className="flex items-center gap-2 text-sm"
                                      >
                                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
                                          Set {setIndex + 1}
                                        </span>
                                        <span>
                                          {set.reps}{" "}
                                          {set.type === "time"
                                            ? "seconds"
                                            : "reps"}
                                          {set.weight
                                            ? ` • ${set.weight} kg`
                                            : ""}
                                        </span>
                                        {set.notes && (
                                          <span className="text-muted-foreground ml-2">
                                            ({set.notes})
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>

                                  {exercise.notes && (
                                    <div className="mt-4 text-sm text-muted-foreground">
                                      <span className="font-medium">
                                        Notes:
                                      </span>{" "}
                                      {exercise.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </MagicCardContent>
                          </MagicCard>
                        </BlurFade>
                      ))}
                    </div>

                    {generatedWorkout.notes && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">
                          Additional Notes
                        </h3>
                        <p className="text-muted-foreground">
                          {generatedWorkout.notes}
                        </p>
                      </div>
                    )}
                  </MagicCardContent>
                </MagicCard>
              </BlurFade>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-6">
                    Generate a workout plan to see results here
                  </p>
                  <Button
                    onClick={() => setActiveTab("generator")}
                    variant="outline"
                  >
                    Go to Generator
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </BlurFade>
    </div>
  );
}
