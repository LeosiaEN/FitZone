// src/components/SelectedExercisesTable.jsx
import React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Typography,
  Box
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material"; // Edit icon added

// onEditExercise prop added
const SelectedExercisesTable = ({ selectedExercisesMap, allExercises, onRemoveExercise, onEditExercise }) => {
  const selectedEntries = Object.entries(selectedExercisesMap);

  const exerciseDetailsMap = allExercises.reduce((acc, ex) => {
    acc[ex.id] = ex;
    return acc;
  }, {});

  return (
    <TableContainer component={Paper} sx={{ mt: 3, overflowX: 'auto' }}>
  <Table aria-label="selected exercises table" size="small">
    <TableHead>
      <TableRow>
        <TableCell sx={{ fontWeight: 'bold' }}>Egzersiz</TableCell>
        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Set</TableCell>
        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tekrar</TableCell>
        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Aksiyon</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {selectedEntries.length > 0 ? (
        selectedEntries.map(([id, { sets, reps }]) => {
          const exercise = exerciseDetailsMap[id];
          return (
            <TableRow key={id} hover>
              <TableCell component="th" scope="row">
                {exercise?.name || `ID: ${id} (Bilinmiyor)`}
              </TableCell>
              <TableCell align="center">{sets}</TableCell>
              <TableCell align="center">{reps}</TableCell>
              <TableCell align="right">
                <IconButton
                  onClick={() => exercise && onEditExercise(exercise)}
                  color="primary"
                  aria-label={`edit ${exercise?.name || "unknown exercise"}`}
                  size="small"
                  sx={{ mr: 0.5 }}
                >
                  <Edit fontSize="small"/>
                </IconButton>
                <IconButton
                  onClick={() => onRemoveExercise(id)}
                  color="error"
                  aria-label={`remove ${exercise?.name || "unknown exercise"}`}
                  size="small"
                >
                  <Delete fontSize="small"/>
                </IconButton>
              </TableCell>
            </TableRow>
          );
        })
      ) : (
        <TableRow>
          <TableCell colSpan={4} align="center">
            <Typography color="text.secondary" sx={{ py: 3 }}>
              Workout'unuza egzersiz eklemek için 'Egzersiz Ekle' butonunu kullanın.
            </Typography>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>

  );
};

export default SelectedExercisesTable;
