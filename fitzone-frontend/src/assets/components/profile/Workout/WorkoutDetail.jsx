import React, { useState } from "react";
import { Button, Typography, Box, Stack, Paper } from "@mui/material";
import { workoutApi } from "../../../../api/axios"; // workoutApi'yi axios'dan alıyoruz
import SetRepInput from "./SetRepInput"; // Egzersiz set ve rep girişi için bileşen
import SelectedExercises from "./SelectedExercises"; // Egzersizleri düzenleme bileşeni

const WorkoutDetail = ({ workout, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState(workout.exercises || []);
  const [activeExercise, setActiveExercise] = useState(null);

  // Egzersiz Ekle
  const handleAddExercise = (exercise) => {
    setExercises((prev) => [...prev, exercise]);
  };

  // Egzersiz Sil
  const handleRemoveExercise = (exerciseId) => {
    setExercises((prev) => prev.filter((e) => e.id !== exerciseId));
  };

  // Workout'u Kaydet
  const handleSaveWorkout = async () => {
    setLoading(true);
    try {
      await workoutApi.put(`/api/workouts/${workout.id}`, {
        ...workout,
        exercises: exercises,
      });
      console.log("Workout başarıyla güncellendi!");
    } catch (err) {
      console.error("Workout güncellenirken hata oluştu:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
        Workout Düzenle
      </Typography>
      <Typography variant="h6" sx={{ marginTop: 2 }}>
        {workout.title}
      </Typography>
      <Typography variant="body2" sx={{ marginBottom: 2 }}>
        {workout.description}
      </Typography>

      {/* Egzersizleri Göster */}
      <SelectedExercises
        exercises={exercises}
        onRemove={handleRemoveExercise}
        onSelect={(exercise) => setActiveExercise(exercise)}
      />

      {/* Egzersiz Ekle */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setActiveExercise({})} // Yeni egzersiz eklemek için boş bir obje gönderiyoruz
        sx={{ marginTop: 3 }}
      >
        Egzersiz Ekle
      </Button>

      {/* Set/Rep Girişi */}
      {activeExercise && (
        <Paper
          elevation={3}
          sx={{
            marginTop: 3,
            padding: 3,
            borderRadius: 2,
            backgroundColor: "#f9f9f9",
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            {activeExercise.name} - Set/Rep Düzenle
          </Typography>
          <SetRepInput
            exercise={activeExercise}
            onConfirm={handleAddExercise}
            onCancel={() => setActiveExercise(null)}
          />
        </Paper>
      )}

      {/* Kaydetme Butonu */}
      <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
        <Button variant="outlined" color="secondary" onClick={onClose}>
          Kapat
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveWorkout}
          disabled={loading}
        >
          {loading ? "Kaydediliyor..." : "Workout'u Kaydet"}
        </Button>
      </Box>
    </Box>
  );
};

export default WorkoutDetail;
