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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Alert,
  TextField
} from "@mui/material";
import { Warehouse, FlightTakeoff, Visibility, Flight } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function StoragePage() {
  const navigate = useNavigate();
  const [storagePlanes, setStoragePlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [airports, setAirports] = useState([]);

  // Deploy Dialog State
  const [openAssign, setOpenAssign] = useState(false);
  const [selectedPlane, setSelectedPlane] = useState(null);
  const [targetAirport, setTargetAirport] = useState("");

  // Add Plane Dialog State
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newPlaneModel, setNewPlaneModel] = useState("");

  // Fetch planes and filter storage planes (where airportName is "Storage")
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all planes
        console.log("Attempting to fetch planes from http://localhost:8080/api/admin/planes");
        const planesResponse = await fetch("http://localhost:8080/api/admin/planes");
        console.log("Planes fetch response status:", planesResponse.status);
        
        if (!planesResponse.ok) {
          const text = await planesResponse.text();
          throw new Error(`HTTP ${planesResponse.status}: ${text}`);
        }
        
        const planesData = await planesResponse.json();
        console.log("Planes data:", planesData);
        
        // Filter only planes in storage (airportName === "Storage")
        const storage = planesData.filter(p => p.airportName === "Storage");
        setStoragePlanes(storage);
        
        // Fetch airports for deploy dialog
        console.log("Attempting to fetch airports from http://localhost:8080/api/admin/airports");
        const airportsResponse = await fetch("http://localhost:8080/api/admin/airports");
        
        if (!airportsResponse.ok) {
          const text = await airportsResponse.text();
          throw new Error(`HTTP ${airportsResponse.status}: ${text}`);
        }
        
        const airportsData = await airportsResponse.json();
        console.log("Airports data:", airportsData);
        setAirports(Array.isArray(airportsData) ? airportsData : []);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError(err.message);
        setStoragePlanes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'retired': return 'error';
      default: return 'default';
    }
  };

  const handleOpenAssign = (plane) => {
    setSelectedPlane(plane);
    setTargetAirport("");
    setOpenAssign(true);
  };

  const handleAssign = async () => {
    if (!targetAirport) {
      alert("Please select an airport");
      return;
    }

    try {
      console.log(`Deploying plane ${selectedPlane.planeId} to airport ${targetAirport}`);
      console.log(`Plane status: ${selectedPlane.status}`);
      
      const response = await fetch(
        `http://localhost:8080/api/admin/planes/${selectedPlane.planeId}/airport/${targetAirport}`,
        {
          method: 'PUT'
        }
      );

      console.log("Deploy response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Deploy error response:", errorText);
        throw new Error(errorText || 'Failed to deploy plane');
      }

      const result = await response.text();
      console.log("Deploy success:", result);
      alert(result);
      
      // Remove plane from storage list and close dialog
      setStoragePlanes(storagePlanes.filter(p => p.planeId !== selectedPlane.planeId));
      setOpenAssign(false);
      setSelectedPlane(null);
      setTargetAirport("");
    } catch (err) {
      console.error("Error deploying plane:", err);
      alert("Failed to deploy plane: " + err.message);
    }
  };

  const handleAddPlane = async () => {
    if (!newPlaneModel) {
      alert("Please enter a plane model");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/admin/planes", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          modelType: newPlaneModel,
          airportId: null
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to add plane');
      }

      const result = await response.text();
      alert(result);

      // Refresh planes list
      const planesResponse = await fetch("http://localhost:8080/api/admin/planes");
      if (planesResponse.ok) {
        const planesData = await planesResponse.json();
        const storage = planesData.filter(p => p.airportName === "Storage");
        setStoragePlanes(storage);
      }

      setOpenAddDialog(false);
      setNewPlaneModel("");
    } catch (err) {
      console.error("Error adding plane:", err);
      alert("Failed to add plane: " + err.message);
    }
  };



  return (
    <Box className="page-root">

      {/* BAŞLIK */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Warehouse fontSize="large" color="action" />
          <Box>
            <Typography variant="h5" fontWeight="bold">Storage Inventory</Typography>
            <Typography variant="body2" color="text.secondary">
              List of planes currently in the hangar or storage.
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<Flight />}
            onClick={() => setOpenAddDialog(true)}
          >
            Add Plane
          </Button>
        </Stack>
      </Box>

      {/* TABLO */}
      <Paper elevation={0} className="card" sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f9fafb' }}>
              <TableRow>
                <TableCell><strong>Plane ID</strong></TableCell>
                <TableCell><strong>Model</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Notes</strong></TableCell>
                <TableCell align="right"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {storagePlanes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Storage is empty.
                  </TableCell>
                </TableRow>
              ) : (
                storagePlanes.map((plane) => (
                  <TableRow key={plane.planeId} hover>
                    <TableCell>#{plane.planeId}</TableCell>
                    <TableCell>{plane.modelType}</TableCell>
                    <TableCell>
                      <Chip
                        label={plane.status.toUpperCase()}
                        size="small"
                        color={getStatusColor(plane.status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      {plane.note}
                    </TableCell>

                    {/* AKSİYON BUTONLARI (GÜNCELLENDİ) */}
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">

                        {/* 1. VIEW BUTONU (YENİ EKLENDİ) */}
                        {/* Tıklayınca PlaneInfoPage sayfasına gider */}
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => navigate(`/admin/planes/${plane.planeId}`)}
                          title="View Details & Seats"
                          sx={{ border: '1px solid', borderColor: 'divider' }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>

                        {/* 2. DEPLOY BUTONU (MEVCUT) */}
                        {plane.status === 'active' && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<FlightTakeoff />}
                            onClick={() => handleOpenAssign(plane)}
                            sx={{ textTransform: 'none', bgcolor: 'secondary.main' }}
                          >
                            Deploy
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* DEPLOY DIALOG */}
      <Dialog open={openAssign} onClose={() => setOpenAssign(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Deploy Plane</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Select a destination airport for Plane #{selectedPlane?.planeId}.
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Destination Airport</InputLabel>
            <Select
              value={targetAirport}
              label="Destination Airport"
              onChange={(e) => setTargetAirport(e.target.value)}
            >
              {airports.map((airport) => (
                <MenuItem key={airport.airportId} value={airport.airportId}>
                  {airport.name} ({airport.iataCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssign(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign} disabled={!targetAirport}>
            Confirm Deploy
          </Button>
        </DialogActions>
      </Dialog>

      {/* ADD PLANE DIALOG */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Plane to Storage</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add a new plane to storage. It will be created with active status and no airport assignment.
          </Typography>
          <TextField
            label="Plane Model"
            placeholder="e.g., Boeing 737-800, Airbus A320"
            fullWidth
            required
            value={newPlaneModel}
            onChange={(e) => setNewPlaneModel(e.target.value)}
            helperText="Enter the aircraft model type"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddPlane} disabled={!newPlaneModel}>
            Add Plane
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}