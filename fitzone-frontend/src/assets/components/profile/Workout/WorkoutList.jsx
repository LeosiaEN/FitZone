import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    IconButton,
    Paper,
    Snackbar,
    Link,
    Modal,
    Button,
    Divider,
    CircularProgress, // Yüklenme göstergesi için
    Alert, // Snackbar içinde Alert için
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility"; // View ikonu için (Visibility zaten importlu ama tam isimle import edelim)
import { useNavigate } from "react-router-dom";
import { workoutApi } from "../../../../api/axios";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";
import CloseIcon from "@mui/icons-material/Close";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
// Renk importlarını silebiliriz, tema renklerini kullanalım
// import { grey, green, blueGrey, yellow } from "@mui/material/colors";

const WorkoutList = () => {
    const [workouts, setWorkouts] = useState([]);
    const [error, setError] = useState(null); // Snackbar mesajı için string yerine null/string kullanalım
    const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar açık mı?
    const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar mesajı
    const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Snackbar tipi
    const [openModal, setOpenModal] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Veri çekme yüklenme durumu
    const [isDeleting, setIsDeleting] = useState(false); // Silme yüklenme durumu

    const navigate = useNavigate();
      // Modal boyutu için mobil kontrolü

    // Snackbar gösterme fonksiyonu
    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    // Snackbar kapatma fonksiyonu
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };


    useEffect(() => {
        const fetchWorkouts = async () => {
            setIsLoading(true); // Yükleniyor başlat
            setError(null); // Hata durumunu sıfırla
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                     // Token yoksa hata göster veya login sayfasına yönlendir
                     const message = "Giriş yapmanız gerekiyor.";
                     setError(message);
                     showSnackbar(message, "warning");
                     setIsLoading(false);
                     return;
                }
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await workoutApi.get("/api/workouts/my", config);
                setWorkouts(res.data);
            } catch (err) {
                console.error("Veriler alınamadı:", err);
                const message = err.response?.data?.message || "Antrenman programları yüklenirken bir sorun oluştu.";
                setError(message); // Hata durumunu ayarla
                showSnackbar(message, "error"); // Snackbar ile hata göster
            } finally {
                setIsLoading(false); // Yükleniyor bitir
            }
        };
        fetchWorkouts();
    }, []);

    const handleEdit = (id) => {
        // Düzenleme sayfasına yönlendir
        navigate(`/workouts/edit/${id}`);
    };

    const handleDelete = async (id) => {
        setIsDeleting(true); // Silme yükleniyor başlat
        try {
            const token = localStorage.getItem("token");
             if (!token) {
                  showSnackbar("Silme işlemi için giriş yapmalısınız.", "warning");
                  setIsDeleting(false);
                  return;
             }
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await workoutApi.delete(`/api/workouts/${id}`, config);
            // Silinen antrenmanı listeden çıkararak state'i güncelle
            setWorkouts((prev) => prev.filter((w) => w.id !== id));
            showSnackbar("Antrenman başarıyla silindi.", "success"); // Başarı snackbarı
        } catch (err) {
            console.error("Silme işlemi başarısız:", err);
            const message = err.response?.data?.message || "Antrenman silinirken bir hata oluştu.";
            showSnackbar(message, "error"); // Hata snackbarı
        } finally {
            setIsDeleting(false); // Silme yükleniyor bitir
        }
    };

    const openWorkoutDetails = (workout) => {
        setSelectedWorkout(workout);
        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
        setSelectedWorkout(null); // Modal kapandığında seçili workout'ı temizle
    };

     // Yüklenme durumu render'ı
    if (isLoading && !error) { // Hata yoksa ve yükleniyorsa spinner göster
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

     // Hata durumu render'ı (ilk yüklemede hata olursa)
     if (error && !isLoading) { // Yüklenme bitti ve hata varsa hata mesajı göster
          return (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="error" variant="h6">Bir Sorun Oluştu</Typography>
                  <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>
                   {/* İsteğe bağlı: Yeniden deneme butonu eklenebilir */}
                   {/* <Button variant="outlined" onClick={() => fetchWorkouts()} sx={{ mt: 2 }}> Yeniden Dene </Button> */}
              </Box>
          );
     }


    return (
        <Box sx={{ }}> {/* Responsive padding */}
            {/* Başlık */}
            <Typography
                variant="h6" // Başlık boyutu h5 yapıldı
                fontWeight={600} // Kalınlık ayarı
                gutterBottom
                sx={{
                    display: "flex",
                    alignItems: "center",
                     color: 'text.primary', // Tema rengini kullan
                    mb: 2 // Alt boşluk
                }}
            >
                
                Antrenman Programlarım
            </Typography>
            <Divider sx={{ mb: 3 }} /> {/* Başlığın altına çizgi, boşluk artırıldı */}

            {/* Antrenman Listesi veya Boş Durum Mesajı */}
            {workouts.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                        Henüz oluşturulmuş bir antrenman programı yok.
                    </Typography>
                     <Button variant="contained" sx={{mt: 2}} onClick={() => navigate('/workouts/create')}>
                        İlk Antrenmanını Oluştur
                     </Button>
                </Box>
            ) : (
                <Box sx={{ pointerEvents: isDeleting ? 'none' : 'auto' }}> {/* Silme sırasında listedeki etkileşimi engelle */}
                    {workouts.map((workout) => (
                        <Box
                            key={workout.id}
                             // Paper yerine Box kullandık, stil MealList'e benzer hale getirildi
                            sx={{
                                marginBottom: 2,
                                padding: 2,
                                border: "1px solid", // Kenarlık eklendi
                                borderColor: "divider", // Tema rengini kullan
                                borderRadius: 1, // Kenarlık yuvarlatma
                                backgroundColor: 'background.paper', // Arkaplan beyaz
                                boxShadow: 1, // Hafif gölge
                                transition: "box-shadow 0.3s ease-in-out",
                                "&:hover": {
                                    boxShadow: 3, // Hoverda gölge artır
                                     backgroundColor: 'action.hover', // Hafif renk değişimi
                                },
                                cursor: "pointer",
                                display: "flex", // Flexbox ile elemanları yan yana sırala
                                alignItems: "center",
                                justifyContent: "space-between", // Başlık/Açıklama ile ikonları ayır
                            }}
                             onClick={() => openWorkoutDetails(workout)} // Kutunun tamamına tıklama ile modalı aç
                        >
                            {/* Sol taraf: Başlık ve açıklama */}
                            <Box sx={{ flexGrow: 1, mr: 2 }}> {/* Genişlemesi için flexGrow ve sağ boşluk */}
                                <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.primary' }}> {/* Tema rengini kullan */}
                                    {workout.title}
                                </Typography>
                                {workout.description && ( // Açıklama varsa göster
                                     <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                         {workout.description?.length > 80 ? `${workout.description.slice(0, 80)}...` : workout.description} {/* Açıklamanın ilk kısmı */}
                                     </Typography>
                                )}
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 'bold' }}>
                                     Süre: {workout.duration} dk | Seviye: {workout.level}
                                </Typography>
                            </Box>

                            {/* Sağ taraf: İkonlar */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}> {/* İkonlar arasına boşluk */}
                                 {/* Herkese Açık/Gizli İkonu */}
                                <IconButton
                                    title={workout.isPublic ? "Herkese açık" : "Gizli"}
                                     // Tema rengini kullan, renkler 'success' ve 'error' ile belirtilebilir
                                    sx={{ color: workout.isPublic ? 'success.main' : 'error.main' }}
                                     // Bu ikonun tıklanması da modalı açsın (isteğe bağlı olarak kaldırılabilir)
                                     onClick={(e) => { e.stopPropagation(); openWorkoutDetails(workout); }}
                                >
                                     {workout.isPublic ? <PublicIcon fontSize="small" /> : <LockIcon fontSize="small" />} {/* İkon boyutu ayarlandı */}
                                </IconButton>
                                {/* Düzenle Butonu */}
                                <IconButton
                                     aria-label={`Edit ${workout.title}`} // Erişilebilirlik etiketi
                                    onClick={(e) => { e.stopPropagation(); handleEdit(workout.id); }} // Kutu click olayını engelle
                                    size="small"
                                     sx={{ color: 'warning.main' }} // Tema rengini kullan
                                >
                                    <Edit fontSize="small" /> {/* İkon boyutu ayarlandı */}
                                </IconButton>
                                {/* Sil Butonu */}
                                <IconButton
                                    aria-label={`Delete ${workout.title}`} // Erişilebilirlik etiketi
                                    onClick={(e) => { e.stopPropagation(); handleDelete(workout.id); }} // Kutu click olayını engelle
                                    size="small"
                                     sx={{ color: 'error.main' }} // Tema rengini kullan
                                     disabled={isDeleting} // Silme işlemi varken disable et
                                >
                                     {isDeleting ? <CircularProgress size={20} color="inherit" /> : <Delete fontSize="small" />} {/* Silme sırasında spinner göster */}
                                </IconButton>
                            </Box>
                        </Box>
                    ))}
                     {isDeleting && ( // Global silme spinner'ı (isteğe bağlı, buton spinner'ı yeterli olabilir)
                         <Box sx={{ textAlign: 'center', mt: 2 }}>
                              <CircularProgress size={30} />
                         </Box>
                     )}
                </Box>
            )}

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000} // Süre biraz kısaltıldı
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarSeverity} // severity prop'unu kullan
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage} {/* mesaj prop'unu kullan */}
                </Alert>
            </Snackbar>

            {/* Workout Detayları için Modal */}
            <Modal
                open={openModal}
                onClose={closeModal}
                aria-labelledby="workout-modal-title"
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                 <Box // Paper yerine Box kullandık, stil NutritionPage modalına benzer hale getirildi
                     sx={{
                         width: "95%", // Modal genişliği
                         maxWidth: 600, // Maksimum genişlik ayarı
                         bgcolor: "background.paper", // Arkaplan rengi
                         padding: { xs: 2, sm: 3 }, // Responsive padding
                         borderRadius: 2, // Kenarlık yuvarlatma
                         boxShadow: 5, // Gölge
                         overflowY: "auto", // İçerik taşarsa scroll
                         maxHeight: "90vh", // Maksimum yükseklik
                         position: "relative", // Kapat butonunu konumlandırmak için
                         border: '1px solid', // Kenarlık eklendi
                         borderColor: 'divider', // Tema rengini kullan
                     }}
                 >
                     {/* Kapatma Butonu */}
                     <IconButton
                         onClick={closeModal}
                         sx={{
                             position: "absolute",
                             top: 8, // Konum ayarı
                             right: 8, // Konum ayarı
                             color: 'action.active', // Tema rengini kullan
                         }}
                     >
                         <CloseIcon />
                     </IconButton>

                     {/* Modal Başlığı (Workout Adı) */}
                     <Typography
                         id="workout-modal-title"
                         variant="h6" // Modal başlığı h6 yapıldı
                         fontWeight={600}
                         gutterBottom
                         sx={{ mr: 4 }} // Kapat butonuna yer bırak
                     >
                         {selectedWorkout?.title}
                     </Typography>

                      {/* Açıklama */}
                      {selectedWorkout?.description && ( // Açıklama varsa göster
                           <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                               {selectedWorkout.description}
                           </Typography>
                      )}


                     {/* Genel Bilgiler (Süre, Seviye, Durum) */}
                     <Box sx={{ mb: 3 }}> {/* Alt boşluk artırıldı */}
                         <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                             Süre: <Box component="b" sx={{ color: 'text.secondary', fontWeight: 'normal' }}>{selectedWorkout?.duration} dk</Box>
                         </Typography>
                         <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                             Seviye: <Box component="b" sx={{ color: 'text.secondary', fontWeight: 'normal' }}>{selectedWorkout?.level}</Box>
                         </Typography>
                         <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', color: 'text.primary' }}>
                             Durum: <Box component="b" sx={{ color: selectedWorkout?.isPublic ? 'success.main' : 'error.main', fontWeight: 'normal' }}>
                                 {selectedWorkout?.isPublic ? "Herkese Açık" : "Gizli"}
                             </Box>
                         </Typography>
                     </Box>

                     <Divider sx={{ mb: 3 }} /> {/* Alt boşluk artırıldı */}

                     {/* Egzersiz Listesi Başlığı */}
                     <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}> {/* Başlık boyutu ve renk */}
                         Egzersizler:
                     </Typography>

                     {/* Egzersizleri Listele */}
                     {selectedWorkout?.exercises?.length === 0 ? (
                         <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                             Bu workout'a henüz egzersiz eklenmemiş.
                         </Typography>
                     ) : (
                         selectedWorkout?.exercises?.map((exerciseItem) => ( // exercise yerine exerciseItem kullanıldı isim çakışmaması için
                             <Box // Paper yerine Box kullandık, stil NutritionPage modalındaki Cardlara benzer hale getirildi
                                 key={exerciseItem.id}
                                 sx={{
                                     padding: 2, // İç padding
                                     marginBottom: 1.5, // Alt boşluk
                                     backgroundColor: 'background.paper', // Arkaplan rengi
                                     border: "1px solid", // Kenarlık eklendi
                                     borderColor: "divider", // Tema rengini kullan
                                     borderRadius: 1, // Kenarlık yuvarlatma
                                     boxShadow: 1, // Hafif gölge
                                 }}
                             >
                                 <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5, color: 'text.primary' }}> {/* Başlık boyutu ve renk */}
                                     {exerciseItem.exercise?.name || 'Bilinmeyen Egzersiz'} {/* exercise objesi null/undefined olabilir */}
                                 </Typography>
                                 {exerciseItem.exercise?.category && ( // Kategori varsa göster
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                          Kategori: <b>{exerciseItem.exercise.category}</b>
                                      </Typography>
                                 )}
                                  <Typography variant="body2" color="text.secondary">
                                      Set: <b>{exerciseItem.sets}</b> | Tekrar: <b>{exerciseItem.reps}</b>
                                  </Typography>
                                  {exerciseItem.exercise?.videoUrl && ( // Video linki varsa göster
                                      <Box sx={{ marginTop: 1.5 }}> {/* Üst boşluk */}
                                          <Link href={exerciseItem.exercise.videoUrl} target="_blank" rel="noopener" sx={{ textDecoration: 'none' }}> {/* Altı çizili olmasın */}
                                              <Button
                                                  variant="outlined"
                                                  color="primary" // Tema rengini kullan
                                                  fullWidth
                                                  size="small" // Boyut
                                                  startIcon={<PlayCircleFilledIcon />}
                                                   sx={{ borderRadius: 1 }} // Buton köşeleri yuvarlatma
                                              >
                                                  Videoyu İzle
                                              </Button>
                                          </Link>
                                      </Box>
                                  )}
                              </Box>
                          ))
                      )}


                     {/* Modal Kapat Butonu */}
                     <Box sx={{ mt: 3, textAlign: "right" }}>
                         <Button onClick={closeModal} variant="outlined" color="primary"
                              sx={{
                                  py: 1.2, // Dikey padding WorkoutCreate butonu gibi
                                  fontSize: "0.9rem", // Font boyutu WorkoutCreate butonu gibi
                                  fontWeight: 600,
                                  borderRadius: 1, // Kenarlık yuvarlatma
                              }}
                         >
                             Kapat
                         </Button>
                     </Box>
                 </Box>
            </Modal>
        </Box>
    );
};

export default WorkoutList;