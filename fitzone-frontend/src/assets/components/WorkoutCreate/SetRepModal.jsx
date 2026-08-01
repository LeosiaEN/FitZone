// src/components/SetRepModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions, // DialogActions eklendi
  IconButton,
  TextField,
  Button,
  Box,
  Typography // Typography eklendi
} from "@mui/material";
import { Close } from "@mui/icons-material";

const SetRepModal = ({ open, onClose, exercise, initialSets = 3, initialReps = 12, onSave }) => {
  const [sets, setSets] = useState(initialSets);
  const [reps, setReps] = useState(initialReps);

  // exercise veya initial değerler değiştiğinde state'i güncelle
  useEffect(() => {
      // Sadece modal açıldığında ve exercise değiştiğinde sıfırla
      if(open && exercise) {
        setSets(initialSets);
        setReps(initialReps);
      }
  }, [open, exercise, initialSets, initialReps]); // open'ı dependency'ye ekle

  const handleSave = () => {
    if (exercise) {
      // Girilen değerlerin geçerli olduğundan emin olalım
      const finalSets = isNaN(parseInt(sets)) || sets < 1 ? 1 : parseInt(sets);
      const finalReps = isNaN(parseInt(reps)) || reps < 1 ? 1 : parseInt(reps);
      onSave(exercise.id, finalSets, finalReps);
    }
     // onClose(); // Kaydetme sonrası otomatik kapatma yerine, kullanıcıya bırakılabilir veya parent karar verebilir. Şimdilik kaldıralım, parent zaten kapatıyor.
  };

   // Sayısal olmayan veya 1'den küçük değerleri engelleme (giriş anında)
  const handleSetChange = (e) => {
    const value = e.target.value;
     // Sadece sayısal veya boş girişe izin ver
     if (/^\d*$/.test(value)) {
        setSets(value === "" ? "" : Math.max(1, parseInt(value))); // Boş bırakmaya izin ver, ama en az 1 olmalı
     }
  };

  const handleRepChange = (e) => {
     const value = e.target.value;
     if (/^\d*$/.test(value)) {
        setReps(value === "" ? "" : Math.max(1, parseInt(value)));
     }
  };


  if (!exercise) return null;

  // Kaydet butonunun disabled durumu
  const isSaveDisabled = sets === "" || reps === "" || parseInt(sets) < 1 || parseInt(reps) < 1;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth> {/* Daha küçük modal */}
      <DialogTitle sx={{ pb: 1 }}> {/* Alt padding azaltıldı */}
        {exercise.name}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{pt: 2}}> {/* Üst padding eklendi */}
        <Box>
          {exercise.videoUrl ? (
            <video
              key={exercise.videoUrl} // URL değiştiğinde videoyu yeniden yükle
              controls
              src={exercise.videoUrl}
              style={{
                width: "100%",
                height: "auto", // Otomatik yükseklik
                maxHeight: 300,
                borderRadius: 8,
                marginBottom: 16,
                display: 'block', // Alt boşluğu kaldırmak için
                backgroundColor: '#f0f0f0' // Video yüklenene kadar arka plan
              }}
               preload="metadata" // Sadece meta veriyi yükle başlangıçta
            />
          ) : (
            <Typography variant="body2" color="text.secondary" align="center" sx={{mb: 2}}>
                Bu egzersiz için video bulunmamaktadır.
            </Typography>
          )}

          <TextField
            label="Set Sayısı"
            variant="outlined"
            type="number" // Tarayıcıya sayı olduğunu belirtir ama kontrol bizde
            inputProps={{ min: 1, inputMode: 'numeric', pattern: '[0-9]*' }} // Mobil klavyeler için ipucu
            value={sets}
            onChange={handleSetChange}
            fullWidth
            sx={{ mb: 2 }}
            required // Zorunlu alan olduğunu belirtir
            error={sets !== "" && parseInt(sets) < 1} // Geçersizse hata göster
            helperText={sets !== "" && parseInt(sets) < 1 ? "En az 1 set olmalı" : ""}
          />
          <TextField
            label="Tekrar Sayısı"
            variant="outlined"
            type="number"
            inputProps={{ min: 1, inputMode: 'numeric', pattern: '[0-9]*' }}
            value={reps}
            onChange={handleRepChange}
            fullWidth
            required
            error={reps !== "" && parseInt(reps) < 1}
            helperText={reps !== "" && parseInt(reps) < 1 ? "En az 1 tekrar olmalı" : ""}
          />
        </Box>
      </DialogContent>
       <DialogActions sx={{padding: '16px 24px'}}> {/* Padding ayarlandı */}
           <Button onClick={onClose} color="inherit"> {/* İptal butonu */}
               İptal
           </Button>
           <Button
               variant="contained"
               onClick={handleSave}
               disabled={isSaveDisabled} // Dinamik disabled durumu
           >
               Kaydet
           </Button>
       </DialogActions>
    </Dialog>
  );
};

export default SetRepModal;