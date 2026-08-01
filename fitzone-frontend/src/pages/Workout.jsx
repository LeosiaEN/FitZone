import React, { useEffect, useState } from "react";
import { workoutApi, userApi } from "../api/axios"; // API importları doğru varsayıldı
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  CircularProgress,
  CardActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CardMedia, // Görsel eklemek için
  Paper, // Arama/Filtre gruplamak için
  InputAdornment, // Input'a ikon eklemek için
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search'; // Arama ikonu
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'; // Seviye ikonu
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Süre ikonu
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'; // Başlatma butonu ikonu
import FilterListIcon from '@mui/icons-material/FilterList'; // Filtre ikonu (isteğe bağlı)
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'; // Boş/Hata ikonu

const AllWorkouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkoutsAndUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [workoutsRes, workoutsRes2] = await Promise.all([
          workoutApi.get("api/workouts/public/all", config),
          workoutApi.get("api/workouts/my", config),
        ]);

        const allWorkouts = [...workoutsRes.data, ...workoutsRes2.data];
        const uniqueWorkouts = allWorkouts.reduce((acc, workout) => {
          if (!acc.some(existingWorkout => existingWorkout.id === workout.id)) {
            acc.push(workout);
          }
          return acc;
        }, []);

        setWorkouts(uniqueWorkouts);

        const creatorIds = [
          ...new Set(uniqueWorkouts.map(w => w.userId).filter(Boolean)),
        ];

        if (creatorIds.length > 0) {
          const userPromises = creatorIds.map(userId =>
            userApi.get(`/api/users/profile/${userId}`, config)
                .then(res => ({ userId, data: res.data })) // Başarılı olursa userId ile eşleştir
                .catch(err => {
                    console.warn(`Kullanıcı ${userId} yüklenemedi:`, err.message);
                    return { userId, error: true }; // Hata durumunda userId ile işaretle
                })
          );
          const userResponses = await Promise.all(userPromises);

          const usersData = {};
          userResponses.forEach(res => {
            if (!res.error && res.data) {
              usersData[res.userId] = res.data; // Gelen userId'yi kullan
            } else {
              // API'den gelen userId'yi kullanarak bilinmeyen kullanıcıyı ekle
              usersData[res.userId] = { name: "Bilinmeyen Kullanıcı" };
            }
          });
          setUsers(usersData);
        }

      } catch (err) {
        console.error("Veri yükleme hatası:", err);
        setError("Antrenmanlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        setWorkouts([]);
        setUsers({});
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutsAndUsers();
  }, [navigate]);

  const handleStartWorkout = workoutId => {
    navigate(`/workout/${workoutId}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
  };

  const filteredWorkouts = workouts.filter(workout => {
    const titleMatch = workout.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true;
    const levelMatch = selectedLevel ? workout.level === selectedLevel : true;
    return titleMatch && levelMatch;
  });

  // --- Yükleme Durumu ---
  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
          Antrenmanlar Yükleniyor...
        </Typography>
      </Box>
    );
  }

  // --- Hata Durumu ---
  if (error) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh" textAlign="center" px={2}>
         <SentimentVeryDissatisfiedIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  // --- Boş Durum (Filtre Sonrası) ---
  // Not: İlk yüklemede boşsa bu mesaj görünmeyecek, fetch içindeki kontrol çalışacak.
  // Bu daha çok filtreleme sonrası hiç sonuç kalmazsa diye.
  

  return (
    <Box sx={{
      padding: { xs: '20px 15px', md: '40px 30px' }, // Mobil için padding ayarı
      // Daha soft bir gradyan veya isteğe bağlı arkaplan resmi
      background: 'linear-gradient(135deg, #eef2f3 0%, #f6f9fc 100%)',
      minHeight: 'calc(100vh - 64px)', // AppBar yüksekliği çıkarıldı (varsayılan)
    }}>
      <Typography variant="h3" component="h1" align="center" sx={{
        color: '#1a237e', // Daha koyu bir ana renk
        mb: { xs: 3, md: 5 }, // Mobil için margin ayarı
        fontWeight: 'bold',
        // borderBottom: '3px solid #303f9f',
        pb: 1,
        letterSpacing: '0.5px',
      }}>
        Antrenman Kataloğu
      </Typography>

      {/* Arama ve Filtreleme Alanı - Paper ile gruplandı */}
      <Paper elevation={3} sx={{
        p: { xs: 2, md: 3 }, // İç boşluk
        mb: { xs: 4, md: 6 }, // Alt boşluk
        
        // Mobilde tek sütun, daha büyük ekranlarda iki sütun
        flexDirection: 'column',
    
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: '800px',
        mx: 'auto', // Ortala
        borderRadius: '12px', // Yumuşak köşeler
        background: '#ffffff', // Beyaz arka plan
      }}>
        <Grid container spacing={3}  sx={{display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }}}alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              label="Antrenman Ara"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: '8px' } // Input içi köşe yuvarlaklığı
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                  '&:hover fieldset': { borderColor: '#1a237e' }, // Hover rengi
                },
                '& .MuiInputLabel-root': { color: 'text.secondary' }, // Label rengi
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end',minWidth: '70%' }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel sx={{ color: 'text.secondary'
               }}>Seviye Filtrele</InputLabel>
              <Select
                value={selectedLevel}
                onChange={handleLevelChange}
                label="Seviye Filtrele"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon color="action" />
                  </InputAdornment>
                 }
                sx={{ borderRadius: '8px' }} // Select köşe yuvarlaklığı
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="Beginner">Başlangıç</MenuItem>
                <MenuItem value="intermediate">Orta</MenuItem>
                <MenuItem value="advanced">İleri</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Antrenman Kartları */}
      {filteredWorkouts.length === 0 ? (
          // --- Boş Durum (İlk yükleme veya Filtre sonrası) ---
           <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="40vh" textAlign="center" px={2}>
             <SentimentVeryDissatisfiedIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
             <Typography variant="h6" color="text.secondary">
               {workouts.length === 0 ? "Henüz hiç antrenman oluşturulmamış." : "Aradığınız kriterlere uygun antrenman bulunamadı."}
            </Typography>
          </Box>
      ) : (
      <Grid container spacing={4} sx={{display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }}} justifyContent="center">
        {filteredWorkouts.map(workout => {
          const creatorName = users[workout.userId]?.name || "Bilinmiyor";
          // Basit bir seviye renk eşlemesi (isteğe bağlı)
          const levelColor = {
            Beginner: '#4caf50', // Yeşil
            intermediate: '#ff9800', // Turuncu
            advanced: '#f44336', // Kırmızı
          }[workout.level] || 'text.secondary'; // Varsayılan

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={workout.id}> {/* lg ekledik */}
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px', // Daha belirgin yuvarlak köşeler
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.1)', // Daha belirgin gölge
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                },
              }}>
                {/* Örnek Görsel Alanı - Buraya gerçek resim URL'si veya dinamik ikon gelebilir */}
                <CardMedia
                  component="img"
                  height="160"
                  // Rastgele bir fitness resmi (placeholder)
                  image={`https://loremflickr.com/400/300/sports`} // Her kart için farklı resim
                  alt={`${workout.title} antrenmanı`}
                  sx={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }} // Resmin köşeleri de yuvarlak
                />
                <CardContent sx={{ flexGrow: 1, padding: '16px 20px' }}> {/* Padding ayarı */}
                  <Typography variant="h6" component="div" sx={{
                    fontWeight: 'bold',
                    color: '#1a237e', // Ana başlık rengi
                    mb: 1, // Alt boşluk
                    lineHeight: 1.3, // Satır yüksekliği
                    minHeight: '42px' // Başlığın 2 satır kaplaması için yer
                  }}>
                    {workout.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block', fontStyle: 'italic' }}>
                    Oluşturan: {creatorName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '60px' }}> {/* Açıklama için min yükseklik */}
                    {/* Açıklamayı kısaltabiliriz */}
                    {workout.description?.length > 100
                       ? `${workout.description.substring(0, 97)}...`
                       : workout.description || "Açıklama bulunmuyor."}
                  </Typography>
                  {/* İkonlarla Süre ve Seviye */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto" mb={1}>
                     <Box display="flex" alignItems="center">
                       <AccessTimeIcon sx={{ fontSize: 18, mr: 0.5, color: 'action.active' }} />
                       <Typography variant="body2" color="text.secondary">
                         {workout.duration || '?'} dk
                       </Typography>
                     </Box>
                     <Box display="flex" alignItems="center">
                       <FitnessCenterIcon sx={{ fontSize: 18, mr: 0.5, color: levelColor }} />
                       <Typography variant="body2" sx={{ color: levelColor, fontWeight: 'medium' }}>
                         {workout.level || 'Belirtilmemiş'}
                       </Typography>
                     </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ padding: '0 16px 16px', marginTop: 'auto' }}> {/* Butonu alta sabitler */}
                  <Button
                    variant="contained"
                    // Farklı bir renk denemesi (örn. secondary) veya ana renk
                    color="primary" // Veya "secondary", temanıza göre ayarlayın
                    fullWidth
                    onClick={() => handleStartWorkout(workout.id)}
                    startIcon={<PlayCircleOutlineIcon />} // Başlatma ikonu
                    sx={{
                      borderRadius: '50px', // Tamamen yuvarlak buton
                      padding: '10px 20px',
                      fontWeight: 'bold',
                      textTransform: 'none', // Büyük harf zorunluluğunu kaldır
                      backgroundColor: '#303f9f', // Koyu mavi tonu
                      '&:hover': {
                        backgroundColor: '#1a237e', // Daha koyu hover
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      },
                    }}
                  >
                    Antrenmana Başla
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
     )} {/* filteredWorkouts kontrolü sonu */}
    </Box>
  );
};

export default AllWorkouts;