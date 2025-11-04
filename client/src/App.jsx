import React, { useState } from "react";

const CardIcon = ({ children, color }) => (
  <div
    className={`p-4 rounded-xl ${color} shadow-sm mb-4 flex items-center justify-center w-14 h-14 mx-auto md:mx-0`}
  >
    {children}
  </div>
);

const FeatureCard = ({ title, description, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 text-center md:text-left">
    <CardIcon color={color}>
      <span className="text-2xl">{icon}</span>
    </CardIcon>
    <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </div>
);

const SignupModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Create your account
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Unlock multiplayer, match history, and personalized AI challenges.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
          }}
        >
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full p-3 mb-3 bg-gray-100 rounded-lg text-gray-900 border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full p-3 mb-4 bg-gray-100 rounded-lg text-gray-900 border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-sm"
          />
          <button
            type="submit"
            className="w-full bg-amber-600 text-white font-semibold py-2.5 rounded-lg hover:bg-amber-700 transition duration-200 text-sm"
          >
            Sign Up
          </button>
        </form>
        <button
          onClick={onClose}
          className="mt-3 w-full text-gray-500 hover:text-amber-600 text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const Header = ({ openModal }) => (
  <header className="fixed top-0 left-0 w-full z-20 bg-white/90 backdrop-blur-md border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      <div className="text-xl font-semibold text-gray-900 tracking-tight">
        Quantum<span className="text-amber-600">Chess</span>
      </div>
      <nav className="hidden md:flex space-x-8 text-sm">
        <a
          href="#features"
          className="text-gray-600 hover:text-amber-600 transition"
        >
          Features
        </a>
        <a
          href="#history"
          className="text-gray-600 hover:text-amber-600 transition"
        >
          History
        </a>
        <a href="#" className="text-gray-600 hover:text-amber-600 transition">
          Pricing
        </a>
      </nav>
      <div className="flex items-center space-x-3">
        <button className="text-gray-600 hover:text-amber-600 text-sm hidden sm:inline-block">
          Log In
        </button>
        <button
          onClick={openModal}
          className="bg-amber-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-amber-700 transition duration-200"
        >
          Sign Up
        </button>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-white border-t border-gray-200">
    <div className="max-w-7xl mx-auto py-8 px-4 text-center">
      <p className="text-gray-500 text-sm">
        © 2025 QuantumChess. Built for strategic minds.
      </p>
      <div className="mt-3 space-x-4 text-xs text-gray-400">
        <a href="#" className="hover:text-amber-600">
          Terms
        </a>
        <a href="#" className="hover:text-amber-600">
          Privacy
        </a>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 font-inter">
      <Header openModal={() => setIsModalOpen(true)} />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative pt-20 pb-24 text-center px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
              Elevate Your <span className="text-amber-600">Chess</span> Journey
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Play against smart AI, challenge friends, and analyze your moves —
              all in one elegant platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-amber-600 text-white text-sm font-semibold py-3 px-8 rounded-lg hover:bg-amber-700 shadow-md transition">
                Play Instantly
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-white text-amber-600 border border-amber-300 text-sm font-semibold py-3 px-8 rounded-lg hover:bg-amber-50 transition"
              >
                Log In / Sign Up
              </button>
            </div>
          </div>

          {/* Background Glow */}
          <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
            <div className="w-80 h-80 bg-amber-100 rounded-full blur-3xl absolute top-10 left-1/3"></div>
            <div className="w-64 h-64 bg-emerald-100 rounded-full blur-3xl absolute bottom-0 right-1/4"></div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-20 bg-white border-t border-gray-100 px-4"
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-14">
              Simple, Smart, <span className="text-amber-600">Strategic</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                title="AI-Powered Matches"
                description="Play with adaptive AI opponents that learn your moves and challenge your limits."
                icon="🤖"
                color="bg-amber-50 text-amber-600"
              />
              <FeatureCard
                title="Private Friend Rooms"
                description="Host 1v1 matches with easy share links and secured connections."
                icon="🎯"
                color="bg-emerald-50 text-emerald-600"
              />
              <FeatureCard
                title="Spectator Mode"
                description="Watch your friends' games unfold in real time with zero interference."
                icon="👀"
                color="bg-gray-50 text-gray-700"
              />
              <FeatureCard
                title="Game Analytics"
                description="Analyze your match history, track openings, and export PGNs effortlessly."
                icon="📊"
                color="bg-amber-50 text-amber-600"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          id="history"
          className="py-20 bg-gradient-to-br from-amber-50 to-white px-4"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-amber-700 mb-3">
              Your Chess Growth Starts Here.
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Create your free account today and unlock smarter play with every
              move.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-600 text-white text-lg font-semibold py-3 px-10 rounded-xl shadow-md hover:bg-amber-700 transition"
            >
              Get Started
            </button>
          </div>
        </section>
      </main>

      <Footer />
      <SignupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
