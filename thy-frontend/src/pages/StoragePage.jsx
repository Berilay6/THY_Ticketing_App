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
  IconButton, // View butonu için
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from "@mui/material";
import { Warehouse, FlightTakeoff, Visibility } from "@mui/icons-material"; // Visibility (Göz) eklendi
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Yönlendirme için

// Mock Veriler
const MOCK_STORAGE = [
  { planeId: 101, modelType: "Boeing 737 Max", status: "maintenance", note: "Engine check required" },
  { planeId: 102, modelType: "Airbus A320", status: "retired", note: "Waiting for disposal" },
  { planeId: 105, modelType: "Boeing 777", status: "active", note: "Ready for deployment" },
];

export default function StoragePage() {
  const navigate = useNavigate(); // Hook
  const [storagePlanes, setStoragePlanes] = useState(MOCK_STORAGE);

  // Deploy Dialog State
  const [openAssign, setOpenAssign] = useState(false);
  const [selectedPlane, setSelectedPlane] = useState(null);
  const [targetAirport, setTargetAirport] = useState("");

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
    setOpenAssign(true);
  };

  const handleAssign = () => {
    setStoragePlanes(storagePlanes.filter(p => p.planeId !== selectedPlane.planeId));
    setOpenAssign(false);
    alert(`Plane #${selectedPlane.planeId} deployed successfully!`);
  };

  return (
    <Box className="page-root">

      {/* BAŞLIK */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Warehouse fontSize="large" color="action" />
        <Box>
          <Typography variant="h5" fontWeight="bold">Storage Inventory</Typography>
          <Typography variant="body2" color="text.secondary">
            List of planes currently in the hangar or storage.
          </Typography>
        </Box>
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
              <MenuItem value="IST">Istanbul (IST)</MenuItem>
              <MenuItem value="ESB">Ankara (ESB)</MenuItem>
              <MenuItem value="LHR">London (LHR)</MenuItem>
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

    </Box>
  );
}