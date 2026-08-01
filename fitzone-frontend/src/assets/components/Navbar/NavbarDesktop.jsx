import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Stack,
  IconButton,
  useMediaQuery,
  useTheme,
  Slide,
  Divider,
} from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ProfileIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import LoginIcon from "@mui/icons-material/Login";
import RegisterIcon from "@mui/icons-material/HowToReg";
import NutritionIcon from "@mui/icons-material/Fastfood";
import { Link } from "react-router-dom";

const NavbarDesktop = ({ handleLogout, isLoggedIn }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const navItems = isLoggedIn
    ? [
        { text: "Profil", icon: <ProfileIcon />, to: "/profile" },
        { text: "Antrenman Ekle", icon: <AddIcon />, to: "/add-workout" },
        { text: "Spor Programları", icon: <FitnessCenterIcon />, to: "/workout" },
        { text: "Beslenme Planı Oluştur", icon: <NutritionIcon />, to: "/nutrition" },
        { text: "Çıkış", icon: <LogoutIcon />, onClick: handleLogout },
      ]
    : [
        { text: "Giriş Yap", icon: <LoginIcon />, to: "/login" },
        { text: "Kayıt Ol", icon: <RegisterIcon />, to: "/register" },
      ];

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: "linear-gradient(90deg, rgb(0,0,0), rgb(0,0,0))",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "none",
          zIndex: 1300,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box
            display="flex"
            alignItems="center"
            component={Link}
            to="/"
            sx={{ textDecoration: "none", color: "white", fontWeight: "bold" }}
          >
            <FitnessCenterIcon sx={{ mr: 1, fontSize: "2rem" }} />
            <Typography variant="h6">FitZone</Typography>
          </Box>

          {isMobile ? (
            <IconButton color="inherit" onClick={() => setOpen(!open)}>
              {open ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          ) : (
            <Stack direction="row" spacing={2}>
              {navItems.map((item, index) =>
                item.to ? (
                  <Button
                    key={index}
                    component={Link}
                    to={item.to}
                    startIcon={item.icon}
                    sx={{
                      textTransform: "none",
                      fontWeight: "bold",
                      borderRadius: "8px",
                      color: "white",
                      backgroundColor:
                        item.text === "Antrenman Ekle"
                          ? "rgba(255, 140, 0, 0.6)"
                          : item.text === "Beslenme Planı Oluştur"
                          ? "rgba(0, 123, 255, 0.6)"
                          : "transparent",
                      "&:hover": {
                        backgroundColor:
                          item.text === "Antrenman Ekle"
                            ? "rgba(255, 140, 0, 0.8)"
                            : item.text === "Beslenme Planı Oluştur"
                            ? "rgba(0, 123, 255, 0.8)"
                            : "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    {item.text}
                  </Button>
                ) : (
                  <Button
                    key={index}
                    onClick={item.onClick}
                    startIcon={item.icon}
                    sx={{
                      textTransform: "none",
                      fontWeight: "bold",
                      borderRadius: "8px",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    {item.text}
                  </Button>
                )
              )}
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobil Menü İçeriği */}
      <Slide direction="down" in={open} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            background: "linear-gradient(to bottom, #111, #333)",
            zIndex: 1200,
            px: 2,
            py: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {navItems.map((item, index) =>
            item.to ? (
              <Button
                key={index}
                component={Link}
                to={item.to}
                onClick={() => setOpen(false)}
                startIcon={item.icon}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                {item.text}
              </Button>
            ) : (
              <Button
                key={index}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                startIcon={item.icon}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                {item.text}
              </Button>
            )
          )}
        </Box>
      </Slide>
    </>
  );
};

export default NavbarDesktop;
