import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GameProvider } from "./context/GameContext";
import AuthPage from "./pages/AuthPage";
import GamePage from "./pages/GamePage";
import Profile from "./pages/Profile";

const PrivateRoute = ({ children }) => {
  const { state } = useAuth();

  if (state.loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white text-2xl">
        Loading...
      </div>
    );
  }

  return state.isAuthenticated ? children : <Navigate to="/auth" />;
};

const PublicRoute = ({ children }) => {
  const { state } = useAuth();

  if (state.loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white text-2xl">
        Loading...
      </div>
    );
  }

  if (state.isAuthenticated) {
    // If user is authenticated, redirect them away from the auth page to home
    return <Navigate to="/" replace />;
  }

  // If not authenticated, render the children (AuthPage)
  return children;
};

const AppContent = () => {
  const { state: authState } = useAuth();

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      <Route
        path="/"
        element={
          <PrivateRoute>
            {authState.user ? (
              <GameProvider currentUserId={authState.user._id}>
                <GamePage />
              </GameProvider>
            ) : (
              <p className="text-white">User data loading...</p>
            )}
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
