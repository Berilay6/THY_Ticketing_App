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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  TextField
} from "@mui/material";
import { Build, FlightLand, Visibility } from "@mui/icons-material";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Alert } from "@mui/material";

export default function PlanesPage() {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filters
  const [filterId, setFilterId] = useState("");
  const [filterModel, setFilterModel] = useState("");
  const [filterAirport, setFilterAirport] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // fetch planes and airports from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch planes
        console.log("Attempting to fetch planes from http://localhost:8080/api/admin/planes");
        const planesResponse = await fetch("http://localhost:8080/api/admin/planes");
        console.log("Planes fetch response status:", planesResponse.status);
        
        if (!planesResponse.ok) {
          const text = await planesResponse.text();
          throw new Error(`HTTP ${planesResponse.status}: ${text}`);
        }
        
        const planesData = await planesResponse.json();
        console.log("Planes data:", planesData);
        setPlanes(Array.isArray(planesData) ? planesData : []);
        
        // Fetch airports
        console.log("Attempting to fetch airports from http://localhost:8080/api/admin/airports");
        const airportsResponse = await fetch("http://localhost:8080/api/admin/airports");
        console.log("Airports fetch response status:", airportsResponse.status);
        
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
        setPlanes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "success";
      case "maintenance": return "warning";
      case "retired": return "default";
      default: return "primary";
    }
  };

  // Get unique model types from planes data
  const modelTypes = useMemo(() => {
    const uniqueModels = [...new Set(planes.map(p => p.modelType))];
    return uniqueModels.sort();
  }, [planes]);

  // Format airport names for dropdown
  const airportOptions = useMemo(() => {
    return airports.map(airport => `${airport.name} (${airport.iataCode})`).sort();
  }, [airports]);

  const filteredPlanes = useMemo(() => {
    return planes.filter((p) => {
      // Plane ID filter - only apply if filterId is not empty
      if (filterId && String(p.planeId) !== filterId) return false;
      // Model filter - only apply if filterModel is not empty
      if (filterModel && p.modelType !== filterModel) return false;
      // Airport filter - only apply if filterAirport is not empty
      if (filterAirport && p.airportName !== filterAirport) return false;
      // Status filter - only apply if filterStatus is not empty
      if (filterStatus && p.status !== filterStatus) return false;
      return true;
    });
  }, [planes, filterId, filterModel, filterAirport, filterStatus]);

  return (
    <Box className="page-root">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Planes</Typography>
          <Typography variant="body2" color="text.secondary">Filter and view plane details.</Typography>
        </Box>
        {/* Add/Delete buttons intentionally removed */}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : planes.length === 0 ? (
        <Alert severity="info">No planes available.</Alert>
      ) : (
        <>
          <Paper elevation={0} sx={{ p: 2, mb: 2 }} className="card">
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems="center">
              <TextField label="Plane ID" size="small" value={filterId} onChange={(e) => setFilterId(e.target.value)} />
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Model Type</InputLabel>
                <Select value={filterModel} label="Model Type" onChange={(e) => setFilterModel(e.target.value)}>
                  <MenuItem value=""><em>All</em></MenuItem>
                  {modelTypes.map((model) => (
                    <MenuItem key={model} value={model}>{model}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 280 }}>
                <InputLabel>Airport / Location</InputLabel>
                <Select value={filterAirport} label="Airport / Location" onChange={(e) => setFilterAirport(e.target.value)}>
                  <MenuItem value=""><em>All</em></MenuItem>
                  {airportOptions.map((airport) => (
                    <MenuItem key={airport} value={airport}>{airport}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Status</InputLabel>
                <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
                  <MenuItem value=""><em>All</em></MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="retired">Retired</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          <TableContainer component={Paper} className="card">
            <Table>
              <TableHead sx={{ bgcolor: '#f9fafb' }}>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Model</strong></TableCell>
                  <TableCell><strong>Current Location</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPlanes.map((plane) => (
                  <TableRow
                    key={plane.planeId}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/admin/planes/${plane.planeId}`)}
                  >
                    <TableCell>#{plane.planeId}</TableCell>
                    <TableCell>{plane.modelType}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <FlightLand fontSize="small" color="action" />
                        {plane.airportName}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={plane.status.toUpperCase()} color={getStatusColor(plane.status)} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={(e) => { e.stopPropagation(); navigate(`/admin/planes/${plane.planeId}`); }} size="small" title="View Details">
                        <Visibility fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}