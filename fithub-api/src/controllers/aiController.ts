import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Workout, { IExercise, ISet } from '../models/Workout';

// Add these interfaces at the top of the file, after the imports
interface WeeklyData {
  count: number;
  totalDuration: number;
  exercises: number;
}

interface MonthlyData {
  count: number;
  totalDuration: number;
  exercises: number;
}

interface ExerciseDistribution {
  count: number;
  totalSets: number;
  totalReps: number;
  totalWeight: number;
}

interface ExerciseCount {
  count: number;
  totalWeight: number;
  weightCount: number;
}

// Define types for workout history
interface WorkoutExerciseSet {
  reps: number;
  weight?: number;
  type?: string;
}

interface WorkoutExercise {
  name: string;
  sets: WorkoutExerciseSet[];
}

interface WorkoutHistoryItem {
  title: string;
  exercises: WorkoutExercise[];
  date: Date;
}

// Initialize Gemini API
const initializeGeminiApi = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Add validation functions at the top
const validateWorkoutGeneration = (duration: number, fitnessLevel: string, workoutType: string) => {
  if (!duration || duration <= 0) return false;
  if (!fitnessLevel || !['beginner', 'intermediate', 'advanced'].includes(fitnessLevel))
    return false;
  return true;
};

const validateWorkoutSuggestions = (
  fitnessLevel: string,
  focus: string,
  duration: number,
  workoutDay?: string
) => {
  if (!fitnessLevel || !['beginner', 'intermediate', 'advanced'].includes(fitnessLevel))
    return false;
  if (!focus || !['strength', 'cardio', 'flexibility', 'hypertrophy'].includes(focus)) return false;
  if (!duration || duration <= 0) return false;
  if (
    workoutDay &&
    !['general', 'push', 'pull', 'legs', 'upper', 'lower', 'fullbody', 'cardio'].includes(
      workoutDay
    )
  )
    return false;
  return true;
};

// Add validation function for exercise suggestions
const validateExerciseSuggestions = (workoutDay?: string, muscleGroup?: string) => {
  if (!workoutDay) return false;
  if (!['general', 'push', 'pull', 'legs', 'upper', 'lower', 'cardio', 'core'].includes(workoutDay))
    return false;
  if (
    muscleGroup &&
    ![
      'chest',
      'back',
      'shoulders',
      'biceps',
      'triceps',
      'legs',
      'quads',
      'hamstrings',
      'glutes',
      'calves',
      'core',
    ].includes(muscleGroup)
  )
    return false;
  return true;
};

