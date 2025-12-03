import { Box, Typography, Paper, Button, List, ListItem, ListItemIcon, ListItemText, Divider, CircularProgress, Alert, Chip } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack, Flight, LocationOn } from "@mui/icons-material";
import { useState, useEffect } from "react";

export default function AirportDetailPage() {
  const { airportId } = useParams();
  const navigate = useNavigate();
  const [airport, setAirport] = useState(null);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAirportData = async () => {
      try {
        setLoading(true);
        
        // Fetch airport details
        const airportResponse = await fetch(`http://localhost:8080/api/admin/airports/${airportId}`);
        if (!airportResponse.ok) {
          throw new Error(`Failed to fetch airport: ${airportResponse.status}`);
        }
        const airportData = await airportResponse.json();
        setAirport(airportData);
        
        // Fetch planes at this airport
        const planesResponse = await fetch(`http://localhost:8080/api/admin/airports/${airportId}/planes`);
        if (!planesResponse.ok) {
          throw new Error(`Failed to fetch planes: ${planesResponse.status}`);
        }
        const planesData = await planesResponse.json();
        setPlanes(Array.isArray(planesData) ? planesData : []);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching airport data:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAirportData();
  }, [airportId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "success";
      case "maintenance": return "warning";
      case "retired": return "default";
      default: return "primary";
    }
  };

  if (loading) {
    return (
      <Box className="page-root" sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="page-root">
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!airport) {
    return (
      <Box className="page-root">
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
        <Alert severity="info">Airport not found.</Alert>
      </Box>
    );
  }

  return (
    <Box className="page-root">
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, alignSelf: 'flex-start' }}>Back</Button>
      <Typography variant="h4" gutterBottom>Airport Details</Typography>

      <Paper className="card" elevation={0} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LocationOn fontSize="large" color="secondary" />
          <Box>
            <Typography variant="h5">{airport.name} ({airport.iataCode})</Typography>
            <Typography variant="body2" color="text.secondary">
              {airport.city}, {airport.country} • {airport.timezone}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>Planes at this Airport ({planes.length})</Typography>
      {planes.length === 0 ? (
        <Alert severity="info">No planes currently at this airport.</Alert>
      ) : (
        <Paper className="card" elevation={0}>
          <List>
            {planes.map((plane, idx) => (
              <div key={plane.planeId}>
                <ListItem secondaryAction={<Button size="small" onClick={() => navigate(`/admin/planes/${plane.planeId}`)}>View Plane</Button>}>
                  <ListItemIcon><Flight /></ListItemIcon>
                  <ListItemText 
                    primary={plane.modelType} 
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <span>ID: #{plane.planeId}</span>
                        <Chip label={plane.status.toUpperCase()} color={getStatusColor(plane.status)} size="small" variant="outlined" />
                      </Box>
                    } 
                  />
                </ListItem>
                {idx < planes.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}