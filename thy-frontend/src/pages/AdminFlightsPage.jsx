import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  MenuItem
} from "@mui/material";
import { Add, Block, Info, Event, Search } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MOCK_FLIGHTS = [
  { id: 101, route: "IST - LHR", date: "2025-12-10 14:30", plane: "Boeing 737 (TC-JHK)", status: "scheduled" },
  { id: 102, route: "ESB - IST", date: "2025-12-11 09:00", plane: "Airbus A320 (TC-ABV)", status: "active" },
  { id: 103, route: "IST - JFK", date: "2025-12-12 06:45", plane: "Boeing 777 (TC-LKA)", status: "cancelled" },
];

export default function AdminFlightsPage() {
  const navigate = useNavigate();
  const [flights, setFlights] = useState(MOCK_FLIGHTS);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog (Sadece Ekleme İçin)
  const [openCreate, setOpenCreate] = useState(false);

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'success';
      case 'scheduled': return 'primary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const handleCancel = (id) => {
    if(window.confirm("Cancel this flight?")) {
      setFlights(flights.map(f => f.id === id ? {...f, status: 'cancelled'} : f));
    }
  };

  const filteredFlights = flights.filter(f =>
    f.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.plane.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box className="page-root">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Flight Operations</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage flight schedules, view occupancy and revenues.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenCreate(true)}
          sx={{ bgcolor: 'var(--primary)' }}
        >
          Create Flight
        </Button>
      </Box>

      <Paper elevation={0} className="card" sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid var(--border-subtle)' }}>
          <TextField
            placeholder="Search route or plane..."
            size="small"
            fullWidth
            InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
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
                <TableCell><strong>Date & Time</strong></TableCell>
                <TableCell><strong>Assigned Plane</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFlights.map((flight) => (
                <TableRow key={flight.id} hover>
                  <TableCell>#{flight.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{flight.route}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Event fontSize="small" color="action" />
                      {flight.date}
                    </Stack>
                  </TableCell>
                  <TableCell>{flight.plane}</TableCell>
                  <TableCell>
                    <Chip label={flight.status.toUpperCase()} color={getStatusColor(flight.status)} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">

                    {/* VIEW DETAILS BUTONU (GÜNCELLENDİ) */}
                    <IconButton
                      color="info"
                      onClick={() => navigate(`/admin/flights/${flight.id}`)}
                      title="View Details"
                    >
                      <Info />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => handleCancel(flight.id)}
                      disabled={flight.status === 'cancelled'}
                      title="Cancel Flight"
                    >
                      <Block />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* CREATE FLIGHT DIALOG */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
        <DialogTitle>Schedule New Flight</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Route (Origin - Destination)" placeholder="IST - JFK" fullWidth />
            <TextField type="datetime-local" label="Date & Time" InputLabelProps={{ shrink: true }} fullWidth />
            <TextField select label="Select Plane" defaultValue="" fullWidth>
               <MenuItem value="1">Boeing 737 (Active)</MenuItem>
               <MenuItem value="2">Airbus A320 (Active)</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { alert("Flight Created!"); setOpenCreate(false); }}>
            Create Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}