// Helper function to call Gemini API
const callGeminiApi = async (prompt: string) => {
  try {
    const genAI = initializeGeminiApi();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Try to parse the response as JSON
    try {
      const jsonMatch = text.match(/(\[|\{)[\s\S]*(\]|\})/);
      const jsonString = jsonMatch ? jsonMatch[0] : text;
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing Gemini response as JSON:', parseError);
      throw new Error('Could not parse AI response as JSON');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};

// Function to generate prompt for workout suggestions
const generateWorkoutSuggestionPrompt = (
  fitnessLevel: string,
  focus: string,
  duration: number,
  workoutHistory: WorkoutHistoryItem[],
  workoutDay?: string
) => {
  let historyContext = '';

  if (workoutHistory && workoutHistory.length > 0) {
    historyContext = `User's recent workout history:\n${JSON.stringify(
      workoutHistory,
      null,
      2
    )}\n\n`;
  }

  return `Generate a detailed workout plan with the following parameters:
    - Fitness Level: ${fitnessLevel} (beginner/intermediate/advanced)
    - Focus Area: ${focus} (e.g., strength, cardio, flexibility, hypertrophy)
    - Duration: ${duration} minutes
    - Workout Day: ${workoutDay || 'general'} (e.g., general, push, pull, legs, etc.)
    
    ${historyContext}
    
    Return the response as a structured workout plan that follows this exact format:
    {
      "title": "Workout title",
      "description": "Brief description of the workout and why it's beneficial for this day type (${
        workoutDay || 'general'
      })",
      "duration": ${duration},
      "exercises": [
        {
          "name": "Exercise name",
          "sets": [
            {
              "reps": number,
              "weight": number (in kg),
              "type": "normal" | "warm_up" | "drop_set" | "failure",
              "notes": "optional notes for this set, including form guidance"
            }
          ],
          "notes": "explanation of why this exercise is good and how to perform it correctly"
        }
      ],
      "notes": "optional overall workout notes"
    }
    
    Guidelines:
    1. Include 4-8 exercises depending on the duration
    2. Each exercise should have 3-5 sets
    3. For beginners, use more "normal" sets and include detailed notes
    4. For advanced users, incorporate different set types (warm_up, drop_set, failure)
    5. Ensure the total duration matches the requested duration
    6. Include appropriate weights and reps based on the fitness level
    7. For each exercise, provide a brief explanation of proper form and why it's beneficial
    8. If the workout is for a specific day type (e.g., push, pull, legs), focus on exercises that target those muscle groups
  `;
};

// Get AI-generated workout suggestions
export const getWorkoutSuggestions = async (req: Request, res: Response) => {
  try {
    // Extract parameters from the request
    const { fitnessLevel, focus, duration, workoutDay } = req.query;

    // Validate required parameters
    if (!fitnessLevel || !focus || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: fitnessLevel, focus, and duration are required',
      });
    }

    // Validate specific parameters
    const validFitnessLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validFitnessLevels.includes(fitnessLevel as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fitnessLevel. Must be beginner, intermediate, or advanced.',
      });
    }

    // Get user's workout history if they're authenticated
    const userId = req.user?._id;
    let workoutHistory: WorkoutHistoryItem[] = [];

    if (userId) {
      workoutHistory = (await Workout.find({ user: userId })
        .sort({ date: -1 })
        .limit(5)
        .select('title exercises date')
        .lean()) as WorkoutHistoryItem[];
    }

    // Convert duration to number
    const durationMinutes = parseInt(duration as string, 10);

    // Call the Gemini API to generate workout suggestions
    const prompt = generateWorkoutSuggestionPrompt(
      fitnessLevel as string,
      focus as string,
      durationMinutes,
      workoutHistory,
      workoutDay as string | undefined
    );

    const geminiResponse = await callGeminiApi(prompt);

    // Process and return the response
    return res.status(200).json({
      success: true,
      data: {
        suggestion: geminiResponse,
      },
    });
  } catch (error) {
    console.error('Error generating workout suggestions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate workout suggestions',
    });
  }
};

