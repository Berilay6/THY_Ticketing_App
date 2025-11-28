import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
} from "@mui/material";

export default function CheckInPage() {
  return (
    <Box className="page-root" style={{ maxWidth: 480 }}>
      <Typography variant="h5" gutterBottom>
        Online check-in
      </Typography>
      <Paper elevation={0} className="card">
        <Stack spacing={2}>
          <TextField label="Booking code" fullWidth />
          <TextField label="Last name" fullWidth />
          <Button variant="contained">Find my booking</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
