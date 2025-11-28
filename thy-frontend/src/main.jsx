// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import App from "./App.jsx";
import { BookingProvider } from "./context/BookingContext.jsx";

import "./styles/main.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#C8102E" },
    secondary: { main: "#1D2130" },
    background: {
      default: "#F5F5F7",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily:
      '"Roboto","system-ui",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <BookingProvider>
          <App />
        </BookingProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
