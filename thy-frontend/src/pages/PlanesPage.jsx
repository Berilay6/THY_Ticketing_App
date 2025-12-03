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
  TextField,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from "@mui/material";
import { Add, Delete, Build, FlightLand, Visibility } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MOCK_PLANES = [
  { planeId: 101, modelType: "Boeing 737", status: "active", airportName: "Istanbul (IST)" },
  { planeId: 102, modelType: "Airbus A320", status: "maintenance", airportName: "Ankara (ESB)" },
  { planeId: 105, modelType: "Boeing 777", status: "active", airportName: "Izmir (ADB)" },
  { planeId: 108, modelType: "Airbus A330", status: "retired", airportName: "Storage" },
];

export default function PlanesPage() {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState(MOCK_PLANES);

  // Dialog State (Ekleme için)
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newModel, setNewModel] = useState("");
  const [newAirport, setNewAirport] = useState("");

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "success";
      case "maintenance": return "warning";
      case "retired": return "default";
      default: return "primary";
    }
  };

  const handleAddPlane = () => {
    const newPlane = {
      planeId: planes.length + 100,
      modelType: newModel,
      status: "active",
      airportName: newAirport || "Storage"
    };
    setPlanes([...planes, newPlane]);
    setOpenAddDialog(false);
    setNewModel("");
    setNewAirport("");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this plane?")) {
      setPlanes(planes.filter(p => p.planeId !== id));
    }
  };

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "maintenance" : "active";
    setPlanes(planes.map(p => p.planeId === id ? { ...p, status: newStatus } : p));
  };

  return (
    <Box className="page-root">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Planes Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage fleet inventory, maintenance status and locations.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenAddDialog(true)}
          sx={{ bgcolor: 'var(--primary)' }}
        >
          Add New Plane
        </Button>
      </Box>

      <Paper elevation={0} className="card" sx={{ overflow: 'hidden' }}>
        <TableContainer>
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
              {planes.map((plane) => (
                <TableRow key={plane.planeId} hover>
                  <TableCell>#{plane.planeId}</TableCell>
                  <TableCell>{plane.modelType}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <FlightLand fontSize="small" color="action" />
                      {plane.airportName}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={plane.status.toUpperCase()}
                      color={getStatusColor(plane.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">

                    {/* VIEW DETAILS BUTONU (GÜNCELLENDİ) */}
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/admin/planes/${plane.planeId}`)}
                      title="View Details"
                    >
                      <Visibility fontSize="small" />
                    </IconButton>

                    <IconButton color="warning" onClick={() => toggleStatus(plane.planeId, plane.status)}>
                      <Build fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(plane.planeId)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ADD PLANE DIALOG */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Plane</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Model Type (e.g. Boeing 737)"
              fullWidth
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Initial Location</InputLabel>
              <Select
                value={newAirport}
                label="Initial Location"
                onChange={(e) => setNewAirport(e.target.value)}
              >
                <MenuItem value=""><em>Storage (No Airport)</em></MenuItem>
                <MenuItem value="Istanbul (IST)">Istanbul (IST)</MenuItem>
                <MenuItem value="Ankara (ESB)">Ankara (ESB)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddPlane} disabled={!newModel}>Add Plane</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}