// Generate user profile summary
export const getUserProfileSummary = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get user's workout history
    const workouts = await Workout.find({ user: req.user.id });

    if (workouts.length === 0) {
      return res.json({
        success: true,
        data: {
          summary:
            'Not enough workout data to generate a profile summary. Start logging your workouts to get personalized insights!',
          stats: {
            totalWorkouts: 0,
            totalDuration: 0,
            avgDuration: 0,
            topExercises: [],
            fitnessScore: 0,
            consistencyScore: 0,
            progressScore: 0,
            weeklyStats: [],
            monthlyStats: [],
            exerciseDistribution: {},
            workoutTrends: {
              increasing: [],
              decreasing: [],
              stable: [],
            },
          },
        },
      });
    }

    // Calculate basic stats
    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0);
    const avgDuration = Math.round(totalDuration / totalWorkouts);

    // Calculate weekly and monthly stats
    const weeklyStats = calculateWeeklyStats(workouts);
    const monthlyStats = calculateMonthlyStats(workouts);

    // Calculate exercise distribution
    const exerciseDistribution = calculateExerciseDistribution(workouts);

    // Calculate top exercises with more details
    const topExercises = calculateTopExercises(workouts);

    // Generate prompt for Gemini to analyze scores and trends
    const analysisPrompt = `Analyze this user's workout data and provide detailed insights:

      Workout History:
      - Total workouts: ${totalWorkouts}
      - Average duration: ${avgDuration} minutes
      - Total duration: ${totalDuration} minutes
      
      Top Exercises:
      ${topExercises
        .map(ex => `- ${ex.name}: ${ex.count} times, avg weight: ${ex.avgWeight}kg`)
        .join('\n')}
      
      Exercise Distribution:
      ${Object.entries(exerciseDistribution)
        .map(
          ([name, data]) =>
            `- ${name}: ${data.count} times, ${data.totalSets} sets, ${
              data.totalReps
            } reps, avg weight: ${data.totalWeight / data.count}kg`
        )
        .join('\n')}
      
      Monthly Progress:
      ${monthlyStats
        .map(
          stat =>
            `- ${stat.month}: ${stat.workouts} workouts, ${stat.duration} minutes, ${stat.exercises} exercises`
        )
        .join('\n')}
      
      Weekly Activity:
      ${weeklyStats
        .map(
          stat =>
            `- Week ${stat.week}: ${stat.workouts} workouts, ${stat.duration} minutes, ${stat.exercises} exercises`
        )
        .join('\n')}
      
      Please provide:
      1. A fitness score (0-100) based on:
         - Workout frequency and consistency
         - Exercise variety and intensity
         - Overall progress and dedication
      2. A consistency score (0-100) based on:
         - Regular workout schedule
         - Exercise selection patterns
         - Recovery and rest patterns
      3. A progress score (0-100) based on:
         - Weight and rep improvements
         - Exercise mastery
         - Overall strength gains
      4. Identify exercises that are:
         - Improving (increasing weights/reps)
         - Declining (decreasing weights/reps)
         - Stable (consistent performance)
      5. A personalized summary (max 200 words) that includes:
         - Key strengths and achievements
         - Areas for improvement
         - Specific recommendations
         - Motivational insights
      
      Return the response as a JSON object with this structure:
      {
        "scores": {
          "fitness": number,
          "consistency": number,
          "progress": number
        },
        "trends": {
          "increasing": string[],
          "decreasing": string[],
          "stable": string[]
        },
        "summary": string
      }
    `;

    try {
      // Generate response using Gemini API
      const genAI = initializeGeminiApi();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(analysisPrompt);
      const response = result.response;
      const text = response.text();

      // Parse the Gemini response
      let analysis;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : text;
        analysis = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error parsing Gemini response as JSON:', parseError);
        return res.status(500).json({
          message: 'Error parsing AI analysis',
          error: parseError instanceof Error ? parseError.message : 'Unknown error',
        });
      }

      return res.json({
        success: true,
        data: {
          summary: analysis.summary,
          stats: {
            totalWorkouts,
            totalDuration,
            avgDuration,
            topExercises,
            fitnessScore: analysis.scores.fitness,
            consistencyScore: analysis.scores.consistency,
            progressScore: analysis.scores.progress,
            weeklyStats,
            monthlyStats,
            exerciseDistribution,
            workoutTrends: analysis.trends,
            fitnessStyles: {
              calisthenics: Math.min(85, Math.floor(Math.random() * 50) + 20),
              bodybuilding: Math.min(85, Math.floor(Math.random() * 50) + 20),
              powerlifting: Math.min(85, Math.floor(Math.random() * 50) + 20),
              endurance: Math.min(85, Math.floor(Math.random() * 50) + 20),
              flexibility: Math.min(85, Math.floor(Math.random() * 50) + 20),
              hiit: Math.min(85, Math.floor(Math.random() * 50) + 20),
            },
          },
        },
      });
    } catch (error) {
      console.error('Error generating profile summary with Gemini API:', error);
      return res.status(500).json({
        message: 'Error generating profile summary',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } catch (error) {
    console.error('Error in profile summary controller:', error);
    res.status(500).json({ message: 'Server error while generating profile summary' });
  }
};

// Update the helper functions with proper typing
function calculateWeeklyStats(workouts: any[]) {
  const weeklyData: Record<number, WeeklyData> = {};
  workouts.forEach(workout => {
    const week = getWeekNumber(workout.date);
    if (!weeklyData[week]) {
      weeklyData[week] = {
        count: 0,
        totalDuration: 0,
        exercises: 0,
      };
    }
    weeklyData[week].count++;
    weeklyData[week].totalDuration += workout.duration;
    weeklyData[week].exercises += workout.exercises.length;
  });
  return Object.entries(weeklyData).map(([week, data]) => ({
    week,
    workouts: data.count,
    duration: data.totalDuration,
    exercises: data.exercises,
  }));
}

function calculateMonthlyStats(workouts: any[]) {
  const monthlyData: Record<string, MonthlyData> = {};
  workouts.forEach(workout => {
    const month = new Date(workout.date).toISOString().slice(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = {
        count: 0,
        totalDuration: 0,
        exercises: 0,
      };
    }
    monthlyData[month].count++;
    monthlyData[month].totalDuration += workout.duration;
    monthlyData[month].exercises += workout.exercises.length;
  });
  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    workouts: data.count,
    duration: data.totalDuration,
    exercises: data.exercises,
  }));
}

