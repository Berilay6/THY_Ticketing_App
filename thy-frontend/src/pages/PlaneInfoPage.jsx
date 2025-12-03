import { Box, Typography, Paper, Grid, Button, Chip, Divider, Stack, Tooltip } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Flight, Build, Warehouse, EventSeat, ArrowBack, Circle } from "@mui/icons-material";

const MOCK_SEATS = Array.from({ length: 30 }, (_, i) => ({
  id: `${Math.floor(i / 6) + 1}${String.fromCharCode(65 + (i % 6))}`,
  status: i === 2 ? "unavailable" : "active"
}));

export default function PlaneInfoPage() {
  const { planeId } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState(MOCK_SEATS);
  const [status, setStatus] = useState("active");

  const toggleSeat = (id) => {
    setSeats(seats.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'unavailable' : 'active' } : s));
  };

  return (
    <Box className="page-root">
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, alignSelf: 'flex-start' }}>Back</Button>
      <Typography variant="h4" gutterBottom>Plane Info #{planeId}</Typography>

      <Grid container spacing={3}>
        {/* SOL: Bilgiler ve Butonlar */}
        <Grid item xs={12} md={4}>
          <Paper className="card" elevation={0}>
            <Stack spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Flight sx={{ fontSize: 60, color: 'var(--primary)' }} />
              <Typography variant="h6">Boeing 737-800</Typography>
              <Chip label={status.toUpperCase()} color={status === 'active' ? 'success' : 'warning'} />
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Button variant="contained" color="warning" startIcon={<Build />} onClick={() => setStatus(status === 'active' ? 'maintenance' : 'active')}>
                {status === 'active' ? 'Report Malfunction' : 'Mark Fixed'}
              </Button>
              <Button variant="outlined" color="secondary" startIcon={<Warehouse />} onClick={() => alert("Moved to Storage")}>
                Move to Storage
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* SAĞ: Koltuk Yönetimi */}
        <Grid item xs={12} md={8}>
          <Paper className="card" elevation={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Seat Map</Typography>
              <Stack direction="row" spacing={1}><Chip label="Active" size="small" color="success" /><Chip label="Unavailable" size="small" color="error" /></Stack>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1 }}>
              {seats.map(seat => (
                <Box key={seat.id} onClick={() => toggleSeat(seat.id)}
                  sx={{
                    height: 40, bgcolor: seat.status === 'active' ? '#e8f5e9' : '#ffebee',
                    border: '1px solid', borderColor: seat.status === 'active' ? 'green' : 'red',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: 1
                  }}>
                  <Typography variant="caption">{seat.id}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}