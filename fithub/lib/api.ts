import axios from "@/lib/axios";

// Auth API
export const loginUser = (email: string, password: string) => {
  return axios.post("/api/auth/login", { email, password });
};

export const registerUser = (name: string, email: string, password: string) => {
  return axios.post("/api/auth/register", { name, email, password });
};

export const fetchUserProfile = () => {
  return axios.get("/api/auth/profile");
};

// User API
export const fetchUsers = () => {
  return axios.get("/api/users");
};

export const fetchUserById = (userId: string) => {
  return axios.get(`/api/users/${userId}`);
};

export const updateUser = (userId: string, userData: any) => {
  return axios.put(`/api/users/${userId}`, userData);
};

export const deleteUser = (userId: string) => {
  return axios.delete(`/api/users/${userId}`);
};

// Gym API
export const fetchGyms = () => {
  return axios.get("/api/gyms");
};

export const fetchGymById = (gymId: string) => {
  return axios.get(`/api/gyms/${gymId}`);
};

export const createGym = (gymData: any) => {
  return axios.post("/api/gyms", gymData);
};

export const updateGym = (gymId: string, gymData: any) => {
  return axios.put(`/api/gyms/${gymId}`, gymData);
};

export const deleteGym = (gymId: string) => {
  return axios.delete(`/api/gyms/${gymId}`);
};

// Booking API
export const fetchUserBookings = () => {
  return axios.get("/api/bookings");
};

export const fetchBookingById = (bookingId: string) => {
  return axios.get(`/api/bookings/${bookingId}`);
};

export const createBooking = (bookingData: any) => {
  return axios.post("/api/bookings", bookingData);
};

export const updateBookingStatus = (bookingId: string, status: string) => {
  return axios.patch(`/api/bookings/${bookingId}/status`, { status });
};

export const cancelBooking = (bookingId: string) => {
  return axios.patch(`/api/bookings/${bookingId}/status`, {
    status: "cancelled",
  });
};

// Workout API
export const fetchUserWorkouts = () => {
  return axios.get("/api/workouts");
};

export const fetchWorkoutById = (workoutId: string) => {
  return axios.get(`/api/workouts/${workoutId}`);
};

export const createWorkout = (workoutData: any) => {
  return axios.post("/api/workouts", workoutData);
};

export const updateWorkout = (workoutId: string, workoutData: any) => {
  return axios.put(`/api/workouts/${workoutId}`, workoutData);
};

export const deleteWorkout = (workoutId: string) => {
  return axios.delete(`/api/workouts/${workoutId}`);
};

// Post API
export const fetchPosts = () => {
  return axios.get("/api/posts");
};

export const fetchUserPosts = () => {
  return axios.get("/api/posts/my-posts");
};

export const fetchPostById = (postId: string) => {
  return axios.get(`/api/posts/${postId}`);
};

export const createPost = (postData: any) => {
  return axios.post("/api/posts", postData);
};

export const updatePost = (postId: string, postData: any) => {
  return axios.put(`/api/posts/${postId}`, postData);
};

export const deletePost = (postId: string) => {
  return axios.delete(`/api/posts/${postId}`);
};

export const likePost = (postId: string) => {
  return axios.post(`/api/posts/${postId}/like`);
};

export const commentOnPost = async (postId: string, content: string) => {
  return axios.post(`/api/posts/${postId}/comments`, { content });
};

export const editComment = async (
  postId: string,
  commentId: string,
  content: string
) => {
  return axios.put(`/api/posts/${postId}/comments/${commentId}`, { content });
};

export const updatePostImages = async (
  postId: string,
  data: { images?: string[]; removeImages?: string[] }
) => {
  return axios.put(`/api/posts/${postId}/images`, data);
};

// AI API
export interface WorkoutGenerationParams {
  fitnessLevel: string;
  workoutType: string;
  duration: number;
  useHistory: boolean;
  goals?: [string];
}

export const generateWorkoutPlan = (params: WorkoutGenerationParams) => {
  const formattedParams = {
    fitnessLevel: params.fitnessLevel,
    workoutType: params.workoutType,
    duration: Number(params.duration),
    useHistory: Boolean(params.useHistory),
    goals: params.goals || params.workoutType,
  };

  return axios.post("/api/ai/generate-workout", formattedParams);
};

export const analyzeWorkoutForm = (data: any) => {
  return axios.post("/api/ai/analyze-form", data);
};

// Upload API
export const uploadImage = (file: File, folder?: string) => {
  const formData = new FormData();
  formData.append("image", file);
  if (folder) {
    formData.append("folder", folder);
  }

  return axios.post("/api/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadProfileImage = (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  return axios.post("/api/upload/profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteUploadedFile = (filename: string) => {
  return axios.delete(`/api/upload/${filename}`);
};

export const getUserProfileSummary = async () => {
  return await axios.get("/api/ai/user-profile-summary");
};

export const getWorkoutSuggestions = async (
  fitnessLevel: string,
  focus: string,
  duration: number,
  workoutDay?: string
) => {
  try {
    const params = new URLSearchParams({
      fitnessLevel,
      focus,
      duration: duration.toString(),
    });

    if (workoutDay) {
      params.append("workoutDay", workoutDay);
    }

    const response = await axios.get(
      `/api/ai/workout-suggestions?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting workout suggestions:", error);
    return {
      success: false,
      message: "Failed to get workout suggestions",
    };
  }
};

export const getExerciseSuggestions = async (
  workoutDay: string,
  muscleGroup?: string
) => {
  try {
    const params = new URLSearchParams();
    params.append("workoutDay", workoutDay);
    if (muscleGroup) {
      params.append("muscleGroup", muscleGroup);
    }

    const response = await axios.get(
      `/api/ai/exercise-suggestions?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching exercise suggestions:", error);
    throw error;
  }
};

// Badge API
export const fetchUserBadges = () => {
  return axios.get("/api/badges/my-badges");
};

export const checkUserBadges = () => {
  return axios.post("/api/badges/check");
};

export const fetchLeaderboards = () => {
  return axios.get("/api/badges/leaderboards");
};

export const fetchUserStats = () => {
  return axios.get("/api/badges/my-stats");
};

export const fetchBadgeDefinitions = () => {
  return axios.get("/api/badges/definitions");
};
