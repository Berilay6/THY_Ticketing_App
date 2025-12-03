import { Box, Typography, Paper, Grid, Button, Chip, Divider, Stack, CircularProgress, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Flight, Build, Warehouse, ArrowBack } from "@mui/icons-material";

export default function PlaneInfoPage() {
  const { planeId } = useParams();
  const navigate = useNavigate();
  const [plane, setPlane] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch plane details and seats
  useEffect(() => {
    const fetchPlaneData = async () => {
      try {
        setLoading(true);
        
        // Fetch plane details
        const planeResponse = await fetch(`http://localhost:8080/api/admin/planes/${planeId}`);
        if (!planeResponse.ok) {
          throw new Error(`Failed to fetch plane: ${planeResponse.status}`);
        }
        const planeData = await planeResponse.json();
        setPlane(planeData);
        
        // Fetch seats
        const seatsResponse = await fetch(`http://localhost:8080/api/admin/planes/${planeId}/seats`);
        if (!seatsResponse.ok) {
          throw new Error(`Failed to fetch seats: ${seatsResponse.status}`);
        }
        const seatsData = await seatsResponse.json();
        console.log("Fetched seats data:", seatsData);
        console.log("Number of seats:", seatsData.length);
        setSeats(seatsData);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching plane data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaneData();
  }, [planeId]);

  const toggleSeat = async (seatNumber) => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/planes/${planeId}/seats/${seatNumber}/status`, {
        method: 'PUT'
      });
      if (!response.ok) {
        throw new Error('Failed to update seat status');
      }
      const updatedSeat = await response.json();
      // Update local state
      setSeats(seats.map(s => s.seatNumber === seatNumber ? updatedSeat : s));
    } catch (err) {
      console.error("Error updating seat:", err);
      alert("Failed to update seat status");
    }
  };

  const handleToggleMaintenance = async () => {
    const isCurrentlyActive = plane.status === 'active';
    const action = isCurrentlyActive ? "send to maintenance" : "reactivate";
    
    let message;
    if (isCurrentlyActive) {
      message = `Are you sure you want to ${action} this plane?\n\n` +
                `This will:\n` +
                `• Cancel ALL associated flights\n` +
                `• Refund ALL tickets automatically\n` +
                `• Move plane to Storage\n` +
                `• Set status to MAINTENANCE`;
    } else {
      message = `Are you sure you want to reactivate this plane?\n\n` +
                `This will:\n` +
                `• Set status to ACTIVE\n` +
                `• Plane will remain in Storage\n` +
                `• Ready for flight assignments`;
    }
    
    if (!window.confirm(message)) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/api/admin/planes/${planeId}/status`, {
        method: 'PUT'
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to toggle plane status');
      }
      const result = await response.text();
      alert(result);
      window.location.reload();
    } catch (err) {
      console.error("Error toggling plane status:", err);
      alert("Failed to toggle plane status: " + err.message);
    }
  };

  const handleRetirePlane = async () => {
    const message = `Are you sure you want to RETIRE this plane?\n\n` +
                   `This will:\n` +
                   `• Cancel ALL associated flights\n` +
                   `• Refund ALL tickets automatically\n` +
                   `• Move plane to Storage\n` +
                   `• Set status to RETIRED\n` +
                   `• This action CANNOT be undone!\n\n` +
                   `Retired planes cannot be reactivated.`;
    
    if (!window.confirm(message)) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/api/admin/planes/${planeId}/malfunction?retired=true`, {
        method: 'POST'
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to retire plane');
      }
      const result = await response.text();
      alert(result);
      window.location.reload();
    } catch (err) {
      console.error("Error retiring plane:", err);
      alert("Failed to retire plane: " + err.message);
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
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>Back</Button>
      </Box>
    );
  }

  if (!plane) {
    return (
      <Box className="page-root">
        <Alert severity="info">Plane not found</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>Back</Button>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'retired': return 'error';
      default: return 'default';
    }
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
              <Typography variant="h6">{plane.modelType}</Typography>
              <Chip label={plane.status.toUpperCase()} color={getStatusColor(plane.status)} />
              <Typography variant="body2" color="text.secondary">
                Location: {plane.airport ? `${plane.airport.name} (${plane.airport.iataCode})` : 'Storage'}
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                Plane Actions
              </Typography>
              
              {plane.status === 'active' && (
                <>
                  <Button 
                    variant="contained" 
                    color="warning" 
                    startIcon={<Build />} 
                    onClick={handleToggleMaintenance}
                    fullWidth
                  >
                    Send to Maintenance
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error" 
                    startIcon={<Warehouse />} 
                    onClick={handleRetirePlane}
                    fullWidth
                  >
                    Retire Plane
                  </Button>
                </>
              )}
              
              {plane.status === 'maintenance' && (
                <>
                  <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={<Flight />} 
                    onClick={handleToggleMaintenance}
                    fullWidth
                  >
                    Reactivate Plane
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error" 
                    startIcon={<Warehouse />} 
                    onClick={handleRetirePlane}
                    fullWidth
                  >
                    Retire Plane
                  </Button>
                  <Alert severity="info" sx={{ mt: 1 }}>
                    This plane is in maintenance. You can reactivate it or retire it permanently.
                  </Alert>
                </>
              )}
              
              {plane.status === 'retired' && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  This plane is retired and cannot be reactivated.
                </Alert>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* SAĞ: Koltuk Yönetimi */}
        <Grid item xs={12} md={8}>
          <Paper className="card" elevation={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6">Seat Map ({seats.length} seats)</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Typography variant="caption" sx={{ fontWeight: 'bold', mr: 1 }}>Status:</Typography>
                <Chip label="Active (Green Border)" size="small" sx={{ bgcolor: '#fff', border: '2px solid #4caf50' }} />
                <Chip label="Unavailable (Red Border)" size="small" sx={{ bgcolor: '#fff', border: '2px solid #f44336' }} />
                <Typography variant="caption" sx={{ fontWeight: 'bold', ml: 2, mr: 1 }}>Type:</Typography>
                <Chip label="Business (Blue)" size="small" sx={{ bgcolor: '#2196f3', color: 'white' }} />
                <Chip label="Economy (Orange)" size="small" sx={{ bgcolor: '#ff9800', color: 'white' }} />
                <Chip label="Premium Economy (Purple)" size="small" sx={{ bgcolor: '#9c27b0', color: 'white' }} />
                <Chip label="First Class (Gold)" size="small" sx={{ bgcolor: '#ffd700', color: 'black' }} />
              </Stack>
            </Box>
            {seats.length === 0 ? (
              <Alert severity="info">No seats found for this plane</Alert>
            ) : (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                gap: 2, 
                width: '100%',
                maxWidth: '1000px',
                padding: 2
              }}>
                {seats.map(seat => {
                  // Determine background color based on seat type
                  const getTypeColor = (type) => {
                    switch(type) {
                      case 'business': return '#2196f3';
                      case 'economy': return '#ff9800';
                      case 'premium_economy': return '#9c27b0';
                      case 'first': return '#ffd700';
                      default: return '#757575';
                    }
                  };
                  
                  // Determine border color based on status
                  const getBorderColor = (status) => {
                    return status === 'active' ? '#4caf50' : '#f44336';
                  };
                  
                  // Format type name
                  const formatType = (type) => {
                    switch(type) {
                      case 'business': return 'Business';
                      case 'economy': return 'Economy';
                      case 'premium_economy': return 'Premium Eco';
                      case 'first': return 'First Class';
                      default: return type;
                    }
                  };
                  
                  return (
                    <Box 
                      key={seat.seatNumber} 
                      onClick={() => toggleSeat(seat.seatNumber)}
                      sx={{
                        height: 85, 
                        minWidth: 100,
                        bgcolor: getTypeColor(seat.type),
                        border: '3px solid', 
                        borderColor: getBorderColor(seat.status),
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer', 
                        borderRadius: 1.5,
                        transition: 'all 0.2s',
                        opacity: seat.status === 'active' ? 1 : 0.6,
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: 3
                        }
                      }}
                    >
                      <Typography variant="body1" fontWeight="bold" sx={{ color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                        {seat.seatNumber}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'white', fontWeight: 'bold', mt: 0.5 }}>
                        {formatType(seat.type)}
                      </Typography>
                      <Chip 
                        label={seat.status === 'active' ? 'ACTIVE' : 'UNAVAILABLE'} 
                        size="small" 
                        sx={{ 
                          mt: 0.5, 
                          height: 18, 
                          fontSize: '0.65rem',
                          bgcolor: seat.status === 'active' ? '#4caf50' : '#f44336',
                          color: 'white',
                          fontWeight: 'bold'
                        }} 
                      />
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}