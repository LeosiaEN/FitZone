  import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
  import { useState, useEffect } from "react";
  import { ThemeProvider, createTheme, CssBaseline, Box, Toolbar } from "@mui/material";
  import '@fontsource/inter';
  import '@fontsource/oswald';
  import '@fontsource/poppins';
  import "./assets/css/global.css"; 
  import Login from "./pages/Login";
  import Register from "./pages/Register";
  import Profile from "./pages/Profile";
  import Home from "./pages/Home";
  import ExerciseList from "./pages/WorkoutCreate";
  import WorkoutEdit from "./pages/WorkoutEditPage";
  import Footer from "./assets/components/footer/Footer";
  import NutritionPage from "./pages/Nutrition";
  import Workout from "./pages/Workout";
  import NavbarDesktop from "./assets/components/Navbar/NavbarDesktop";
  import WorkoutDetailPage from "./pages/WorkoutDetailPage"; 
  import ProfileSetupPage from "./pages/ProfileCreate"; 
  import ProfileGuard from "./assets/routesGuard/ProfileGuard"; // 

  const theme = createTheme({
    palette: {
      primary: {
        main: "#1976d2",
        light: "#42a5f5",
        dark: "#1565c0",
      },
      secondary: {
        main: "#dc004e",
        light: "#e33371",
        dark: "#b8003d",
      },
    },
  });

  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    }, []);

    const handleLogout = () => {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
    };

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>

          {/* Navbar bileşenleri */}
          <NavbarDesktop
            isLoggedIn={isAuthenticated}
            handleLogout={handleLogout}
          />

          {/* Navbar yüksekliği kadar boşluk bırak */}
          <Toolbar />

          {/* Sayfa içerikleri */}
          <Box sx={{ minHeight: "calc(100vh - 64px - 50px)" }}> {/* Navbar ve Footer yüksekliğini düşebiliriz, 64px varsayılan AppBar yüksekliği, 50px Footer yüksekliği varsayalım */}
          <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
    <Route path="/register" element={<Register />} />
    <Route path="/profile" element={<PrivateRoute><ProfileGuard><Profile /></ProfileGuard></PrivateRoute>} />
    <Route path="/profile-create" element={<PrivateRoute><ProfileSetupPage /></PrivateRoute>} />
    <Route path="/add-workout" element={<PrivateRoute><ProfileGuard><ExerciseList /></ProfileGuard></PrivateRoute>} />
    <Route path="/workout" element={<PrivateRoute><ProfileGuard><Workout /></ProfileGuard></PrivateRoute>} />
    <Route path="/workouts/edit/:workoutId" element={<PrivateRoute><ProfileGuard><WorkoutEdit /></ProfileGuard></PrivateRoute>} />
    <Route path="/workout/:workoutId" element={<PrivateRoute><ProfileGuard><WorkoutDetailPage /></ProfileGuard></PrivateRoute>} />
    <Route path="/nutrition" element={<PrivateRoute><ProfileGuard><NutritionPage /></ProfileGuard></PrivateRoute>} />
  </Routes>


          </Box>

          {/* Footer bileşeni */}
          <Footer />
          
        </BrowserRouter>
      </ThemeProvider>
    );
  }

  export default App;
