// src/components/WorkoutHeader.jsx
import React from "react";
import {
 Card,
 CardContent,
 Typography,
 Grid,
 TextField,
 // ToggleButtonGroup, // Kullanılmıyor, kaldırılabilir
 // ToggleButton, // Kullanılmıyor, kaldırılabilir
 Button,
 Tooltip,
 // Box, // Sadece sx içinde kullanılıyor, kaldırılabilir
 InputAdornment,
 FormControl,
 InputLabel,
 Select,
 MenuItem,
} from "@mui/material";
import { Add } from "@mui/icons-material";

const WorkoutHeader = ({
 title,
 onTitleChange,
 description, // Bu prop zaten geliyor
 onDescriptionChange, // Bu prop zaten geliyor
 duration, // Bu prop zaten geliyor
 onDurationChange, // Bu prop zaten geliyor
 level, // Bu prop zaten geliyor
 onLevelChange, // Bu prop zaten geliyor
 isPublic,
 onPublicChange,
 onAddExerciseClick,
 isAddDisabled,
}) => {
 return (
  <Card
   sx={{
    mb: 4,
    p: 3,
    borderRadius: 4,
    boxShadow: 3,
    backgroundColor: "#f5f5f5",
   }}
  >
   <CardContent>
    <Typography variant="h5" gutterBottom fontWeight={600}>
     Yeni Antrenman Oluştur
    </Typography>

    {/* SX stili kaldırıldı, Material UI'ın kendi responsive grid sistemi kullanılacak */}
    <Grid container spacing={2} >
     <Grid size={{ xs: 12,md: 6 }}> 
      <TextField
      sx={{ width: "100%" }}
       label="Antrenman Adı"
       variant="outlined"
       fullWidth
       value={title}
       onChange={(e) => onTitleChange(e.target.value)}
       required
       error={!title.trim()}
       helperText={!title.trim() ? "Antrenman adı zorunludur" : ""}
      />
     </Grid>

     <Grid size={{ xs: 12 ,md: 6 }}>
      <FormControl fullWidth>
       <InputLabel id="visibility-label">Gizlilik</InputLabel>
       <Select
        labelId="visibility-label"
        value={isPublic ? "public" : "private"}
        label="Gizlilik"
        onChange={(e) => onPublicChange(e.target.value === "public")}
       >
        <MenuItem value="private">🔒 Sadece Benim</MenuItem>
        <MenuItem value="public">🌍 Herkese Açık</MenuItem>
       </Select>
      </FormControl>
     </Grid>

     {/* Bu alanlar zaten buradaydı, Grid container'ın içindeydi. */}
     {/* Sadece yukarıdaki container'dan sx kaldırıldı */}
     <Grid size={{ xs: 12 }}>  
      <TextField
       label="Açıklama (Opsiyonel)"
       variant="outlined"
       value={description}
       onChange={(e) => onDescriptionChange(e.target.value)}
       fullWidth
       multiline
       rows={2}
       size="small"
      />
     </Grid>

     <Grid size={{ xs: 12, md: 6 }}>
      <TextField
       label="Tahmini Süre"
       variant="outlined"
       type="number"
       inputProps={{ min: 1 }}
       InputProps={{
        endAdornment: <InputAdornment position="end">dk</InputAdornment>,
       }}
       value={duration}
       onChange={(e) =>
        onDurationChange(Math.max(1, parseInt(e.target.value) || 1))
       }
       fullWidth
       size="small"
      />
     </Grid>

     <Grid size={{ xs: 12 ,md: 6 }}>
      <FormControl fullWidth variant="outlined" size="small">
       <InputLabel>Seviye</InputLabel>
       <Select value={level} onChange={(e) => onLevelChange(e.target.value)} label="Seviye">
        <MenuItem value="beginner">Başlangıç</MenuItem>
        <MenuItem value="intermediate">Orta</MenuItem>
        <MenuItem value="advanced">İleri</MenuItem>
       </Select>
      </FormControl>
     </Grid>

     <Grid size={{ xs: 12}}>
      <Tooltip
       title={
        isAddDisabled
         ? "Egzersiz eklemek için Antrenman adını girin"
         : "Egzersiz ekle"
       }
       arrow
      >
       <span> {/* Tooltip bir span veya div gerektirir */}
        <Button
         variant="contained"
         color="primary"
         startIcon={<Add />}
         onClick={onAddExerciseClick}
         disabled={isAddDisabled}
         fullWidth
         sx={{ py: 0.7, fontWeight: 600, fontSize: "1rem" }}
        >
         Egzersiz Ekle
        </Button>
       </span>
      </Tooltip>
     </Grid>
    </Grid>
   </CardContent>
  </Card>
 );
};

export default WorkoutHeader;