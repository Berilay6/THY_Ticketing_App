import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import { Info, Event, Search, Add, FlightTakeoff } from "@mui/icons-material";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminFlightsPage() {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Create Flight Dialog States
  const [openDialog, setOpenDialog] = useState(false);
  const [airports, setAirports] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [formData, setFormData] = useState({
    originAirportId: '',
    destinationAirportId: '',
    planeId: '',
    departureTime: '',
    arrivalTime: '',
    basePricePerHour: ''
  });
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState(null);
  const [availablePlanesCount, setAvailablePlanesCount] = useState(0);
  const [selectedPlaneDetails, setSelectedPlaneDetails] = useState(null);
  const [planeSeatCount, setPlaneSeatCount] = useState(null);

  // Fetch flights from backend
  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      console.log("Attempting to fetch flights from http://localhost:8080/api/admin/flights");
      const response = await fetch("http://localhost:8080/api/admin/flights");
      console.log("Fetch response status:", response.status);
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
      
      const data = await response.json();
      console.log("Flights data:", data);
      setFlights(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching flights:", err.message);
      setError(err.message);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch airports and planes when dialog opens
  useEffect(() => {
    if (openDialog) {
      fetchAirportsAndPlanes();
    }
  }, [openDialog]);

  const fetchAirportsAndPlanes = async () => {
    try {
      console.log("Fetching airports and planes...");
      const [airportsRes, planesRes] = await Promise.all([
        fetch("http://localhost:8080/api/admin/airports"),
        fetch("http://localhost:8080/api/admin/planes")
      ]);
      
      if (airportsRes.ok) {
        const airportsData = await airportsRes.json();
        console.log("Airports data:", airportsData);
        setAirports(Array.isArray(airportsData) ? airportsData : []);
      }
      
      if (planesRes.ok) {
        const planesData = await planesRes.json();
        console.log("All planes data:", planesData);
        // Only show active planes that are deployed to airports (status is lowercase: 'active')
        const activePlanes = planesData.filter(p => {
          const isActive = p.status === 'active';
          const hasAirport = p.currentAirportId !== null && p.currentAirportId !== undefined;
          console.log(`Plane ${p.planeId}: status=${p.status}, isActive=${isActive}, currentAirportId=${p.currentAirportId}, hasAirport=${hasAirport}`);
          return isActive && hasAirport;
        });
        console.log("Filtered active planes:", activePlanes);
        setPlanes(Array.isArray(activePlanes) ? activePlanes : []);
        setAvailablePlanesCount(activePlanes.length);
      }
    } catch (err) {
      console.error("Error fetching airports/planes:", err);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setFormData({
      originAirportId: '',
      destinationAirportId: '',
      planeId: '',
      departureTime: '',
      arrivalTime: '',
      basePricePerHour: ''
    });
    setSubmitError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      originAirportId: '',
      destinationAirportId: '',
      planeId: '',
      departureTime: '',
      arrivalTime: '',
      basePricePerHour: ''
    });
    setSelectedPlaneDetails(null);
    setPlaneSeatCount(null);
    setEstimatedDuration(null);
    setSubmitError(null);
  };

  const clearDraft = () => {
    localStorage.removeItem('flightDraft');
    setFormData({
      originAirportId: '',
      destinationAirportId: '',
      planeId: '',
      departureTime: '',
      arrivalTime: '',
      basePricePerHour: ''
    });
    setSelectedPlaneDetails(null);
    setPlaneSeatCount(null);
    setEstimatedDuration(null);
    setSubmitError(null);
  };

  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    
    // Reset plane selection if origin airport changes
    if (field === 'originAirportId' && value !== formData.originAirportId) {
      newData.planeId = '';
      setSelectedPlaneDetails(null);
      setPlaneSeatCount(null);
    }
    
    // Fetch seat count when plane is selected
    if (field === 'planeId' && value) {
      const selectedPlane = planes.find(p => p.planeId === value);
      setSelectedPlaneDetails(selectedPlane);
      fetchPlaneSeatCount(value);
    }
    
    // Calculate duration when times change
    if (field === 'departureTime' || field === 'arrivalTime') {
      calculateDuration(newData.departureTime, newData.arrivalTime);
    }
    
    // Save draft to localStorage
    localStorage.setItem('flightDraft', JSON.stringify(newData));
    
    setFormData(newData);
    setSubmitError(null);
  };

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem('flightDraft');
    if (draft && openDialog) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(parsed);
        calculateDuration(parsed.departureTime, parsed.arrivalTime);
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, [openDialog]);

  // Fetch plane seat count when plane is selected
  const fetchPlaneSeatCount = async (planeId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/planes/${planeId}/seats`);
      if (response.ok) {
        const seats = await response.json();
        setPlaneSeatCount(seats.length);
        return seats.length;
      }
    } catch (err) {
      console.error('Error fetching seat count:', err);
    }
    return null;
  };

  // Calculate potential revenue
  const calculateRevenue = useMemo(() => {
    if (!formData.basePricePerHour || !estimatedDuration || !planeSeatCount) return null;
    
    const basePrice = parseFloat(formData.basePricePerHour);
    const hours = parseFloat(estimatedDuration.split('h')[0]);
    const baseTotal = basePrice * hours;
    
    // Assume average distribution: 60% economy, 20% premium, 15% business, 5% first
    const economySeats = Math.floor(planeSeatCount * 0.6);
    const premiumSeats = Math.floor(planeSeatCount * 0.2);
    const businessSeats = Math.floor(planeSeatCount * 0.15);
    const firstSeats = Math.floor(planeSeatCount * 0.05);
    
    const revenue = (
      economySeats * baseTotal * 1.0 +
      premiumSeats * baseTotal * 1.5 +
      businessSeats * baseTotal * 2.0 +
      firstSeats * baseTotal * 3.0
    );
    
    return {
      total: revenue.toFixed(2),
      perSeat: (revenue / planeSeatCount).toFixed(2),
      seatCount: planeSeatCount
    };
  }, [formData.basePricePerHour, estimatedDuration, planeSeatCount]);

  // Quick time helpers
  const setQuickDeparture = (hoursFromNow) => {
    const now = new Date();
    now.setHours(now.getHours() + hoursFromNow);
    now.setMinutes(0);
    now.setSeconds(0);
    const formatted = now.toISOString().slice(0, 16);
    handleInputChange('departureTime', formatted);
  };

  const calculateDuration = (departure, arrival) => {
    if (departure && arrival) {
      const dep = new Date(departure);
      const arr = new Date(arrival);
      const diffMs = arr - dep;
      if (diffMs > 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setEstimatedDuration(`${hours}h ${minutes}m`);
      } else {
        setEstimatedDuration(null);
      }
    } else {
      setEstimatedDuration(null);
    }
  };

  const validateForm = () => {
    if (!formData.originAirportId) return "Please select departure airport";
    if (!formData.destinationAirportId) return "Please select arrival airport";
    if (formData.originAirportId === formData.destinationAirportId) return "Departure and arrival airports must be different";
    if (!formData.planeId) return "Please select a plane";
    if (!formData.departureTime) return "Please enter departure time";
    if (!formData.arrivalTime) return "Please enter arrival time";
    if (!formData.basePricePerHour || parseFloat(formData.basePricePerHour) <= 0) return "Price per hour must be greater than 0";
    
    const departure = new Date(formData.departureTime);
    const arrival = new Date(formData.arrivalTime);
    if (arrival <= departure) return "Arrival time must be after departure time";
    
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Ensure datetime format includes seconds
      const departureTime = formData.departureTime.includes('T') 
        ? formData.departureTime + (formData.departureTime.split(':').length === 2 ? ':00' : '')
        : formData.departureTime;
      const arrivalTime = formData.arrivalTime.includes('T')
        ? formData.arrivalTime + (formData.arrivalTime.split(':').length === 2 ? ':00' : '')
        : formData.arrivalTime;
      
      const requestBody = {
        originAirportId: parseInt(formData.originAirportId),
        destinationAirportId: parseInt(formData.destinationAirportId),
        planeId: parseInt(formData.planeId),
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        basePricePerHour: parseFloat(formData.basePricePerHour)
      };
      
      console.log("Creating flight with data:", requestBody);
      
      const response = await fetch("http://localhost:8080/api/admin/flights", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'No error message from server';
        }
        console.error("Error response:", errorText);
        console.error("Response status:", response.status);
        console.error("Response statusText:", response.statusText);
        
        const errorMsg = errorText || response.statusText || 'Failed to create flight';
        alert(`Backend Error (${response.status}): ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      const successText = await response.text();
      console.log("Success response:", successText);
      alert(`✅ Success: ${successText}`);

      // Success - clear draft from localStorage
      localStorage.removeItem('flightDraft');
      handleCloseDialog();
      fetchFlights(); // Refresh the flight list
    } catch (err) {
      console.error("Error creating flight:", err);
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return 'success';
      case 'SCHEDULED': return 'primary';
      case 'CANCELLED': return 'error';
      case 'COMPLETED': return 'default';
      default: return 'default';
    }
  };

  const filteredFlights = useMemo(() => {
    return flights.filter(f =>
      f.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.planeInfo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [flights, searchTerm]);

  return (
    <Box className="page-root">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Flight Operations</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage flight schedules and view occupancy.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
          sx={{ bgcolor: '#c8102e', '&:hover': { bgcolor: '#a00d25' } }}
        >
          Create Flight
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : flights.length === 0 ? (
        <Alert severity="info">No flights available.</Alert>
      ) : (
        <Paper elevation={0} className="card" sx={{ p: 0, overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid var(--border-subtle)' }}>
            <TextField
              placeholder="Search route or plane..."
              size="small"
              fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ mr: 1, color: 'text.secondary' }} /></InputAdornment> }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f9fafb' }}>
                <TableRow>
                  <TableCell><strong>Flight ID</strong></TableCell>
                  <TableCell><strong>Route</strong></TableCell>
                  <TableCell><strong>Departure Time</strong></TableCell>
                  <TableCell><strong>Arrival Time</strong></TableCell>
                  <TableCell><strong>Assigned Plane</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFlights.map((flight) => (
                  <TableRow key={flight.flightId} hover>
                    <TableCell>#{flight.flightId}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{flight.route}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Event fontSize="small" color="action" />
                        {flight.departureTime}
                      </Stack>
                    </TableCell>
                    <TableCell>{flight.arrivalTime}</TableCell>
                    <TableCell>{flight.planeInfo}</TableCell>
                    <TableCell>
                      <Chip label={flight.status} color={getStatusColor(flight.status)} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="info"
                        onClick={() => navigate(`/admin/flights/${flight.flightId}`)}
                        title="View Details"
                      >
                        <Info />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Create Flight Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <FlightTakeoff sx={{ color: '#c8102e' }} />
            <span>Create New Flight</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {planes.length === 1 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Not:</strong> Şu anda sadece İstanbul Havalimanı'nda 1 aktif uçak bulunmaktadır. 
              Daha fazla uçak için Storage'dan havalimanlarına uçak deploy edin.
            </Alert>
          )}
          {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
          {estimatedDuration && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Estimated Flight Duration:</strong> {estimatedDuration}
            </Alert>
          )}
          
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Flight Route
              </Typography>
              <Stack spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel>Origin Airport</InputLabel>
                  <Select
                    value={formData.originAirportId}
                    onChange={(e) => handleInputChange('originAirportId', e.target.value)}
                    label="Origin Airport"
                  >
                    {airports.map(airport => (
                      <MenuItem key={airport.airportId} value={airport.airportId}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={airport.iataCode} size="small" color="primary" />
                          <span>{airport.name} - {airport.city}, {airport.country}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Destination Airport</InputLabel>
                  <Select
                    value={formData.destinationAirportId}
                    onChange={(e) => handleInputChange('destinationAirportId', e.target.value)}
                    label="Destination Airport"
                  >
                    {airports
                      .filter(airport => airport.airportId !== parseInt(formData.originAirportId))
                      .map(airport => (
                        <MenuItem key={airport.airportId} value={airport.airportId}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label={airport.iataCode} size="small" color="secondary" />
                            <span>{airport.name} - {airport.city}, {airport.country}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                  </Select>
                  {formData.originAirportId && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      Showing airports except origin
                    </Typography>
                  )}
                </FormControl>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Aircraft Selection
              </Typography>
              <FormControl fullWidth required>
                <InputLabel>Plane</InputLabel>
                <Select
                  value={formData.planeId}
                  onChange={async (e) => {
                    console.log("Plane selected:", e.target.value);
                    handleInputChange('planeId', e.target.value);
                    const selectedPlane = planes.find(p => p.planeId === e.target.value);
                    console.log("Selected plane details:", selectedPlane);
                    if (selectedPlane) {
                      setSelectedPlaneDetails(selectedPlane);
                      await fetchPlaneSeatCount(e.target.value);
                    }
                  }}
                  label="Plane"
                  disabled={!formData.originAirportId}
                >
                  {!formData.originAirportId ? (
                    <MenuItem disabled>Select departure airport first</MenuItem>
                  ) : planes.length === 0 ? (
                    <MenuItem disabled>No active planes</MenuItem>
                  ) : (
                    (() => {
                      const filteredPlanes = planes.filter(plane => {
                        const match = plane.currentAirportId === parseInt(formData.originAirportId);
                        console.log(`Plane ${plane.planeId} at airport ${plane.currentAirportId}, origin: ${formData.originAirportId}, match: ${match}`);
                        return match;
                      });
                      
                      console.log("Filtered planes for origin:", filteredPlanes);
                      
                      if (filteredPlanes.length === 0) {
                        return <MenuItem disabled>No planes at selected airport</MenuItem>;
                      }
                      
                      return filteredPlanes.map(plane => (
                        <MenuItem key={plane.planeId} value={plane.planeId}>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                            <FlightTakeoff sx={{ color: '#c8102e' }} />
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {plane.modelType}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {plane.planeId} • Located at: {plane.currentAirportIata || plane.airportName}
                              </Typography>
                            </Box>
                          </Stack>
                        </MenuItem>
                      ));
                    })()
                  )}
                </Select>
                {formData.originAirportId && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {(() => {
                      const count = planes.filter(p => 
                        p.currentAirportId === parseInt(formData.originAirportId)
                      ).length;
                      return count > 0 
                        ? `${count} active plane${count !== 1 ? 's' : ''} available at origin airport`
                        : 'No planes available at this airport - try deploying a plane first';
                    })()}
                  </Typography>
                )}
              </FormControl>
              
              {/* Plane Details Card */}
              {selectedPlaneDetails && planeSeatCount && (
                <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#f5f5f5' }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight="bold">
                        {selectedPlaneDetails.modelType}
                      </Typography>
                      <Chip 
                        label={`${planeSeatCount} seats`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Aircraft ID: {selectedPlaneDetails.planeId} • Status: {selectedPlaneDetails.status}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Currently at: {selectedPlaneDetails.airportName}
                    </Typography>
                  </Stack>
                </Paper>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Flight Schedule
              </Typography>
              <Stack spacing={2}>
                {/* Quick Time Buttons */}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Quick departure time:
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => setQuickDeparture(2)}
                    >
                      In 2h
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => setQuickDeparture(6)}
                    >
                      In 6h
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => setQuickDeparture(24)}
                    >
                      Tomorrow
                    </Button>
                  </Stack>
                </Box>
                
                <TextField
                  fullWidth
                  required
                  label="Departure Time"
                  type="datetime-local"
                  value={formData.departureTime}
                  onChange={(e) => handleInputChange('departureTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText="Local time at departure airport"
                />

                <TextField
                  fullWidth
                  required
                  label="Arrival Time"
                  type="datetime-local"
                  value={formData.arrivalTime}
                  onChange={(e) => handleInputChange('arrivalTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText="Local time at arrival airport"
                  error={formData.departureTime && formData.arrivalTime && new Date(formData.arrivalTime) <= new Date(formData.departureTime)}
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Pricing Configuration
              </Typography>
              <TextField
                fullWidth
                required
                label="Base Price Per Hour"
                type="number"
                value={formData.basePricePerHour}
                onChange={(e) => handleInputChange('basePricePerHour', e.target.value)}
                inputProps={{ min: 0, step: 10 }}
                helperText={
                  <Box component="span">
                    <strong>Seat multipliers:</strong> Economy ×1.0 | Premium Economy ×1.5 | Business ×2.0 | First Class ×3.0
                    {formData.basePricePerHour && estimatedDuration && (
                      <Box component="div" sx={{ mt: 0.5, color: '#c8102e' }}>
                        <strong>Example prices:</strong> Economy: ${(parseFloat(formData.basePricePerHour) * parseFloat(estimatedDuration.split('h')[0])).toFixed(2)} | 
                        Business: ${(parseFloat(formData.basePricePerHour) * parseFloat(estimatedDuration.split('h')[0]) * 2).toFixed(2)}
                      </Box>
                    )}
                  </Box>
                }
              />
              
              {/* Revenue Calculator */}
              {calculateRevenue && (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mt: 2, 
                    bgcolor: '#fff3e0',
                    borderColor: '#ff9800'
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight="bold" color="#e65100">
                        💰 Estimated Revenue (Full Capacity)
                      </Typography>
                      <Chip 
                        label={`$${calculateRevenue.total}`} 
                        size="small" 
                        sx={{ 
                          bgcolor: '#ff9800', 
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Stack>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Typography variant="caption" color="text.secondary">
                        <strong>{calculateRevenue.seatCount} seats</strong> × avg price
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <strong>${calculateRevenue.perSeat}</strong> per seat average
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      * Based on typical seat class distribution
                    </Typography>
                  </Stack>
                </Paper>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button 
            onClick={clearDraft} 
            disabled={submitting}
            size="small"
            color="warning"
          >
            Clear Form
          </Button>
          <Stack direction="row" spacing={1}>
            <Button onClick={handleCloseDialog} disabled={submitting}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={submitting}
              sx={{ bgcolor: '#c8102e', '&:hover': { bgcolor: '#a00d25' } }}
            >
              {submitting ? 'Creating...' : 'Create Flight'}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );
}