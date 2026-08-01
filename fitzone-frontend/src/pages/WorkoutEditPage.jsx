import React, { useEffect, useState } from "react";
import { workoutApi } from "../api/axios"; // API importu
import {
  Button,
  Box,
  Typography,
  TextField,
  Stack,
  CircularProgress,
  Snackbar,
  Card,
  CardContent,
  IconButton,
  CardMedia,
  Grid,
  Pagination, // Pagination import edildi
} from "@mui/material";
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useParams, useNavigate } from "react-router-dom";

import SearchIcon from '@mui/icons-material/Search'; // Search ikonu eklendi
import InputAdornment from '@mui/material/InputAdornment'; // InputAdornment eklendi




const WorkoutEditPage = () => {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]); // Tüm egzersizler
  const [selectedExercises, setSelectedExercises] = useState({});
  const [loading, setLoading] = useState(false); // Yükleniyor durumu
  const [error, setError] = useState(null); // Hata mesajları
  const [successMessage, setSuccessMessage] = useState(""); // Başarı mesajı

  // --- Search and Pagination State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const exercisesPerPage = 6; // Sayfa başına gösterilecek egzersiz sayısı
  // ----------------------------------

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await workoutApi.get(`/api/workouts/${workoutId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWorkout(res.data);
        const selected = {};
        res.data.exercises.forEach((exercise) => {
          const idKey = exercise.exerciseId !== undefined ? exercise.exerciseId : exercise.id;
          selected[idKey] = { sets: exercise.sets, reps: exercise.reps };
        });
        setSelectedExercises(selected);
      } catch (err) {
        if (err.response) {
          setError(`API Hatası (Workout): ${err.response.data.message || err.response.statusText}`);
        } else {
          setError("Workout bilgileri alınamadı.");
        }
      }
    };

    
    const fetchExercises = async () => {
      setLoading(true); // Genel yükleme durumu buradan başlasın
      setError(null); // Yeni fetch öncesi hataları temizle
      try {
        const token = localStorage.getItem("authToken");
        const res = await workoutApi.get("/api/exercises", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExercises(res.data || []); // API boş dönerse diye kontrol
      } catch (err) {
        if (err.response) {
          setError(`API Hatası (Exercises): ${err.response.data.message || err.response.statusText}`);
        } else {
          setError("Egzersizler alınamadı.");
        }
      } finally {
        setLoading(false); // Tüm yüklemeler bittiğinde
      }
    };

    setLoading(true);
    Promise.all([fetchWorkout(), fetchExercises()]).finally(() => {
      // setLoading(false); // fetchExercises içindeki finally yeterli
    });

  }, [workoutId]);

  // Search Query değiştiğinde sayfayı başa al
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);


  const toggleExercise = (exerciseId) => {
    setSelectedExercises((prevSelected) => {
      const updated = { ...prevSelected };
      if (updated[exerciseId]) {
        delete updated[exerciseId];
      } else {
        updated[exerciseId] = { sets: 3, reps: 12 };
      }
      return updated;
    });
  };

  const handleSetRepsChange = (exerciseId, type, value) => {
    setSelectedExercises((prevSelected) => {
      const updated = { ...prevSelected };
      const numericValue = value === '' ? '' : parseInt(value, 10);

      if (value !== '' && (isNaN(numericValue) || numericValue < 0)) {
        updated[exerciseId] = { ...updated[exerciseId], [type]: 0 };
      } else {
        updated[exerciseId] = { ...updated[exerciseId], [type]: numericValue };
      }
      return updated;
    });
  };


  const handleSave = async () => {
    setError(null); // Kaydetme öncesi hatayı temizle
    const exercisesToSave = Object.entries(selectedExercises)
      .map(([id, { sets, reps }]) => ({
        exerciseId: parseInt(id, 10),
        sets: parseInt(sets, 10) || 0,
        reps: parseInt(reps, 10) || 0,
      }))
      .filter(ex => ex.sets > 0 && ex.reps > 0);

    if (exercisesToSave.length === 0 && Object.keys(selectedExercises).length > 0) {
      setError("Seçilen egzersizlerin set ve tekrar sayıları 0'dan büyük olmalıdır.");
      return;
    }
    if (exercisesToSave.length === 0 && Object.keys(selectedExercises).length === 0) {
      setError("Lütfen workout'a en az bir egzersiz ekleyin.");
      return;
    }

    const updatedWorkout = {
      ...workout,
      exercises: exercisesToSave,
    };

    if (!updatedWorkout.title || updatedWorkout.title.trim() === "") {
      setError("Workout başlığı boş bırakılamaz.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      await workoutApi.put(`/api/workouts/${workoutId}`, updatedWorkout, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage("Workout başarıyla güncellendi!");
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      if (err.response) {
        setError(`Kaydetme Hatası: ${err.response.data?.message || err.response.statusText}`);
      } else {
        setError("Workout güncellenirken bir hata oluştu.");
      }
      setLoading(false); // Hata durumunda da loading'i kapat
    }
  };

  // --- Filtering and Pagination Logic ---
  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pageCount = Math.ceil(filteredExercises.length / exercisesPerPage);
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = filteredExercises.slice(indexOfFirstExercise, indexOfLastExercise);
  // ---------------------------------------


  if (loading && !workout) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />;

  if (!loading && !workout && error) {
    return <Typography color="error" sx={{ textAlign: 'center', mt: 5 }}>{error || "Workout yüklenemedi."}</Typography>;
  }
  if (workout && !loading && exercises.length === 0 && error && error.includes("Exercises")) {
    return (
      <Box sx={{ padding: 3, maxWidth: 1000, margin: 'auto', }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          "{workout.title}" Workout'unu Düzenle
        </Typography>
        <Typography color="error" sx={{ textAlign: 'center', mt: 5 }}>{error}</Typography>
        {/* İsterseniz burada kaydet butonu gibi diğer elementleri de gösterebilirsiniz */}
      </Box>
    );
  }


  return (
    <Box sx={{ padding: 3, maxWidth: 1000, margin: 'auto', }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        {workout?.title ? `"${workout.title}" Workout'unu Düzenle` : "Workout Düzenle"}
      </Typography>

      <TextField
        label="Workout Başlığı"
        variant="outlined"
        fullWidth
        value={workout?.title || ""}
        onChange={(e) => setWorkout({ ...workout, title: e.target.value })}
        sx={{ marginBottom: 4 }}
        disabled={loading} // Yükleme sırasında veya kaydetme sırasında disable edilebilir
      />

      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Egzersizleri Seç / Set ve Tekrarları Ayarla:
      </Typography>

      {/* --- Search Bar --- */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Egzersiz ara..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        disabled={loading} // Yükleme sırasında disable edilebilir
      />
      {/* ------------------ */}


      {/* Egzersiz Listesi ve Grid */}
      {loading && exercises.length === 0 ? ( // Eğer hala yükleniyorsa ve hiç egzersiz yoksa (ilk yükleme)
        <CircularProgress sx={{ display: 'block', margin: 'auto', my: 3 }} />
      ) : currentExercises.length > 0 ? (
        <Grid container spacing={3} sx={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {currentExercises.map((exercise) => (
            <Grid  key={exercise.id} size={{ xs:12 ,sm:6, md:4}} >
              <Card sx={{
                display: 'flex',
                flexDirection: 'column',
                border: selectedExercises[exercise.id] ? '2px solid green' : '1px solid #ccc',
                height: '100%',
                minHeight: 320,
                minWidth: 300,
                boxShadow: selectedExercises[exercise.id] ? 3 : 1,
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease', // Geçiş efekti
              }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}> {/* flexGrow eklendi */}
                  <CardMedia
                    component="img"
                    sx={{ width: '100%', height: '150px', objectFit: 'cover' }}
                    image={exercise.imageUrl || "https://unsplash.it/400/400?grayscale&blur=2"}
                    alt={exercise.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}> {/* flexGrow eklendi */}
                    <Typography variant="h6" component="div" noWrap title={exercise.name}> {/* noWrap ve title eklendi */}
                      {exercise.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
  mt: 1,
  minHeight: '3em',
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical"
}}
>
                      {exercise.description || "Açıklama yok."}
                    </Typography>
                  </CardContent>

                  {/* Set/Reps veya Seç Butonu Alanı */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    minHeight: 60,
                  }}>
                    {!selectedExercises[exercise.id] ? (
                      <Button
                        variant="outlined"
                        onClick={() => toggleExercise(exercise.id)}
                        size="medium"
                        sx={{ width: '100%', justifyContent: 'center' }} // Butonu genişlet ve içeriği ayır
                        startIcon={<AddCircleOutlineOutlinedIcon />}
                      >
                        Ekle
                      </Button>
                    ) : (
                      <Stack direction="row" spacing={1} alignItems="center"sx={{ width: '100%',  justifyContent: 'space-between' }}>
                        <TextField
                          label="Sets"
                          type="number"
                          value={selectedExercises[exercise.id]?.sets ?? ''}
                          onChange={(e) => handleSetRepsChange(exercise.id, 'sets', e.target.value)}
                          size="small"
                          sx={{ width: 75 }}
                          InputProps={{ inputProps: { min: 1 } }}
                        />
                        <TextField
                          label="Reps"
                          type="number"
                          value={selectedExercises[exercise.id]?.reps ?? ''}
                          onChange={(e) => handleSetRepsChange(exercise.id, 'reps', e.target.value)}
                          size="small"
                          sx={{ width: 75 }}
                          InputProps={{ inputProps: { min: 1 } }}
                        />
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => toggleExercise(exercise.id)}
                          size="small"
                          sx={{ ml: 'auto', justifyContent: 'center',minHeight:40 }} // Butonu genişlet ve içeriği ayır
                          startIcon={<CancelOutlinedIcon />}
                        >
                          Sil
                        </Button>
                      
                      </Stack>
                    )}
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
          {searchQuery ? "Arama kriterlerine uygun egzersiz bulunamadı." : "Gösterilecek egzersiz yok."}
        </Typography>
      )}

      {/* --- Pagination Controls --- */}
      {pageCount > 1 && ( // Sadece birden fazla sayfa varsa göster
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Pagination
            count={pageCount}
            page={currentPage}
            onChange={(event, value) => setCurrentPage(value)}
            color="primary"
            showFirstButton
            showLastButton
            disabled={loading} // Yükleme sırasında disable edilebilir
          />
        </Box>
      )}
      {/* ------------------------- */}


      {/* Kaydet Butonu */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading} // Yükleme veya kaydetme sırasında devre dışı
          size="large"
        >
          {loading && !successMessage ? <CircularProgress size={24} color="inherit" /> : 'Workout\'u Kaydet'}
        </Button>
      </Box>


      {/* Hata ve Başarı Mesajları */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={6000} // Başarı mesajı biraz daha kalsın
        onClose={() => setSuccessMessage("")}
        message={successMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ '& .MuiSnackbarContent-root': { backgroundColor: 'green' } }}
      />

    </Box>
  );
};

export default WorkoutEditPage;