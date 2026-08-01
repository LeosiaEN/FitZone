import React, { useEffect, useState } from "react";
import {
    Box, // Container yerine Box kullanılacak
    Typography,
    Snackbar, // Snackbar eklendi
    Alert, // Alert eklendi (Snackbar içinde kullanılacak)
    CircularProgress, // Yüklenme göstergesi eklendi
    Grid, // Layout için eklendi (isteğe bağlı, mevcut yapı için Box yeterli olabilir ama consistencuy için ekleyelim)
    useMediaQuery, // Mobil ekran kontrolü için eklendi
    Button, // Hata durumunda sayfayı yenile butonu için eklendi
} from "@mui/material";
import { nutritionApi } from "../api/axios";
import MealForm from "../assets/components/NutritionCreate/MealForm"; // Bu bileşenin snackbar tetikleme callback'i alması gerekebilir
import MealList from "../assets/components/NutritionCreate/MealList";

const NutritionPage = () => {
    const [meals, setMeals] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Yüklenme durumu
    const [error, setError] = useState(null); // Hata durumu
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" }); // Snackbar durumu

    const isMobile = useMediaQuery("(max-width: 600px)"); // Mobil ekran kontrolü

    const fetchMeals = async () => {
        try {
            const res = await nutritionApi.get("/api/nutrition");
            setMeals(res.data);
        } catch (err) {
            console.error("Error fetching meals:", err);
            const message = err.response?.data?.message || "Öğünler yüklenirken bir sorun oluştu.";
            setError(message); // Hata durumunu ayarla
            setSnackbar({ open: true, message: message, severity: "error" }); // Snackbar ile hata göster
        }
    };

    const fetchFoodItems = async () => {
        try {
            const res = await nutritionApi.get("/api/nutrition/food-items");
            setFoodItems(res.data);
        } catch (err) {
            console.error("Error fetching food items:", err);
             const message = err.response?.data?.message || "Besinler yüklenirken bir sorun oluştu.";
             setError(message); // Hata durumunu ayarla
             setSnackbar({ open: true, message: message, severity: "error" }); // Snackbar ile hata göster
        }
    };

    const handleDeleteMeal = async (id) => {
        try {
            await nutritionApi.delete(`/api/nutrition/${id}`);
            setSnackbar({ open: true, message: "Öğün başarıyla silindi.", severity: "success" }); // Başarı snackbarı
            fetchMeals(); // Öğünleri yeniden çek
        } catch (err) {
            console.error("Error deleting meal:", err);
             const message = err.response?.data?.message || "Öğün silinirken bir hata oluştu.";
             setSnackbar({ open: true, message: message, severity: "error" }); // Hata snackbarı
        }
    };

    // MealForm başarıyla tamamlandığında çalışacak callback (MealForm'un bunu çağırması gerekiyor)
    const handleMealCreatedSuccess = () => {
         setSnackbar({ open: true, message: "Öğün başarıyla eklendi!", severity: "success" });
         fetchMeals(); // Öğünleri yeniden çek
    };


    useEffect(() => {
        const fetchData = async () => {
             setIsLoading(true); // Yükleniyor başlat
             setError(null); // Hata durumunu sıfırla
             await Promise.all([fetchMeals(), fetchFoodItems()]); // İki API çağrısını paralel yap
             setIsLoading(false); // Yükleniyor bitir
        };

        fetchData();

    }, []);

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    // Yüklenme durumu render'ı
    if (isLoading && !error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Hata durumu render'ı
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
        <Box p={{ xs: 2, sm: 3 }} sx={{ maxWidth: 900, mx: "auto" }}> {/* Box ve responsive padding */}

            {/* MealForm bileşeni, eğer success callback'i destekliyorsa */}
            <MealForm
                 onMealCreated={handleMealCreatedSuccess} // Bu callback MealForm içinde başarılı işlem sonunda çağrılmalı
                 foodItems={foodItems}
                 isMobile={isMobile} // İhtiyaç duyarsa mobil bilgisi
            />

            {/* MealList bileşeni */}
            <MealList
                 meals={meals}
                 onDelete={handleDeleteMeal}
                 isMobile={isMobile} // İhtiyaç duyarsa mobil bilgisi
            />

            {/* Snackbar */}
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

export default NutritionPage;