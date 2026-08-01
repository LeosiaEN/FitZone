import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Chip,
  Paper,
  Divider,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { nutritionApi } from "../../../api/axios";

const MealForm = ({ onMealCreated, foodItems }) => {
  const [newMeal, setNewMeal] = useState({
    mealType: "",
    date: "",
    planName: "",
    items: [],
  });

  const [currentItem, setCurrentItem] = useState({
    foodItemId: "",
    amountInGrams: "",
  });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setNewMeal((prev) => ({ ...prev, date: today }));
  }, []);

  const handleAddItem = () => {
    if (currentItem.foodItemId && currentItem.amountInGrams) {
      setNewMeal((prev) => ({
        ...prev,
        items: [...prev.items, currentItem],
      }));
      setCurrentItem({ foodItemId: "", amountInGrams: "" });
    }
  };

  const handleCreateMeal = async () => {
    try {
      await nutritionApi.post("/api/nutrition", newMeal);
      setNewMeal({
        mealType: "",
        date: newMeal.date,
        planName: "",
        items: [],
      });
      onMealCreated();
    } catch (err) {
      console.error("Error creating meal:", err);
    }
  };

  return (
    <Card sx={{ p: 4, borderRadius: 4, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Yeni Öğün Planı
        </Typography>

        <Grid container spacing={2} sx={{ display: "grid", gridTemplateColumns: "auto auto auto" }}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Plan Adı"
              fullWidth
              value={newMeal.planName}
              onChange={(e) =>
                setNewMeal({ ...newMeal, planName: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Öğün Türü</InputLabel>
              <Select
                value={newMeal.mealType}
                onChange={(e) =>
                  setNewMeal({ ...newMeal, mealType: e.target.value })
                }
                label="Öğün Türü"
              >
                <MenuItem value="breakfast">Kahvaltı</MenuItem>
                <MenuItem value="lunch">Öğle</MenuItem>
                <MenuItem value="dinner">Akşam</MenuItem>
                <MenuItem value="snack">Ara Öğün</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Tarih"
              type="date"
              fullWidth
              value={newMeal.date}
              onChange={(e) =>
                setNewMeal({ ...newMeal, date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" gutterBottom>
          Yiyecek Ekle
        </Typography>

        <Grid container spacing={2} sx={{ display: "grid", gridTemplateColumns: "auto auto auto" }}>
          <Grid item xs={12} sm={6} >
            <FormControl fullWidth>
              <InputLabel>Yiyecek</InputLabel>
              <Select
                value={currentItem.foodItemId || ""}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    foodItemId: parseInt(e.target.value),
                  })
                }
                label="Yiyecek"
              >
                {foodItems.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={8} sm={4}>
            <TextField
              type="number"
              label="Gram"
              fullWidth
              value={currentItem.amountInGrams}
              onChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  amountInGrams: parseInt(e.target.value),
                })
              }
            />
          </Grid>

          <Grid item xs={4} sm={2}>
            <Button
              onClick={handleAddItem}
              variant="outlined"
              startIcon={<AddIcon />}
              fullWidth
              sx={{ height: "100%" }}
            >
              Ekle
            </Button>
          </Grid>
        </Grid>

        {newMeal.items.length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Eklenen Yiyecekler
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                backgroundColor: "#fafafa",
              }}
            >
              {newMeal.items.map((item, index) => {
                const food = foodItems.find((f) => f.id === item.foodItemId);
                return (
                  <Chip
                    key={index}
                    label={`${food?.name} - ${item.amountInGrams}g`}
                    color="primary"
                  />
                );
              })}
            </Paper>
          </Box>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 4, py: 1.5, fontWeight: 600 }}
          onClick={handleCreateMeal}
          disabled={!newMeal.mealType || newMeal.items.length === 0}
        >
          Öğünü Kaydet
        </Button>
      </CardContent>
    </Card>
  );
};

export default MealForm;
