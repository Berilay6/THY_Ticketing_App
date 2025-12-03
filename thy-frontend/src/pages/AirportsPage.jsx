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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  InputAdornment
} from "@mui/material";
import { Add, Delete, Search, Visibility } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MOCK_AIRPORTS = [
  { id: 1, iata: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", timezone: "UTC+03:00" },
  { id: 2, iata: "ESB", name: "Esenboga Airport", city: "Ankara", country: "Turkey", timezone: "UTC+03:00" },
  { id: 3, iata: "LHR", name: "Heathrow Airport", city: "London", country: "UK", timezone: "UTC+00:00" },
];

export default function AirportsPage() {
  const navigate = useNavigate();
  const [airports, setAirports] = useState(MOCK_AIRPORTS);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog State (Sadece Ekleme İçin)
  const [openAdd, setOpenAdd] = useState(false);
  const [formData, setFormData] = useState({ iata: "", name: "", city: "", country: "" });

  const filteredAirports = airports.filter(a =>
    a.iata.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    const newId = airports.length + 1;
    setAirports([...airports, { ...formData, id: newId, timezone: "UTC+03:00" }]);
    setOpenAdd(false);
    setFormData({ iata: "", name: "", city: "", country: "" });
  };

  const handleDelete = (id) => {
    if(window.confirm("Delete this airport?")) {
      setAirports(airports.filter(a => a.id !== id));
    }
  };

  return (
    <Box className="page-root">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Airports Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage global destinations and ground operations.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenAdd(true)}
          sx={{ bgcolor: 'var(--primary)' }}
        >
          Add Airport
        </Button>
      </Box>

      <Paper elevation={0} className="card" sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid var(--border-subtle)' }}>
          <TextField
            placeholder="Search by IATA code or City..."
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
                <TableRow key={airport.id} hover>
                  <TableCell>
                    <Chip label={airport.iata} size="small" sx={{ fontWeight: 'bold', borderRadius: 1 }} />
                  </TableCell>
                  <TableCell>{airport.name}</TableCell>
                  <TableCell>{airport.city}, {airport.country}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{airport.timezone}</TableCell>
                  <TableCell align="right">

                    {/* VIEW DETAILS BUTONU (GÜNCELLENDİ) */}
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/admin/airports/${airport.id}`)}
                      title="View Details"
                    >
                      <Visibility fontSize="small" />
                    </IconButton>

                    <IconButton color="error" onClick={() => handleDelete(airport.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ADD AIRPORT DIALOG */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Airport</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={4}>
              <TextField
                label="IATA Code"
                placeholder="IST"
                fullWidth
                inputProps={{ maxLength: 3, style: { textTransform: 'uppercase' } }}
                value={formData.iata}
                onChange={(e) => setFormData({...formData, iata: e.target.value})}
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                label="Airport Name"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField label="City" fullWidth value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Country" fullWidth value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} disabled={!formData.iata}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}