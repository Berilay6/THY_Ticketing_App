import { Box, Typography, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/home.css";

export default function HomePage() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const firstName = localStorage.getItem("userFirstName");
    if (firstName) {
      setGreeting(`Welcome back, ${firstName}`);
    }
  }, []);

  return (
    <Box className="page-root">
      <div className="home-header">
        <Typography variant="h4" gutterBottom>
          {greeting}
        </Typography>
        <Typography className="home-subtitle" variant="body1">
          Manage your THY flights, bookings and payments from a single, clean
          dashboard.
        </Typography>
      </div>

      <div className="home-grid">
        <Paper elevation={0} className="card">
          <div className="card-header">Ready to travel?</div>
          <p className="card-text-muted">
            Search flights and choose your seat within a few steps.
          </p>
          <Button variant="contained" onClick={() => navigate("/book-flight")}>
            Book a flight
          </Button>
        </Paper>

        <Paper elevation={0} className="card">
          <div className="card-header">Already have a ticket?</div>
          <p className="card-text-muted">
            Check-in online and see your upcoming flights.
          </p>
          <Button variant="outlined" onClick={() => navigate("/check-in")}>
            Check-in
          </Button>
        </Paper>
      </div>
    </Box>
  );
}
