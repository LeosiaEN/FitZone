// src/components/ExerciseCard.jsx
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

const ExerciseCard = ({ exercise, isSelected, onClick, sx = {} }) => {
  return (
    <Card
      variant="outlined"
      onClick={() => onClick(exercise)}
      sx={{
        ...sx,
        cursor: "pointer",
        border: isSelected ? "2px solid green" : "1px solid rgba(0, 0, 0, 0.12)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        '&:hover': {
          borderColor: isSelected ? "green" : "rgba(0, 0, 0, 0.4)",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
        }
      }}
    >
      {/* Görsel Alanı - Kare oran (1:1) */}
      <Box sx={{ position: "relative", width: "100%", paddingTop: "100%", overflow: "hidden" }}>
        <img
          src={exercise.imageUrl || "https://loremflickr.com/400/300/sports"}
          alt={exercise.name}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>

      {/* Metin Alanı */}
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 2
        }}
      >
        <Typography sx={{ fontSize: "1rem", fontWeight: "bold", mb: 0.5 }}>
          {exercise.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {exercise.category}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;
