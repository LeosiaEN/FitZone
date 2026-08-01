import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
 Button, Typography, Box, CircularProgress,
 Card, CardContent, List, ListItem, ListItemAvatar, Avatar,
 Snackbar, Alert, ListItemText, IconButton, Grid
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutApi } from '../api/axios'; // Assuming TrackingApi is imported from here
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Import the actual PoseCamera component
import PoseCamera from '../assets/components/PoseCamera/PoseCamera';

const WorkoutDetailPage = () => {
 const { workoutId } = useParams();
 const navigate = useNavigate();

 const [workout, setWorkout] = useState(null);
 const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
 const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
 const [isResting, setIsResting] = useState(false);
 const [timeRemaining, setTimeRemaining] = useState(30);
 const [isTimerRunning, setIsTimerRunning] = useState(false);
 const [snackbarOpen, setSnackbarOpen] = useState(false);
 const [snackbarMessage, setSnackbarMessage] = useState('');
 const [snackbarSeverity, setSnackbarSeverity] = useState('success');
 const [isVideoPlayed, setIsVideoPlayed] = useState(false);
 const videoRef = useRef(null);

 const defaultRestTime = 30; // Default rest time if not provided by API

 const showSnackbar = useCallback((message, severity) => {
  setSnackbarMessage(message);
  setSnackbarSeverity(severity);
  setSnackbarOpen(true);
 }, []);

 const handleCloseSnackbar = (event, reason) => {
  if (reason === 'clickaway') return;
  setSnackbarOpen(false);
 };

 const handleWorkoutComplete = useCallback(() => {
  showSnackbar('Antrenman Tamamlandı!', 'success');
  setIsWorkoutStarted(false);
  setCurrentExerciseIndex(0);
  setIsResting(false);
  setIsTimerRunning(false);
  setTimeRemaining(workout?.restTime || defaultRestTime); // Reset time
  setIsVideoPlayed(false);

  // Give user a moment to see the completion message before redirecting
  const redirectTimer = setTimeout(() => {
   navigate('/workout');
  }, 2000); // Increased delay slightly

  return () => clearTimeout(redirectTimer);
 }, [navigate, showSnackbar, workout?.restTime, defaultRestTime]);


 useEffect(() => {
  const fetchWorkoutDetails = async () => {
   setWorkout(null); // Reset workout state before fetching
   setIsWorkoutStarted(false);
   setCurrentExerciseIndex(0);
   setIsResting(false);
   setIsTimerRunning(false);
   setIsVideoPlayed(false); // Reset video state on new workout ID
   setTimeRemaining(defaultRestTime); // Reset time to default initially
   try {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const res = await workoutApi.get(`/api/workouts/${workoutId}`, config);
    setWorkout(res.data);
    // Set rest time from fetched data, default if not available
    setTimeRemaining(res.data?.restTime || defaultRestTime);
   } catch (err) {
    console.error('Antrenman detayları alınamadı', err);
    showSnackbar('Antrenman yüklenirken bir hata oluştu.', 'error');
    navigate('/workout'); // Redirect if workout fails to load
   }
  };

  if (workoutId) {
   fetchWorkoutDetails();
  } else {
    // Handle case where workoutId is missing (e.g., direct access)
    showSnackbar('Antrenman ID\'si eksik.', 'error');
    navigate('/workout');
  }

 }, [workoutId, navigate, showSnackbar, defaultRestTime]);


 useEffect(() => {
  let timer;
  if (isTimerRunning && timeRemaining > 0) {
   timer = setInterval(() => {
    setTimeRemaining((prevTime) => prevTime - 1);
   }, 1000);
  } else if (isTimerRunning && timeRemaining === 0) {
   // Rest time is over
   setIsTimerRunning(false);
   setIsResting(false);
   // Automatically move to the next exercise or finish
   if (workout?.exercises && currentExerciseIndex < workout.exercises.length - 1) {
    setCurrentExerciseIndex(prevIndex => prevIndex + 1);
   } else {
    handleWorkoutComplete();
   }
  }
  return () => clearInterval(timer);
 }, [isTimerRunning, timeRemaining, workout, currentExerciseIndex, handleWorkoutComplete]);


 useEffect(() => {
  // Egzersiz değiştiğinde video state'ini resetle
  setIsVideoPlayed(false);
  // Reset video currentTime when exercise index changes, if ref exists
  if (videoRef.current) {
    videoRef.current.currentTime = 0;
    // Attempt to play automatically if it was muted/autoplayed
    videoRef.current.play().catch(error => {
      console.warn("Video auto-play failed:", error);
      // Handle autoplay failure if necessary, maybe show a play button
    });
  }
  // Update rest time state based on the new exercise's workout rest time
  setTimeRemaining(workout?.restTime || defaultRestTime);

 }, [currentExerciseIndex, workout, defaultRestTime]); // Add workout to dependencies


 const startWorkout = () => {
  if (!workout || !workout.exercises || workout.exercises.length === 0) {
   showSnackbar('Bu antrenmanda egzersiz bulunmuyor!', 'warning');
   return;
  }
  setIsWorkoutStarted(true);
  setCurrentExerciseIndex(0);
  setIsResting(false);
  setIsTimerRunning(false);
  setTimeRemaining(workout?.restTime || defaultRestTime); // Use configured rest time
  setIsVideoPlayed(false);
 };

 // This function is called manually OR by PoseCamera's onSetComplete
 const handleDoneExercise = async () => {
  if (isResting) {
   console.log("Already resting, ignoring handleDoneExercise call.");
   return;
  }

  

    // Logic to move to the next exercise or complete workout, regardless of API save success/failure
  if (workout?.exercises && currentExerciseIndex < workout.exercises.length - 1) {
   setIsResting(true);
   setIsTimerRunning(true);
   // setTimeRemaining is handled by the useEffect when currentExerciseIndex changes
  } else {
   handleWorkoutComplete();
  }
 };


 // useEffect or relevant hook:
 // This useEffect seems unnecessary as handleDoneExercise is triggered by user action or PoseCamera callback
 // useEffect(() => {
  // İlgili bağımlılıklar burada olmalı
 // }, [workout, currentExerciseIndex, handleWorkoutComplete, isResting]);


 const skipRest = useCallback(() => {
  if (isResting) {
   setIsTimerRunning(false);
   setIsResting(false);
   // TimeRemaining state will be updated by the useEffect monitoring currentExerciseIndex
   // No need to set it here, just advance the index

   if (workout?.exercises && currentExerciseIndex < workout.exercises.length - 1) {
    setCurrentExerciseIndex(prevIndex => prevIndex + 1);
   } else {
    handleWorkoutComplete();
   }
  }
 }, [isResting, workout, currentExerciseIndex, handleWorkoutComplete]);


 const skipVideo = useCallback(() => {
  console.log("Video skipped by user.");
  setIsVideoPlayed(true);
  if (videoRef.current) {
    videoRef.current.pause(); // Pause the video if it's playing
  }
 }, []);


 // Loading
 if (!workout) {
  return (
   <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
    <CircularProgress size={60} sx={{ mb: 2 }} />
    <Typography variant="h6" color="textSecondary">Antrenman Yükleniyor...</Typography>
   </Box>
  );
 }

 // Workout loaded but has no exercises
 if (workout && (!workout.exercises || workout.exercises.length === 0)) {
  return (
   <Box sx={{ padding: '20px', textAlign: 'center', bgcolor: '#fff', borderRadius: '12px', maxWidth: '600px', margin: '40px auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
    <Typography variant="h5" color="error" gutterBottom>Antrenman Hatası</Typography>
    <Typography variant="body1" sx={{ mb: 3 }}>Bu antrenmanda gösterilecek egzersiz bulunamadı.</Typography>
    <Button
     variant="contained"
     color="primary"
     onClick={() => navigate('/workout')}
     sx={{ borderRadius: '30px', padding: '10px 20px' }}
    >
     Antrenman Listesine Dön
    </Button>
   </Box>
  );
 }


 const currentExercise = workout.exercises?.[currentExerciseIndex];

 // Antrenman başladı ama geçerli egzersiz yoksa (fetch sonrası kontrol)
 if (isWorkoutStarted && !currentExercise && !isResting) {
  console.error("Workout started but current exercise index is invalid:", currentExerciseIndex);
  showSnackbar('Geçerli egzersiz yüklenemedi veya antrenman bitti.', 'info'); // Changed to info, might just be end of workout
  // Check if we should have finished
  if (workout?.exercises && currentExerciseIndex >= workout.exercises.length) {
    handleWorkoutComplete(); // If index is past the end, complete the workout
  } else {
    // This state should ideally not happen if logic is correct, but handle defensively
    showSnackbar('Beklenmedik bir hata oluştu, antrenman sonlandırılıyor.', 'error');
    handleWorkoutComplete();
  }
  return null; // Avoid rendering problematic state
 }


 return (
  <Box sx={{ padding: '20px', bgcolor: '#e8f5e9', minHeight: '100vh' }}> {/* Softer background */}
   {/* Use AnimatePresence for exit animations if needed later */}
   <AnimatePresence mode="wait">
   <motion.div
     key={isWorkoutStarted ? (isResting ? 'resting' : `exercise-${currentExerciseIndex}`) : 'intro'} // Unique key for animation
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     exit={{ opacity: 0, y: -20 }}
     transition={{ duration: 0.3 }}
   >
    <Card sx={{ maxWidth: '800px', margin: 'auto', borderRadius: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', overflow: 'hidden', bgcolor: '#fff' }}>
     <CardContent sx={{ padding: { xs: 3, md: 4 }}}>

      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', color: '#1b5e20', fontWeight: '700' }}> {/* Dark green */}
       {workout.title}
      </Typography>

      {/* Antrenman Başlamadıysa Egzersiz Listesi */}
      {!isWorkoutStarted ? (
       <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#333', borderBottom: '1px solid #eee', pb: 1 }}>
         Antrenman Planı ({workout.exercises?.length || 0} Egzersiz):
        </Typography>
        <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
         {workout.exercises?.map((exercise, index) => (
          <ListItem
           key={exercise.exercise._id || index} // Use unique ID if available
           divider={index < workout.exercises.length - 1}
           sx={{ py: 1.5, px: 2 }}
          >
           <ListItemAvatar>
            <Avatar sx={{ bgcolor: '#4caf50', color: '#fff' }}> {/* Green avatar */}
             <FitnessCenterIcon />
            </Avatar>
           </ListItemAvatar>
           <ListItemText
            primary={`${index + 1}. ${exercise.exercise.name}`}
            secondary={`Set: ${exercise.sets}, Tekrar: ${exercise.reps} | Kategori: ${exercise.exercise.category}`}
            primaryTypographyProps={{ fontWeight: 'medium' }}
            secondaryTypographyProps={{ color: 'text.secondary' }}
           />
          </ListItem>
         ))}
        </List>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
         <Button
          variant="contained"
          color="primary"
          onClick={startWorkout}
          size="large"
          sx={{
           minWidth: 200,
           borderRadius: '50px',
           padding: '14px 24px',
           fontSize: '1.1rem',
           fontWeight: 'bold',
           boxShadow: '0 4px 10px rgba(0, 170, 0, 0.3)',
           '&:hover': {
             backgroundColor: '#388e3c', // Darker green
             boxShadow: '0 6px 14px rgba(0, 170, 0, 0.4)',
           },
          }}
          disabled={!workout.exercises || workout.exercises.length === 0}
         >
          Antrenmana Başla
         </Button>
        </Box>
       </Box>

      ) : (
       // Antrenman Başladıysa: Aktif Egzersiz / Dinlenme
       <Box sx={{ mt: 3 }}>
        {isResting ? (
         // --- Dinlenme Ekranı ---
         <Card sx={{ mt: 2, borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', bgcolor: '#e3f2fd', p: 3 }}> {/* Light blue background */}
          <CardContent sx={{ textAlign: 'center', p: 0 }}> {/* Reset card content padding */}
           <Typography variant="h5" sx={{ mb: 2, color: '#1565c0', fontWeight: '600' }}> {/* Darker blue */}
             Dinlenme Arası
           </Typography>
           <Typography variant="body1" color="textSecondary" sx={{mb: 2}}>
              Sıradaki: {workout?.exercises?.[currentExerciseIndex + 1]?.exercise.name || 'Antrenman Bitiyor...'} {/* Show next exercise name */}
           </Typography>
           <Box display="flex" justifyContent="center" alignItems="center" sx={{ mb: 3, position: 'relative', width: 120, height: 120, margin: '0 auto' }}> {/* Fixed size for circle */}
            <CircularProgress
             variant="determinate"
             value={timeRemaining > 0 && (workout?.restTime || defaultRestTime) > 0 ? (timeRemaining / (workout.restTime || defaultRestTime)) * 100 : 0}
             size={120}
             thickness={3}
             sx={{ color: '#1e88e5' }}
            />
            <Typography variant="h3" sx={{ position: 'absolute', color: '#1e88e5', fontWeight: 'bold' }}>
             {timeRemaining}s
            </Typography>
           </Box>
           <Button
            variant="outlined"
            color="secondary"
            onClick={skipRest}
            sx={{ borderRadius: '30px', padding: '10px 20px', minWidth: 150 }}
           >
            Dinlenmeyi Atla
           </Button>
          </CardContent>
         </Card>
        ) : currentExercise ? (
         // --- Aktif Egzersiz Ekranı ---
         <Box>
          <Typography variant="h5" component="h2" sx={{ mb: 1, color: '#333', fontWeight: '600' }}>
           {currentExercise.exercise.name}
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
           Set: {currentExercise.sets} | Tekrar: {currentExercise.reps}
          </Typography>

          {/* === Video veya PoseCamera Alanı === */}
          <Box sx={{
            width: '100%',
            margin: '0 auto 24px auto',
            bgcolor: '#000',
            borderRadius: '10px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}>
           {!isVideoPlayed && currentExercise.exercise.videoUrl ? (
            <>
             <video
              ref={videoRef}
              key={currentExercise.exercise.videoUrl} // Key to re-mount video element on exercise change
              width="100%"
              height="100%"
              style={{ display: 'block', objectFit: 'cover' }} // Cover to fill container
              playsInline autoPlay muted // Autoplay muted is more reliable
              onEnded={() => setIsVideoPlayed(true)}
              onError={(e) => {
                console.warn('Video oynatma hatası:', e);
                showSnackbar('Tanıtım videosu yüklenemedi, kamera başlatılıyor.', 'warning');
                setIsVideoPlayed(true); // Switch to camera on error
              }}
             >
              <source src={currentExercise.exercise.videoUrl} type="video/mp4" />
               Your browser does not support the video tag.
             </video>
             {/* --- Videoyu Atla Butonu --- */}
             <Button
              variant="contained"
              size="small"
              onClick={skipVideo}
              startIcon={<SkipNextIcon />}
              sx={{
               position: 'absolute',
               bottom: 10,
               right: 10,
               borderRadius: '20px',
               backgroundColor: 'rgba(0, 0, 0, 0.6)',
               color: 'white',
               '&:hover': {
                 backgroundColor: 'rgba(0, 0, 0, 0.8)',
                },
               textTransform: 'none',
               padding: '4px 12px',
               zIndex: 1, // Ensure it's above video
              }}
             >
              Atla
             </Button>
            </>
           ) : (
            /* PoseCamera */
            // Pass the target reps and the callback function
            <PoseCamera
              movementType={"jumpingJack"} // Pass the movement type
              targetReps={currentExercise.reps} // Pass the target reps (or duration for plank)
              onSetComplete={handleDoneExercise} // Pass the callback
            />
           )}
          </Box>

          {/* Egzersizi Tamamla / Antrenmanı Bitir Butonu */}
          {/* This button is now manual OR fallback if PoseCamera fails */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
             variant="contained"
             color="primary"
             onClick={handleDoneExercise} // This button also triggers the same logic
             size="large"
             sx={{
              minWidth: 250,
              borderRadius: '50px',
              padding: '14px 24px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              backgroundColor: '#4caf50', // Green button
              '&:hover': {
                backgroundColor: '#388e3c', // Darker green
              },
              boxShadow: '0 4px 10px rgba(0, 170, 0, 0.3)',
             }}
            >
             {workout.exercises && currentExerciseIndex === workout.exercises.length - 1
              ? 'Antrenmanı Bitir'
              : 'Egzersizi Tamamla (Manuel)'} {/* Indicate manual option */}
            </Button>
          </Box>
          {workout.exercises && currentExerciseIndex < workout.exercises.length - 1 && (
            <Typography variant="body2" color="textSecondary" align="center" sx={{mt: 1}}>
              Veya {currentExercise.reps} tekrarı tamamladığınızda otomatik olarak dinlenmeye geçilir.
            </Typography>
          )}


         </Box>
        ) : null /* currentExercise yoksa (ve dinlenmiyorsa) null */}
       </Box>
      )}
     </CardContent>
    </Card>
   </motion.div>
   </AnimatePresence>

   {/* Snackbar */}
   <Snackbar
    open={snackbarOpen}
    autoHideDuration={4000}
    onClose={handleCloseSnackbar}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
   >
    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
     {snackbarMessage}
    </Alert>
   </Snackbar>
  </Box>
 );
};

export default WorkoutDetailPage;
