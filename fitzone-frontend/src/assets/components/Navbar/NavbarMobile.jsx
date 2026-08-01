import React from "react";
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  IconButton,
  Typography
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";

const NavbarMobile = ({ handleLogout, isLoggedIn, value, setValue }) => {
  return (
    <Box sx={{ marginTop: "auto" }}>
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        sx={{
          width: "100%",
          position: "fixed",
          bottom: 0,
          backgroundColor: "primary.main",
          zIndex: 1200,
          display: "flex",
          justifyContent: "space-around", // İkonları eşit aralıklarla yerleştirir
          padding: (theme) => theme.spacing(1), // Biraz boşluk ekleyelim
        }}
      >
        {isLoggedIn && (
          <>
            <BottomNavigationAction
              icon={
                <IconButton
                  component={Link}
                  to="/"
                  sx={{
                    borderRadius: "50%",
                    backgroundColor: value === 0 ? "primary.dark" : "transparent",
                    padding: (theme) => theme.spacing(1.5),
                    transition: "all 0.3s ease",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                  }}
                >
                  <HomeIcon sx={{ fontSize: "1.75rem" }} />
                </IconButton>
              }
            />
            <BottomNavigationAction
              icon={
                <IconButton
                  component={Link}
                  to="/profile"
                  sx={{
                    borderRadius: "50%",
                    backgroundColor: value === 1 ? "primary.dark" : "transparent",
                    padding: (theme) => theme.spacing(1.5),
                    transition: "all 0.3s ease",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                  }}
                >
                  <PersonIcon sx={{ fontSize: "1.75rem" }} />
                </IconButton>
              }
            />
            <BottomNavigationAction
              icon={
                <IconButton
                  component={Link}
                  to="/add-workout"
                  sx={{
                    borderRadius: "50%",
                    backgroundColor: value === 2 ? "primary.dark" : "transparent",
                    padding: (theme) => theme.spacing(1.5),
                    transition: "all 0.3s ease",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                  }}
                >
                  <AddIcon sx={{ fontSize: "1.75rem" }} />
                </IconButton>
              }
            />
            <BottomNavigationAction
              icon={
                <IconButton
                  onClick={handleLogout}
                  sx={{
                    borderRadius: "50%",
                    backgroundColor: value === 3 ? "primary.dark" : "transparent",
                    padding: (theme) => theme.spacing(1.5),
                    transition: "all 0.3s ease",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                  }}
                >
                  <ExitToAppIcon sx={{ fontSize: "1.75rem" }} />
                </IconButton>
              }
            />
          </>
        )}

        {!isLoggedIn && (
          <>
            <BottomNavigationAction
  icon={
    <IconButton
      component={Link}
      to="/login"
      sx={{
        borderRadius: "50%",
        backgroundColor: value === 3 ? "primary.dark" : "transparent",
        padding: (theme) => theme.spacing(1.5),
        transition: "all 0.3s ease",
        color: "white",
        "&:hover": {
          backgroundColor: "primary.dark",
        },
      }}
    >
      {/* Giriş Yap yazısı ve ikon */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography
          sx={{
            fontSize: "0.875rem", // Yazı boyutunu küçültüyoruz
            fontWeight: "500", // Yazıyı biraz kalınlaştırıyoruz
            marginBottom: "4px", // İkon ile yazı arasına boşluk ekliyoruz
          }}
        >
          Giriş Yap
        </Typography>
        <ExitToAppIcon sx={{ fontSize: "1.75rem" }} />
      </Box>
    </IconButton>
  }
/>

<BottomNavigationAction
  icon={
    <IconButton
      component={Link}
      to="/register"
      sx={{
        borderRadius: "50%",
        backgroundColor: value === 4 ? "primary.dark" : "transparent",
        padding: (theme) => theme.spacing(1.5),
        transition: "all 0.3s ease",
        color: "white",
        "&:hover": {
          backgroundColor: "primary.dark",
        },
      }}
    >
      {/* Kayıt Ol yazısı ve ikon */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography
          sx={{
            fontSize: "0.875rem", // Yazı boyutunu küçültüyoruz
            fontWeight: "500", // Yazıyı biraz kalınlaştırıyoruz
            marginBottom: "4px", // İkon ile yazı arasına boşluk ekliyoruz
          }}
        >
          Kayıt Ol
        </Typography>
        <ExitToAppIcon sx={{ fontSize: "1.75rem" }} />
      </Box>
    </IconButton>
  }
/>

          </>
        )}
      </BottomNavigation>
    </Box>
  );
};

export default NavbarMobile;
