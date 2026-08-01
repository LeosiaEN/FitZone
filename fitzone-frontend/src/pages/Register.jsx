import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import { authApi } from "../api/axios";
import BackgroundImg from "../assets/images/bg.png";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("token");
    if (isAuthenticated) {
      navigate("/profile");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return alert("Parolalar eşleşmiyor.");
    }

    try {
      await authApi.post("/api/auth/register", {
        email,
        password,
      });
      setSuccessMessage("Kayıt başarılı! Giriş yapabilirsiniz.");
      setSnackbarOpen(true);
      navigate("/login");
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Kayıt başarısız.");
      setSnackbarOpen(true);
    }
  };

  return (
    <Box
       sx={{
          color: "white",
          height: "100vh",
          width: "100%",
          backgroundImage: `url(${BackgroundImg})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: {
            xs: "top",   // mobilde ortala
            md: "flex-start", // masaüstünde sola hizala
          },
          alignItems: {
            xs: "center",   // mobilde ortala
            md: "flex-start", // masaüstünde sola hizala
          },
          paddingTop: { 
            xs: "20%",      // mobilde üstten boşluk  
            md: "10%",     // masaüstünde üstten boşluk
          },
          paddingLeft: {
            xs: 0,       // mobilde padding yok
            md: "25%",   // masaüstü için sola kaydır
          },
          paddingBottom: {
            xs: 0,       // mobilde padding yok
            md: "20%",   // masaüstünde aşağı boşluk
          },
        }}
    >
      <Box sx={{ width: "100%", maxWidth: 400, p: 2 }}>
        <Typography variant="h5" component="h1" sx={{display:'flex',alignItems:'center',justifyContent:'center'}}gutterBottom>
          Kayıt Ol
        </Typography>
        <Box>
          <Divider
            sx={{
              backgroundColor: "white",
              height: 2,
              width: "100%",
              marginBottom: 2,
            }}/>
        </Box>
         
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="E-posta"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            sx={{
              backgroundColor: "white", // Arka plan rengini beyaz yapıyoruz
              borderRadius: "4px",
              "& .MuiInputBase-root": {
                backgroundColor: "white", // İç alanın da beyaz olması için
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white", // Kenarlık rengini beyaz yapıyoruz
                },
              },
            }}
          />
          <TextField
            label="Parola"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            sx={{
              backgroundColor: "white", // Arka plan rengini beyaz yapıyoruz
              borderRadius: "4px",
              "& .MuiInputBase-root": {
                backgroundColor: "white", // İç alanın da beyaz olması için
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white", // Kenarlık rengini beyaz yapıyoruz
                },
              },
            }}
          />
          <TextField
            label="Parolayı tekrar girin"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            sx={{
              backgroundColor: "white", // Arka plan rengini beyaz yapıyoruz
              borderRadius: "4px",
              "& .MuiInputBase-root": {
                backgroundColor: "white", // İç alanın da beyaz olması için
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white", // Kenarlık rengini beyaz yapıyoruz
                },
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Kayıt Ol
          </Button>
          <Typography
            variant="body2"
            component="h6"
            gutterBottom
            onClick={() => navigate("/login")}
            sx={{
              mt: 2,
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 400,
              color: "white", // Yazıyı beyaz yapıyoruz
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Zaten hesabınız var mı? Giriş yapın.
          </Typography>
        </Box>
      </Box>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {errorMessage ? (
          <Alert severity="error" onClose={() => setSnackbarOpen(false)}>
            {errorMessage}
          </Alert>
        ) : successMessage ? (
          <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
            {successMessage}
          </Alert>
        ) : null}
      </Snackbar>
    </Box>
  );
}
