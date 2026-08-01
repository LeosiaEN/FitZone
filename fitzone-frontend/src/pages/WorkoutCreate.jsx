import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Typography,
  // TextField, // Artık burada render edilmiyor
  // MenuItem, // Artık burada render edilmiyor
  // FormControl, // Artık burada render edilmiyor
  // InputLabel, // Artık burada render edilmiyor
  // Select, // Artık burada render edilmiyor
  Grid,
  useMediaQuery,
  // Collapse, // Kullanılmıyor, kaldırılabilir
} from "@mui/material";
import { workoutApi } from "../api/axios";
import { useNavigate } from "react-router-dom";

// Component importları
import WorkoutHeader from "../assets/components/WorkoutCreate/WorkoutHeader";
import ExerciseSelectionModal from "../assets/components/WorkoutCreate/ExerciseSelectionModal";
import SetRepModal from "../assets/components/WorkoutCreate/SetRepModal";
import SelectedExercisesTable from "../assets/components/WorkoutCreate/SelectedExercisesTable";

const WorkoutCreate = () => {
  const [allExercises, setAllExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState({});
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isSetRepModalOpen, setIsSetRepModalOpen] = useState(false);
  const [activeExercise, setActiveExercise] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Bu state'ler WorkoutHeader'a props olarak geçiyor, tekrar render edilmeyecekler.
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [level, setLevel] = useState("beginner");

  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 600px)");

  useEffect(() => {
    const fetchExercises = async () => {
      setIsLoadingExercises(true);
      setError(null);
      try {
        const res = await workoutApi.get("/api/exercises");
        const data = res.data;
        if (Array.isArray(data)) {
          setAllExercises(data);
          const uniqueCategories = ["Tümü", ...new Set(data.map((e) => e.category))];
          setCategories(uniqueCategories);
        } else {
          throw new Error("API'den beklenen formatta veri gelmedi.");
        }
      } catch (err) {
        console.error("Egzersizler alınamadı:", err);
        const message = err.response?.data?.message || "Egzersizler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.";
        setError(message);
        setSnackbar({ open: true, message: "Egzersizler yüklenemedi.", severity: "error" });
      } finally {
        setIsLoadingExercises(false);
      }
    };
    fetchExercises();
  }, []);

  const handleAddOrUpdateExercise = (exerciseId, sets, reps) => {
    setSelectedExercises((prev) => ({
      ...prev,
      [exerciseId]: { sets, reps },
    }));
    setIsSetRepModalOpen(false);
    setActiveExercise(null);
    setSnackbar({
      open: true,
      message: `${allExercises.find(ex => ex.id === exerciseId)?.name || 'Egzersiz'} listeye eklendi/güncellendi.`,
      severity: "info"
    });
  };

  const handleRemoveExercise = (exerciseIdToRemove) => {
    const idStr = String(exerciseIdToRemove);
    const exerciseName = allExercises.find(ex => String(ex.id) === idStr)?.name || 'Egzersiz';
    setSelectedExercises((prev) => {
      const updated = { ...prev };
      delete updated[idStr];
      return updated;
    });
    setSnackbar({ open: true, message: `${exerciseName} workout'tan kaldırıldı.`, severity: 'warning' });
  };

  const handleExerciseSelect = (exercise) => {
    setActiveExercise(exercise);
    setIsSetRepModalOpen(true);
  };

  const handleEditExercise = (exercise) => {
    setActiveExercise(exercise);
    setIsSetRepModalOpen(true);
  };


  const submitWorkout = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setSnackbar({ open: true, message: "Workout oluşturmak için giriş yapmalısınız.", severity: "warning" });
      return;
    }
    if (!title.trim()) {
      setSnackbar({ open: true, message: "Lütfen workout için bir başlık girin.", severity: "warning" });
      return;
    }
    if (Object.keys(selectedExercises).length === 0) {
      setSnackbar({ open: true, message: "Lütfen workout'a en az bir egzersiz ekleyin.", severity: "warning" });
      return;
    }

    const payload = {
      title: title.trim(),
      isPublic,
      description: description.trim(),
      duration: parseInt(duration) || 30,
      level: level,
      exercises: Object.entries(selectedExercises).map(([id, config]) => ({
        exerciseId: parseInt(id),
        sets: config.sets,
        reps: config.reps,
      })),
    };

    setIsSubmitting(true);

    try {
      const res = await workoutApi.post("/api/workouts", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Workout oluşturuldu:", res.data);
      setSnackbar({ open: true, message: "Workout başarıyla oluşturuldu!", severity: "success" });
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      console.error("Workout oluşturulamadı:", err.response?.data || err.message);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Workout oluşturulurken bir hata oluştu.",
        severity: "error",
      });
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (isLoadingExercises && !error) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">Bir Sorun Oluştu</Typography>
        <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>
        <Button variant="outlined" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Sayfayı Yenile
        </Button>
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, sm: 3 }} sx={{ maxWidth: 900, mx: "auto" }}>
      {/* WorkoutHeader componentine tüm gerekli state ve handler'lar geçiriliyor */}
      {/* description, duration, level alanları artık WorkoutHeader içinde render ediliyor */}
      <WorkoutHeader
        title={title}
        onTitleChange={setTitle}
        description={description}
        onDescriptionChange={setDescription}
        duration={duration}
        onDurationChange={setDuration}
        level={level}
        onLevelChange={setLevel}
        isPublic={isPublic}
        onPublicChange={setIsPublic}
        onAddExerciseClick={() => setIsExerciseModalOpen(true)}
        isAddDisabled={!title.trim()}
      />

      {/* TEKRARLANAN GRID BÖLÜMÜ BURADAN KALDIRILDI */}
            {/* Açıklama, Süre, Seviye alanları artık sadece WorkoutHeader içinde var */}

      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1 }}> {/* Alt başlık */}
        Seçilen Egzersizler
      </Typography>

      <SelectedExercisesTable
        selectedExercisesMap={selectedExercises}
        allExercises={allExercises}
        onRemoveExercise={handleRemoveExercise}
        onEditExercise={handleEditExercise}
        isMobile={isMobile}
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={submitWorkout}
        sx={{ mt: 2, py: 1.2, fontSize: '0.9rem' }}
        disabled={!title.trim() || Object.keys(selectedExercises).length === 0 || isSubmitting}
      >
        {isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Workout'ı Kaydet"}
      </Button>

      {/* Modallar */}
      <ExerciseSelectionModal
        open={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        exercises={allExercises}
        categories={categories}
        selectedExercisesMap={selectedExercises}
        onExerciseSelect={handleExerciseSelect}
        isLoading={isLoadingExercises}
        isMobile={isMobile}
      />

      <SetRepModal
        open={isSetRepModalOpen}
        onClose={() => {
          setIsSetRepModalOpen(false);
          setActiveExercise(null);
        }}
        exercise={activeExercise}
        initialSets={activeExercise ? selectedExercises[activeExercise.id]?.sets : 3}
        initialReps={activeExercise ? selectedExercises[activeExercise.id]?.reps : 12}
        onSave={handleAddOrUpdateExercise}
        isMobile={isMobile}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkoutCreate;