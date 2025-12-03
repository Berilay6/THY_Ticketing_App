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
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack
} from "@mui/material";
import { Search, Visibility, Add, Delete } from "@mui/icons-material";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function AirportsPage() {
  const navigate = useNavigate();
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Add Airport Dialog State
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newAirport, setNewAirport] = useState({
    iataCode: "",
    name: "",
    city: "",
    country: "",
    timezone: ""
  });

  // Delete Airport Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [airportToDelete, setAirportToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch airports from backend
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        setLoading(true);
        console.log("Attempting to fetch airports from http://localhost:8080/api/admin/airports");
        const response = await fetch("http://localhost:8080/api/admin/airports");
        console.log("Fetch response status:", response.status);
        
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${text}`);
        }
        
        const data = await response.json();
        console.log("Airports data:", data);
        setAirports(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching airports:", err.message);
        setError(err.message);
        setAirports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAirports();
  }, []);

  const filteredAirports = useMemo(() => {
    return airports.filter(a =>
      a.iataCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [airports, searchTerm]);

  const handleDeleteAirport = async () => {
    if (!airportToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(`http://localhost:8080/api/admin/airports/${airportToDelete.airportId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const result = await response.text();
      alert(`Success: ${result}`);
      
      // Refresh airports list
      const refreshResponse = await fetch("http://localhost:8080/api/admin/airports");
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setAirports(Array.isArray(data) ? data : []);
      }
      
      setDeleteDialogOpen(false);
      setAirportToDelete(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleAddAirport = async () => {
    // Validation
    if (!newAirport.iataCode || !newAirport.name || !newAirport.city || !newAirport.country || !newAirport.timezone) {
      alert("Please fill in all fields");
      return;
    }

    if (newAirport.iataCode.length !== 3) {
      alert("IATA code must be exactly 3 characters");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/admin/airports", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAirport)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to add airport');
      }

      const result = await response.text();
      alert(result);

      // Refresh airports list
      const refreshResponse = await fetch("http://localhost:8080/api/admin/airports");
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setAirports(Array.isArray(data) ? data : []);
      }

      // Close dialog and reset form
      setOpenAddDialog(false);
      setNewAirport({
        iataCode: "",
        name: "",
        city: "",
        country: "",
        timezone: ""
      });
    } catch (err) {
      console.error("Error adding airport:", err);
      alert("Failed to add airport: " + err.message);
    }
  };

  return (
    <Box className="page-root">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Airports Management</Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage global destinations.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Airport
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : airports.length === 0 ? (
        <Alert severity="info">No airports available.</Alert>
      ) : (
        <Paper elevation={0} className="card" sx={{ p: 0, overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid var(--border-subtle)' }}>
            <TextField
              placeholder="Search by IATA code, city or name..."
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment> }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f9fafb' }}>
                <TableRow>
                  <TableCell><strong>IATA</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell><strong>Timezone</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAirports.map((airport) => (
                  <TableRow key={airport.airportId} hover>
                    <TableCell>
                      <Chip label={airport.iataCode} size="small" sx={{ fontWeight: 'bold', borderRadius: 1 }} />
                    </TableCell>
                    <TableCell>{airport.name}</TableCell>
                    <TableCell>{airport.city}, {airport.country}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{airport.timezone}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/admin/airports/${airport.airportId}`)}
                        title="View Details"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => {
                          setAirportToDelete(airport);
                          setDeleteDialogOpen(true);
                        }}
                        title="Delete Airport"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Add Airport Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Airport</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="IATA Code"
              placeholder="e.g., JFK"
              fullWidth
              required
              value={newAirport.iataCode}
              onChange={(e) => setNewAirport({ ...newAirport, iataCode: e.target.value.toUpperCase() })}
              inputProps={{ maxLength: 3 }}
              helperText="3-letter airport code"
            />
            <TextField
              label="Airport Name"
              placeholder="e.g., John F. Kennedy International Airport"
              fullWidth
              required
              value={newAirport.name}
              onChange={(e) => setNewAirport({ ...newAirport, name: e.target.value })}
            />
            <TextField
              label="City"
              placeholder="e.g., New York"
              fullWidth
              required
              value={newAirport.city}
              onChange={(e) => setNewAirport({ ...newAirport, city: e.target.value })}
            />
            <TextField
              label="Country"
              placeholder="e.g., United States"
              fullWidth
              required
              value={newAirport.country}
              onChange={(e) => setNewAirport({ ...newAirport, country: e.target.value })}
            />
            <TextField
              label="Timezone"
              placeholder="e.g., America/New_York"
              fullWidth
              required
              value={newAirport.timezone}
              onChange={(e) => setNewAirport({ ...newAirport, timezone: e.target.value })}
              helperText="IANA timezone format (e.g., Europe/Istanbul)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddAirport}>
            Add Airport
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => !deleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Clear Airport</DialogTitle>
        <DialogContent>
          {airportToDelete && (
            <>
              <Typography gutterBottom>
                Are you sure you want to clear <strong>{airportToDelete.name} ({airportToDelete.iataCode})</strong>?
              </Typography>
              <Alert severity="error" sx={{ mt: 2 }}>
                <strong>WARNING:</strong> This action cannot be undone!
                <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                  <li><strong>All flights</strong> departing from/arriving at this airport will be cancelled</li>
                  <li><strong>All tickets</strong> for cancelled flights will be refunded</li>
                  <li><strong>All planes</strong> at this airport will be moved to Storage</li>
                  <li>Airport operations will be cleared</li>
                </ul>
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAirport} 
            color="error" 
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : 'Yes, Clear Airport'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}