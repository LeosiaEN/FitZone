import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6366F1", // mor ton
    },
    secondary: {
      main: "#EC4899", // pembe ton
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          backgroundColor: "#f3f4f6", // arkaplan
        },
        a: {
          textDecoration: "none",
          color: "inherit",
        },
      },
    },
  },
});

export default theme;