function calculateExerciseDistribution(workouts: any[]) {
  const distribution: Record<string, ExerciseDistribution> = {};
  workouts.forEach(workout => {
    workout.exercises.forEach((exercise: { name: string; sets: any[] }) => {
      if (!distribution[exercise.name]) {
        distribution[exercise.name] = {
          count: 0,
          totalSets: 0,
          totalReps: 0,
          totalWeight: 0,
        };
      }
      distribution[exercise.name].count++;
      distribution[exercise.name].totalSets += exercise.sets.length;
      exercise.sets.forEach((set: { reps: number; weight?: number }) => {
        distribution[exercise.name].totalReps += set.reps;
        if (set.weight) {
          distribution[exercise.name].totalWeight += set.weight;
        }
      });
    });
  });
  return distribution;
}

function calculateTopExercises(workouts: any[]) {
  const exerciseCounts: Record<string, ExerciseCount> = {};
  workouts.forEach(workout => {
    workout.exercises.forEach((exercise: { name: string; sets: any[] }) => {
      if (!exerciseCounts[exercise.name]) {
        exerciseCounts[exercise.name] = {
          count: 0,
          totalWeight: 0,
          weightCount: 0,
        };
      }
      exerciseCounts[exercise.name].count++;
      exercise.sets.forEach((set: { weight?: number }) => {
        if (set.weight) {
          exerciseCounts[exercise.name].totalWeight += set.weight;
          exerciseCounts[exercise.name].weightCount++;
        }
      });
    });
  });

  return Object.entries(exerciseCounts)
    .map(([name, data]) => ({
      name,
      count: data.count,
      avgWeight: data.weightCount > 0 ? Math.round(data.totalWeight / data.weightCount) : null,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function getWeekNumber(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  );
}

// Generate complete workout plan
export const generateWorkoutPlan = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { duration, fitnessLevel, workoutType, useHistory = true } = req.body;

    // Validate input
    if (!validateWorkoutGeneration(duration, fitnessLevel, workoutType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input parameters',
      });
    }

    // Get user's past workouts for context if useHistory is true
    let pastWorkoutsText = '';
    if (useHistory) {
      const pastWorkouts = await Workout.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .limit(3);

      if (pastWorkouts.length > 0) {
        pastWorkoutsText = 'Recent workout history:\n';
        pastWorkouts.forEach((workout, index) => {
          pastWorkoutsText += `Workout ${index + 1}: ${workout.title} - `;
          workout.exercises.forEach(exercise => {
            pastWorkoutsText += `${exercise.name} (${exercise.sets.length} sets: `;
            exercise.sets.forEach((set, i) => {
              pastWorkoutsText += `Set ${i + 1}: ${set.reps} reps`;
              if (set.weight) pastWorkoutsText += ` at ${set.weight}kg`;
              if (set.type !== 'normal') pastWorkoutsText += ` (${set.type})`;
              if (i < exercise.sets.length - 1) pastWorkoutsText += ', ';
            });
            pastWorkoutsText += '), ';
          });
          pastWorkoutsText += '\n';
        });
      }
    }

    // Generate AI prompt
    const prompt = `Generate a complete, detailed, and structured workout plan with the following parameters:
      - Duration: ${duration} minutes
      - Fitness Level: ${fitnessLevel} (beginner/intermediate/advanced)
      - Workout Type: ${workoutType} (push, pull, legs, upper, lower, full, cardio, or hiit)
      
      ${pastWorkoutsText}
      
      Return the response as JSON with the following structure:
      {
        "title": "Workout title",
        "description": "Brief description of the workout",
        "duration": ${duration},
        "exercises": [
          {
            "name": "Exercise name",
            "sets": [
              {
                "reps": number,
                "weight": number (in kg),
                "type": "normal" | "warm_up" | "drop_set" | "failure",
                "notes": "optional notes for this set"
              }
            ],
            "notes": "optional notes for this exercise"
          }
        ],
        "notes": "optional overall workout notes"
      }
      
      Guidelines:
      1. Include 4-8 exercises depending on the duration
      2. Each exercise should have 3-5 sets
      3. For beginners, use more "normal" sets and include detailed notes
      4. For advanced users, incorporate different set types (warm_up, drop_set, failure)
      5. Ensure the total duration matches the requested duration
      6. Include appropriate weights and reps based on the fitness level
      7. For cardio exercises, use "duration" instead of "reps" in sets
      8. For bodyweight exercises, omit the "weight" field
    `;

    try {
      // Generate response using Gemini API
      const genAI = initializeGeminiApi();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Try to parse the response as JSON
      let workoutPlan;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : text;
        workoutPlan = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error parsing Gemini response as JSON:', parseError);
        return res.json({
          success: true,
          data: {
            rawResponse: text,
            error: 'Could not parse AI response as JSON. Please try again.',
          },
        });
      }

      return res.json({
        success: true,
        data: workoutPlan,
      });
    } catch (error) {
      console.error('Error generating workout plan with Gemini API:', error);
      return res.status(500).json({
        message: 'Error generating workout plan',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } catch (error) {
    console.error('Error in workout plan controller:', error);
    res.status(500).json({ message: 'Server error while generating workout plan' });
  }
};

// Get AI-generated exercise suggestions
export const getExerciseSuggestions = async (req: Request, res: Response) => {
  try {
    // Extract parameters from the request
    const { workoutDay, muscleGroup } = req.query;

    // Validate parameters using the validation function
    if (!validateExerciseSuggestions(workoutDay as string, muscleGroup as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input parameters',
      });
    }

    // Get user's workout history if they're authenticated
    const userId = req.user?._id;
    let workoutHistory: WorkoutHistoryItem[] = [];

    if (userId) {
      workoutHistory = (await Workout.find({ user: userId })
        .sort({ date: -1 })
        .limit(5)
        .select('title exercises date')
        .lean()) as WorkoutHistoryItem[];
    }

    // Call the Gemini API to generate exercise suggestions
    const prompt = generateExerciseSuggestionPrompt(
      workoutDay as string,
      muscleGroup as string | undefined,
      workoutHistory
    );

    const geminiResponse = await callGeminiApi(prompt);

    // Process and return the response
    return res.status(200).json({
      success: true,
      data: {
        suggestions: geminiResponse,
      },
    });
  } catch (error) {
    console.error('Error generating exercise suggestions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate exercise suggestions',
    });
  }
};

