import React, { useState, useEffect } from "react";
import { Button, TextField, Stack } from "@mui/material";

const SetRepInput = ({ exercise, onConfirm, onCancel }) => {
  const [sets, setSets] = useState(exercise.sets || 3);
  const [reps, setReps] = useState(exercise.reps || 12);

  useEffect(() => {
    if (exercise) {
      setSets(exercise.sets || 3);
      setReps(exercise.reps || 12);
    }
  }, [exercise]);

  const handleConfirm = () => {
    onConfirm({ ...exercise, sets, reps });
  };

  return (
    <Stack spacing={2}>
      <TextField
        label="Set Sayısı"
        type="number"
        variant="outlined"
        value={sets}
        onChange={(e) => setSets(Number(e.target.value))}
      />
      <TextField
        label="Tekrar Sayısı"
        type="number"
        variant="outlined"
        value={reps}
        onChange={(e) => setReps(Number(e.target.value))}
      />
      <Stack direction="row" spacing={2} sx={{ marginTop: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          İptal Et
        </Button>
        <Button variant="contained" onClick={handleConfirm}>
          Ekle
        </Button>
      </Stack>
    </Stack>
  );
};

export default SetRepInput;
