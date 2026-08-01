import { useState } from "react";
import { userApi } from "../../../api/axios"; // axios instance
import { Button, TextField, DialogActions, MenuItem } from "@mui/material";

export default function ProfileEdit({ initialData, onClose, onSave }) {
  const [profile, setProfile] = useState(initialData || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: ["age", "height", "weight", "gender"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await userApi.post("/api/users/create", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profil güncellendi.");
      onSave?.(); // fetchProfile çağır
      onClose();  // dialog kapat
    } catch (err) {
      console.error("Profil güncellenemedi:", err.response?.data || err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "1rem", maxWidth: 400 }}>
      <TextField fullWidth label="Ad Soyad" name="name" value={profile.name} onChange={handleChange} margin="normal" />
      <TextField fullWidth type="number" label="Yaş" name="age" value={profile.age} onChange={handleChange} margin="normal" />
      <TextField fullWidth type="number" label="Boy (cm)" name="height" value={profile.height} onChange={handleChange} margin="normal" />
      <TextField fullWidth type="number" label="Kilo (kg)" name="weight" value={profile.weight} onChange={handleChange} margin="normal" />
      <TextField
        select
        fullWidth
        label="Cinsiyet"
        name="gender"
        value={profile.gender}
        onChange={handleChange}
        margin="normal"
      >
        <MenuItem value={0}>Erkek</MenuItem>
  <MenuItem value={1}>Kadın</MenuItem>
  <MenuItem value={2}>Diğer</MenuItem>
      </TextField>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button type="submit" variant="contained">Kaydet</Button>
      </DialogActions>
    </form>
  );
}
