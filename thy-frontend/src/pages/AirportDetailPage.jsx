import { Box, Typography, Paper, Button, List, ListItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack, Flight, LocationOn } from "@mui/icons-material";

const MOCK_PLANES_AT_AIRPORT = [
  { id: 101, model: "Boeing 737", status: "Ready" },
  { id: 105, model: "Airbus A320", status: "Maintenance" }
];

export default function AirportDetailPage() {
  const { airportId } = useParams();
  const navigate = useNavigate();

  return (
    <Box className="page-root">
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, alignSelf: 'flex-start' }}>Back</Button>
      <Typography variant="h4" gutterBottom>Airport Details</Typography>

      <Paper className="card" elevation={0} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LocationOn fontSize="large" color="secondary" />
          <Box>
            <Typography variant="h5">Istanbul Airport (IST)</Typography>
            <Typography variant="body2" color="text.secondary">Istanbul, Turkey • UTC+03:00</Typography>
          </Box>
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>Planes at this Airport</Typography>
      <Paper className="card" elevation={0}>
        <List>
          {MOCK_PLANES_AT_AIRPORT.map((plane, idx) => (
            <div key={plane.id}>
              <ListItem secondaryAction={<Button size="small" onClick={() => navigate(`/admin/planes/${plane.id}`)}>View Plane</Button>}>
                <ListItemIcon><Flight /></ListItemIcon>
                <ListItemText primary={plane.model} secondary={`Status: ${plane.status} • ID: #${plane.id}`} />
              </ListItem>
              {idx < MOCK_PLANES_AT_AIRPORT.length - 1 && <Divider />}
            </div>
          ))}
        </List>
      </Paper>
    </Box>
  );
}