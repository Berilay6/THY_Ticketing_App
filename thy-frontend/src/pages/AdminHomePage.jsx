import { Box, Typography, Paper, Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import "../styles/home.css";

export default function AdminHomePage() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Welcome, Admin");

  useEffect(() => {
    const userName = localStorage.getItem("userName");
    if (userName) {
      const firstName = userName.split(" ")[0];
      const formattedName =
        firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      setGreeting(`Welcome, ${formattedName}`);
    }
  }, []);

  return (
    <Box className="page-root">
      <div className="home-header">
        <Typography variant="h4" gutterBottom>
          {greeting}
        </Typography>
        <Typography className="home-subtitle" variant="body1">
          System overview and quick links.
        </Typography>
      </div>
      <div className="home-grid">
        <Paper elevation={0} className="card">
          <div className="card-header">Manage Planes</div>
          <p className="card-text-muted">
            View fleet inventory or add new planes.
          </p>
          <Button variant="contained" onClick={() => navigate("/admin/planes")}>
            Go to Planes
          </Button>
        </Paper>

        <Paper elevation={0} className="card">
          <div className="card-header">Manage Airports</div>
          <p className="card-text-muted">Configure airport connections.</p>
          <Button
            variant="outlined"
            onClick={() => navigate("/admin/airports")}
          >
            Go to Airports
          </Button>
        </Paper>

        <Paper elevation={0} className="card">
          <div className="card-header">Manage Flights</div>
          <p className="card-text-muted">Schedule new flights.</p>
          <Button variant="outlined" onClick={() => navigate("/admin/flights")}>
            Go to Flights
          </Button>
        </Paper>
      </div>
    </Box>
  );
}
