import { Box, Typography, Paper, Grid, Button, Stack, Divider, CircularProgress, Alert, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack, Block, AttachMoney, People, FlightTakeoff, FlightLand } from "@mui/icons-material";
import { useState, useEffect } from "react";

export default function FlightDetailPage() {
  const { flightId } = useParams();
  const navigate = useNavigate();
  
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchFlightDetails();
  }, [flightId]);

  const fetchFlightDetails = async () => {
    try {
      setLoading(true);
      console.log("Fetching flight details for ID:", flightId);
      
      const response = await fetch('http://localhost:8080/api/admin/flights');
      if (!response.ok) throw new Error('Failed to fetch flights');
      
      const flights = await response.json();
      console.log("All flights:", flights);
      
      const flightDetail = Array.isArray(flights) 
        ? flights.find(f => f.flightId === parseInt(flightId))
        : null;
      
      if (!flightDetail) {
        throw new Error('Flight not found');
      }
      
      console.log("Flight detail:", flightDetail);
      setFlight(flightDetail);
      setError(null);
    } catch (err) {
      console.error("Error fetching flight details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelFlight = async () => {
    try {
      setCancelling(true);
      const response = await fetch(`http://localhost:8080/api/admin/flights/${flightId}/cancel`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      
      const result = await response.text();
      alert(`Success: ${result}`);
      setCancelDialogOpen(false);
      fetchFlightDetails(); // Refresh to show cancelled status
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Box className="page-root" display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !flight) {
    return (
      <Box className="page-root">
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
        <Alert severity="error">Failed to load flight details: {error}</Alert>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED': return 'primary';
      case 'CANCELLED': return 'error';
      case 'COMPLETED': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box className="page-root">
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, alignSelf: 'flex-start' }}>Back</Button>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h4">Flight #{flightId}</Typography>
        <Chip label={flight.status || 'SCHEDULED'} color={getStatusColor(flight.status)} />
      </Stack>

      <Grid container spacing={3}>
        {/* Sol: Uçuş Bilgileri */}
        <Grid item xs={12} md={6}>
          <Paper className="card" elevation={0}>
            <Typography variant="h6" gutterBottom>Rota Bilgileri</Typography>
            
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <FlightTakeoff color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary">Departure</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {flight.originAirport || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {flight.departureTime || 'N/A'}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              <FlightLand color="success" />
              <Box>
                <Typography variant="caption" color="text.secondary">Arrival</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {flight.destinationAirport || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {flight.arrivalTime || 'N/A'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Sağ: Yönetim */}
        <Grid item xs={12} md={6}>
          <Paper className="card" elevation={0} sx={{ height: '100%' }}>
            <Typography variant="h6" gutterBottom>Flight Management</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Assigned Plane</Typography>
              <Typography variant="body1" fontWeight="500">
                {flight.planeInfo || 'N/A'}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Button 
                variant="contained" 
                color="error" 
                startIcon={<Block />} 
                onClick={() => setCancelDialogOpen(true)}
                disabled={flight.status === 'CANCELLED'}
                fullWidth
              >
                {flight.status === 'CANCELLED' ? 'Flight Cancelled' : 'Cancel Flight'}
              </Button>
              {flight.status === 'CANCELLED' && (
                <Alert severity="warning">
                  This flight has been cancelled. All tickets have been refunded and seats have been released.
                </Alert>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => !cancelling && setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Flight</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this flight?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Warning:</strong> This action cannot be undone. All tickets will be cancelled, 
            passengers will be refunded and seats will become available again.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={cancelling}>
            Cancel
          </Button>
          <Button 
            onClick={handleCancelFlight} 
            color="error" 
            variant="contained"
            disabled={cancelling}
          >
            {cancelling ? <CircularProgress size={24} /> : 'Yes, Cancel Flight'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}