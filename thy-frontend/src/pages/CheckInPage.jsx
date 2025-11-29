import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import { useState } from "react";
import { ticketApi } from "../api/apiClient";

export default function CheckInPage() {
  const [bookingCode, setBookingCode] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    if (!bookingCode || !lastName) return;

    setLoading(true);
    try {
      // Find ticket by booking code and last name (would need backend support)
      console.log("Checking in:", { bookingCode, lastName });
      alert("Check-in functionality coming soon");
    } catch (err) {
      console.error("Check-in failed:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box className="page-root" style={{ maxWidth: 480 }}>
      <Typography variant="h5" gutterBottom>
        Online check-in
      </Typography>
      <Paper elevation={0} className="card">
        <Stack spacing={2}>
          <TextField
            label="Booking code"
            fullWidth
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value)}
          />
          <TextField
            label="Last name"
            fullWidth
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleCheckIn}
            disabled={loading}
          >
            {loading ? "Searching..." : "Find my booking"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
