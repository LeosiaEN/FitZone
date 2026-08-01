import { useEffect, useState, useCallback } from "react";
import { nutritionApi, userApi, workoutApi } from "../api/axios";
import ProfileInfoSection from "../assets/components/profile/ProfileInfoSection";
import WorkoutList from "../assets/components/profile/Workout/WorkoutList";
import MealList from "../assets/components/NutritionCreate/MealList";
import NutritionChart from "../assets/components/profile/nutrition/NutritionChart";

import {
  Box,
  CircularProgress,
  Typography,
  Tabs,
  Tab,
  Container,
} from "@mui/material";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [meals, setMeals] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  // Profil verisini al
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userApi.get("/api/users/me");
      setProfile(res.data);
    } catch (err) {
      console.error("Profil verisi alınamadı", err);
      setError("Profil verisi alınırken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Öğün verisini al
  const fetchMeals = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await nutritionApi.get("/api/nutrition/");
      setMeals(res.data);
    } catch (err) {
      console.error("Öğün verisi alınamadı", err);
      setError("Öğün verisi alınırken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  const fetchWorkouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await workoutApi.get("/api/workouts/my");
      setWorkouts(res.data);
    } catch (err) {
      console.error("Antrenman verisi alınamadı", err);
      setError("Antrenman verisi alınırken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchMeals();
    fetchWorkouts();
  }, [fetchProfile, fetchMeals,fetchWorkouts]);

  if (isLoading) {
    return (
      <Box minHeight="100vh" display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box minHeight="100vh" display="flex" justifyContent="center" alignItems="center">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box minHeight="100vh" display="flex" justifyContent="center" alignItems="center">
        <Typography>Profil yüklenemedi.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', minHeight: "100vh" }}>
      <Container
        sx={{
          maxWidth: { xs: "100%", md: "100%", lg: "100%" },
          margin: "0 !important",
          padding: "0 !important",
          position: 'relative',
          zIndex: 0,
        }}
      >
        {/* Profil Bilgisi */}
        <Box sx={{ mb: 0 }}>
          <ProfileInfoSection user={profile} onProfileUpdate={fetchProfile} />
        </Box>

        {/* Sekmeler */}
        <Box
          sx={{
            alignItems: "center",
            justifyContent: "center",
            padding: 7,
            backgroundColor: "#fff",
            borderRadius: 2,
            boxShadow: 3,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={(e, newValue) => setTabIndex(newValue)}
            textColor="primary"
            indicatorColor="primary"
            variant="fullWidth"
            sx={{ mb: 3, width: "100%" }}
          >
            <Tab label="Antrenmanlarım" />
            <Tab label="Beslenme Takibi" />
          </Tabs>

          {tabIndex === 0 && (
  <>
    {workouts.length > 0 ? (
      <WorkoutList workouts={workouts} />
    ) : (
      <Typography color="textSecondary" align="center">
        Henüz antrenman eklenmemiş.
      </Typography>
    )}
  </>
)}

{tabIndex === 1 && (
  <>
    {meals.length > 0 ? (
      <MealList meals={meals} onDelete={() => {}} />
    ) : (
      <Typography color="textSecondary" align="center">
        Henüz öğün eklenmemiş.
      </Typography>
    )}
  </>

)}

         
        </Box>
      </Container>
    </Box>
  );
};

export default ProfilePage;
