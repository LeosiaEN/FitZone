// src/components/ExerciseSelectionModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  Grid,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress, // Yüklenme göstergesi için
  Box // Box eklendi
} from "@mui/material";
import { Close, Search } from "@mui/icons-material"; // Search ikonu eklendi
// ExerciseCard'ın iç sarmalayıcı Grid item'ının kaldırıldığından emin olun
// (Bir önceki cevaptaki ExerciseCard kodunu kullanın)
import ExerciseCard from "./ExerciseCard";

const ExerciseSelectionModal = ({
  open,
  onClose,
  exercises: allExercises,
  categories,
  selectedExercisesMap,
  onExerciseSelect,
  isLoading = false, // Egzersizlerin yüklenip yüklenmediği bilgisi
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [filteredExercises, setFilteredExercises] = useState([]); // Başlangıçta boş

  // Filtreleme mantığı
  useEffect(() => {
    let filtered = allExercises;

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((e) =>
        e.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        (e.category && e.category.toLowerCase().includes(lowerCaseSearchTerm)) // Kategori null/undefined değilse kontrol et
      );
    }

    if (selectedCategory !== "Tümü") {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }

    setFilteredExercises(filtered);
  }, [searchTerm, selectedCategory, allExercises]);

    // Modal kapandığında filtreleri sıfırla
    useEffect(() => {
        if (!open) {
            setSearchTerm("");
            setSelectedCategory("Tümü");
        }
    }, [open]);

  return (
    // scroll='body' yerine 'paper' daha iyi modal içi scroll için
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Egzersiz Seç
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: (theme) => theme.palette.grey[500] }} // Close butonu rengi
        >
          <Close />
        </IconButton>
      </DialogTitle>
      {/* Dialog içeriği için padding ve dividers */}
      <DialogContent dividers sx={{ p: {xs: 1, sm: 2, md: 3}, bgcolor: 'grey.50' }}> {/* Arka plan rengi eklendi */}
        {/* Arama ve Kategori Filtreleri */}
        {/* position: sticky ile filtreler yukarı sabitlendi */}
        <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
                mb: 3, // Alt boşluk artırıldı
                position: 'sticky',
                top: -24, // DialogContent padding'ini dengelemek için negatif top (-16px veya -24px)
                bgcolor: 'grey.50', // Arka plan rengi content ile aynı
                zIndex: 1,
                py: 2, // Dikey padding
                mt: -3, // DialogContent padding'ini dengelemek için negatif margin
                mx: {xs: -1, sm: -2, md: -3}, // DialogContent padding'ini dengelemek için negatif margin
                px: {xs: 1, sm: 2, md: 3}, // İç padding
                borderBottom: '1px solid', // Ayırıcı çizgi
                borderColor: 'divider'
            }}
        >
          <TextField
            label="Egzersiz veya Kategori Ara"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
             InputProps={{
                 startAdornment: (
                     <Search sx={{ color: 'action.active', mr: 1 }} />
                 ),
             }}
          />
          <FormControl fullWidth size="small" variant="outlined">
            <InputLabel>Kategori</InputLabel>
            <Select
              value={selectedCategory}
              label="Kategori"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Egzersiz Listesi */}
        {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                 <CircularProgress />
             </Box>
        ) : (
             // Grid container
             <Grid container spacing={3} alignItems="stretch" sx={{justifyContent:"center",alignItems:"center"}}> {/* Tüm kartlar aynı hizada uzasın */}
  {filteredExercises.length > 0 ? (
    filteredExercises.map((exercise) => (
      <Grid
        item
        xs={12}
        sm={6}
        md={4}
        lg={3}
        key={exercise.id}
        sx={{ display: 'flex', justifyContent: 'center' }}
      >
        <ExerciseCard
          exercise={exercise}
          isSelected={!!selectedExercisesMap[exercise.id]}
          onClick={() => onExerciseSelect(exercise)}
          sx={{ width: 260, height: 320 }} // Sabit genişlik ve yükseklik
        />
      </Grid>
    ))
  ) : (
    <Grid
      item
      xs={12}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 6,
        minHeight: "200px",
      }}
    >
      <Typography variant="h6" color="text.secondary" align="center">
        Arama kriterlerine uygun egzersiz bulunamadı.
      </Typography>
    </Grid>
  )}
</Grid>

         )}
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseSelectionModal;