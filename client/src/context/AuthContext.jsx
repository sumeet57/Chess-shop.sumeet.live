import React, { createContext, useReducer, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Required for global redirect on 401

const AuthContext = createContext();

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

// 1. DEFINE authReducer FIRST
function authReducer(state, action) {
  switch (action.type) {
    case "USER_LOADED":
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
        error: null,
      };
    case "AUTH_ERROR":
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload || null,
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

const API_BASE_URL = "http://localhost:5000/api";

// Create a globally configured Axios instance for all requests requiring cookies
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 2. DEFINE AuthProvider SECOND (using the reducer)
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // New Global Logout/Redirect Function
  const logout = (redirect = true) => {
    // 1. Clear client-side state
    dispatch({ type: "LOGOUT" });

    // 2. Optionally, hit a server endpoint to manually clear the cookie (highly recommended)
    // You would need to implement POST /api/user/logout on the server to clear res.clearCookie('token')

    // 3. Redirect
    if (redirect) {
      navigate("/auth");
    }
  };

  // --- Axios Interceptor Setup ---
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Intercept 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
          console.warn("401 Unauthorized received. Triggering global logout.");
          // If a request fails due to 401 (expired/invalid cookie), log out immediately.
          logout();
        }
        return Promise.reject(error);
      }
    );

    // Cleanup the interceptor on unmount
    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  // --- Core Auth Functions ---
  const loadUser = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Use axiosInstance
      const res = await axiosInstance.get("/user");
      dispatch({ type: "USER_LOADED", payload: res.data });
    } catch (err) {
      // The interceptor will handle the 401. This catch handles other load failures.
      dispatch({ type: "AUTH_ERROR", payload: "No user authenticated" });
    }
  };

  const login = async (email, password) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Use axiosInstance
      await axiosInstance.post("/user/login", { email, password });
      await loadUser();
      return true;
    } catch (err) {
      const msg = err.response?.data?.msg || "Login failed";
      dispatch({ type: "AUTH_ERROR", payload: msg });
      return false;
    }
  };

  const register = async (username, email, password) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Use axiosInstance
      await axiosInstance.post("/user/register", { username, email, password });
      await loadUser();
      return true;
    } catch (err) {
      const msg = err.response?.data?.msg || "Registration failed";
      dispatch({ type: "AUTH_ERROR", payload: msg });
      return false;
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
