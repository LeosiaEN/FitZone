import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import { authApi, userApi } from "../api/axios";
import BackgroundImg from "../assets/images/bg.png";

export default function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);  // Beni hatırla state
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const expiration = localStorage.getItem("tokenExpiration");
  
    if (token && expiration) {
      const expirationTime = new Date(expiration).getTime();
      const now = Date.now();
  
      if (expirationTime < now) {
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiration");
      } else {
        navigate("/profile");
      }
    }
  }, [navigate]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await authApi.post("/api/auth/login", {
        email,
        password,
        rememberMe,  // rememberMe parametresi gönderiliyor
      });
  
      if (response.data.token) {
        const token = response.data.token;
  
        // Beni hatırla seçeneği aktifse token'ı uzun süreli sakla (7 gün / 14 gün)
        if (rememberMe) {
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 7); // 7 gün süreli token
          localStorage.setItem("token", token);
          localStorage.setItem("tokenExpiration", expirationDate); // Token'ın bitiş tarihi
        } else {
          // Token'ı sadece 1 saat sakla
          localStorage.setItem("token", token);
          const expirationDate = new Date();
          expirationDate.setHours(expirationDate.getHours() + 1); // 1 saat süreli token
          localStorage.setItem("tokenExpiration", expirationDate);
        }
  
        setSuccessMessage("Giriş başarılı!");
        setSnackbarOpen(true);
        setIsAuthenticated(true);
  
        const config = { headers: { Authorization: `Bearer ${token}` } };
  
        try {
          await userApi.get("/api/users/me", config);
          navigate("/profile");
        } catch (error) {
          if (error.response && error.response.status === 404) {
            navigate("/profile-create");
          } else {
            console.error("Profil kontrol hatası:", error);
            navigate("/profile");
          }
        }
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error || "Bir hata oluştu. Lütfen tekrar deneyin."
      );
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
        <Typography variant="h5" component="h1" sx={{fontWeight:600,justifyContent:'center',alignItems:'center',display:'flex'}} gutterBottom>
          Giriş Yap
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
              backgroundColor: "white",  // Arka plan rengini beyaz yapıyoruz
              borderRadius: "4px",       // Köşe yuvarlama
              "& .MuiInputBase-root": {
                backgroundColor: "white", // İç alanın da beyaz olması için ek stil
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white", // Kenarlık rengini beyaz yapıyoruz
                },
              },
            }}
          />
          <TextField
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            sx={{
              backgroundColor: "white",  // Arka plan rengini beyaz yapıyoruz
              borderRadius: "4px",       // Köşe yuvarlama
              "& .MuiInputBase-root": {
                backgroundColor: "white", // İç alanın da beyaz olması için ek stil
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white", // Kenarlık rengini beyaz yapıyoruz
                },
              },
            }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                color="primary"
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#4CAF50", // Switch yeşil renk
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#4CAF50", // Track kısmı yeşil
                  },
                  "& .MuiSwitch-switchBase": {
                    color: "#FFFFFF", // Başlangıç rengi beyaz
                  },
                  "& .MuiSwitch-track": {
                    backgroundColor: "#BDBDBD", // Track kısmı gri
                  },
                }}
              />
            }
            label="Beni hatırla"
            sx={{
              color: "white",
              mt: 2,
              fontSize: "1rem", // Modern font boyutu
              fontWeight: 400,
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Giriş
          </Button>
          <Typography
            variant="body2"
            component="h6"
            gutterBottom
            onClick={() => navigate("/register")}
            sx={{
              mt: 2,
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 400,
              color: "white",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Hesap oluştur
          </Typography>
        </Box>
      </Box>

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
