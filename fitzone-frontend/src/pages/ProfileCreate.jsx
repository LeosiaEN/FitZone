import React, { useState } from 'react';
import { TextField, Button, MenuItem, Typography, Box, Card, CardContent } from '@mui/material';
import { userApi } from '../api/axios'; // userApi import
import { useNavigate } from 'react-router-dom';

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    gender: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
  
      // Gender mapping (0: Erkek, 1: Kadın, 2: Diğer)
      const genderMap = {
        male: 0,
        female: 1,
        other: 2,
      };
  
      const formattedData = {
        ...formData,
        age: Number(formData.age),
        height: Number(formData.height),
        weight: Number(formData.weight),
        gender: genderMap[formData.gender] ?? 2, // bilinmeyen varsa 2 = Diğer gönder
      };
  
      await userApi.post('/api/users/profile', formattedData, config);
      alert('Profil başarıyla oluşturuldu!');
      navigate('/profile');
    } catch (error) {
      console.error('Profil kaydedilemedi:', error);
      alert('Profil kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Box style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card style={{ maxWidth: '500px', margin: 'auto', borderRadius: '12px', padding: '20px' }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Profil Bilgilerini Tamamla
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Ad"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Yaş"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Boy (cm)"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Kilo (kg)"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              select
              label="Cinsiyet"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            >
              <MenuItem value="male">Erkek</MenuItem>
              <MenuItem value="female">Kadın</MenuItem>
              <MenuItem value="other">Diğer</MenuItem>
            </TextField>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              style={{ marginTop: '20px', borderRadius: '30px' }}
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfileSetupPage;
