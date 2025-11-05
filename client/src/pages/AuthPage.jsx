import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const { state, login, register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const { username, email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    let success = false;

    if (isRegister) {
      success = await register(username, email, password);
    } else {
      success = await login(email, password);
    }

    if (success) {
      setFormData({ username: "", email: "", password: "" });
    }
  };

  if (state.loading && state.isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white text-2xl">
        Authentication successful, redirecting...
      </div>
    );
  }

  return (
    <motion.div
      className="flex justify-center items-center min-h-screen bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.form
        onSubmit={onSubmit}
        className="p-8 bg-gray-800 rounded-xl shadow-2xl w-full max-w-md text-white"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h2 className="text-3xl font-bold text-center mb-6">
          {isRegister ? "Register" : "Login"}
        </h2>

        {state.error && (
          <motion.p
            className="text-red-400 text-center mb-4 bg-red-900/30 p-2 rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {state.error}
          </motion.p>
        )}

        {isRegister && (
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={username}
            onChange={onChange}
            required
            className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={onChange}
          required
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={onChange}
          required
          minLength="6"
          className="w-full p-3 mb-6 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500"
        />

        <motion.button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={state.loading}
        >
          {state.loading ? "Processing..." : isRegister ? "Register" : "Login"}
        </motion.button>

        <p className="mt-6 text-center text-gray-400">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <span
            className="text-blue-400 cursor-pointer hover:text-blue-300 ml-2"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </motion.form>
    </motion.div>
  );
};

export default AuthPage;
