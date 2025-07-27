import axios from "axios";

const instance = axios.create({
  baseURL: "https://fithub-orbital25.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the auth token to requests
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // If token exists, add it to the Authorization header
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `Axios Request [${config.method?.toUpperCase()}] ${config.url}`,
        {
          headers: config.headers,
          data: config.data,
        }
      );
    }

    return config;
  },
  (error) => {
    console.error("Axios Request Error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
instance.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `Axios Response [${response.status}] ${response.config.url}`,
        {
          data: response.data,
        }
      );
    }
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `Axios Error [${error.response.status}] ${error.config?.url}`,
        {
          data: error.response.data,
          headers: error.response.headers,
          request: {
            method: error.config?.method?.toUpperCase(),
            data: error.config?.data,
          },
        }
      );
    } else if (error.request) {
      console.error("Axios Error: No response received", error.request);
    } else {
      console.error("Axios Error:", error.message);
    }

    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default instance;
