import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile';
import EduAIChatbot from './pages/Chatbot';
import { useEffect, useRef} from 'react';

// changes 
function NotFoundAlert() {
  const alerted = useRef(false);
  useEffect(() => {
    if (!alerted.current) {
      alert("This is not a valid API");
      alerted.current = true;
    }
  }, []);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public route */}
            <Route path="/" element={<Home />} />

            {/* Auth routes (only if NOT authenticated) */}
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <ProtectedRoute requireAuth={false}>
                  <Signup />
                </ProtectedRoute>
              }
            />

            {/* Protected routes (require authentication) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <EduAIChatbot />
                </ProtectedRoute>
              }
            />

              {/* Changes */}
            <Route path="*" element={<NotFoundAlert />} />

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;