// Function to generate prompt for exercise suggestions
const generateExerciseSuggestionPrompt = (
  workoutDay: string,
  muscleGroup: string | undefined,
  workoutHistory: any[]
) => {
  let historyContext = '';

  if (workoutHistory && workoutHistory.length > 0) {
    historyContext = `User's recent workout history:\n${JSON.stringify(
      workoutHistory,
      null,
      2
    )}\n\n`;
  }

  let muscleGroupFilter = '';
  if (muscleGroup && muscleGroup !== '') {
    muscleGroupFilter = `that target the ${muscleGroup} muscle group `;
  }

  return `
  You are a professional fitness coach. I need you to suggest 5 exercises ${muscleGroupFilter}that would be appropriate for a ${workoutDay} workout day.
  
  ${historyContext}
  
  For each exercise, provide:
  1. Name
  2. Short description
  3. Primary muscle group targeted
  4. Difficulty level (beginner, intermediate, or advanced)
  5. Recommended sets
  6. Recommended reps
  7. 2-3 form tips to ensure proper execution
  8. 2-3 benefits of the exercise
  9. optional notes for this exercise

  Return the response as a JSON array with this structure:
  [
    {
      "name": "Exercise Name",
      "description": "Brief description",
      "muscleGroup": "Primary muscle group",
      "difficulty": "beginner|intermediate|advanced",
      "recommendedSets": 3,
      "recommendedReps": 10,
      "formTips": ["Tip 1", "Tip 2", "Tip 3"],
      "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
      "notes": "optional notes for this exercise"
    },
    ...
  ]
  
  Ensure all exercises are recognized, effective exercises for the requested workout day. Vary the difficulty levels to provide options for users at different fitness levels.
  `;
};
