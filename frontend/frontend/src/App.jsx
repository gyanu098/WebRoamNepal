import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import About from "./pages/About";
import Contact from "./pages/Contact";
import EditProfile from "./pages/EditProfile";
import EditUser from "./pages/EditUser";
import ErrorFound from "./pages/ErrorFound";
import Favorites from "./pages/Favorites";
import Feedback from "./pages/Feedback";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Messages from "./pages/Messages";
import Navbar from "./component/Navbar";
import Notifications from "./pages/Notifications";
import PlaceDetail from "./pages/PlaceDetail";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import User from "./pages/User";
import ProtectedRoute from "./service/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import "./App.css";

const RootRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Home /> : <Landing />;
};






function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Toaster position="top-right" />

      <div className="app-shell">
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/places/:id" element={<PlaceDetail />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/user"
            element={
              <ProtectedRoute adminOnly>
                <User />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute adminOnly>
                <EditUser />
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
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:userId"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<ErrorFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
