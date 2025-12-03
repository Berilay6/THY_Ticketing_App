import { Box, Typography, Paper, Grid, Button, Stack, Divider } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack, SwapHoriz, Block, AttachMoney, People } from "@mui/icons-material";

export default function FlightDetailPage() {
  const { flightId } = useParams();
  const navigate = useNavigate();

  // Mock Data
  const flight = { route: "IST - LHR", date: "2025-12-10 14:30", revenue: 154000, occupancy: 85, plane: "Boeing 737 (TC-JHK)" };

  return (
    <Box className="page-root">
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, alignSelf: 'flex-start' }}>Back</Button>
      <Typography variant="h4" gutterBottom>Flight #{flightId} Operations</Typography>

      <Grid container spacing={3}>
        {/* Sol: İstatistikler */}
        <Grid item xs={12} md={6}>
          <Paper className="card" elevation={0}>
            <Typography variant="h6" gutterBottom>{flight.route}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{flight.date}</Typography>

            <Stack direction="row" spacing={2}>
              <Paper variant="outlined" sx={{ p: 2, flex: 1, textAlign: 'center', bgcolor: '#f1f8e9' }}>
                <AttachMoney color="success" />
                <Typography variant="h5" fontWeight="bold" color="success.main">{flight.revenue.toLocaleString()} TL</Typography>
                <Typography variant="caption">Total Revenue</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, flex: 1, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                <People color="primary" />
                <Typography variant="h5" fontWeight="bold" color="primary.main">%{flight.occupancy}</Typography>
                <Typography variant="caption">Occupancy</Typography>
              </Paper>
            </Stack>
          </Paper>
        </Grid>

        {/* Sağ: Yönetim */}
        <Grid item xs={12} md={6}>
          <Paper className="card" elevation={0} sx={{ height: '100%' }}>
            <Typography variant="h6" gutterBottom>Management</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Assigned Plane</Typography>
              <Typography variant="body1" fontWeight="500">{flight.plane}</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Button variant="outlined" startIcon={<SwapHoriz />} onClick={() => alert("Change Plane Dialog")}>Change Plane</Button>
              <Button variant="contained" color="error" startIcon={<Block />} onClick={() => alert("Flight Cancelled")}>Cancel Flight</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}