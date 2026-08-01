import React from "react";
import { Box, Button, Typography } from "@mui/material";

const SelectedExercises = ({ exercises, onRemove, onSelect }) => {
  return (
    <Box sx={{ marginBottom: 2 }}>
      <Typography variant="h6">Egzersizler</Typography>
      {exercises.map((exercise) => (
        <Box key={exercise.id} sx={{ display: "flex", justifyContent: "space-between", marginTop: 1 }}>
          <Typography variant="body2">{exercise.name}</Typography>
          <Box>
            <Button variant="outlined" onClick={() => onSelect(exercise)}>
              Düzenle
            </Button>
            <Button variant="contained" color="secondary" onClick={() => onRemove(exercise.id)} sx={{ marginLeft: 1 }}>
              Kaldır
            </Button>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default SelectedExercises;
