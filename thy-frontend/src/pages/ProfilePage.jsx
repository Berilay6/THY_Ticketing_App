import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
} from "@mui/material";

export default function ProfilePage() {
  return (
    <Box className="page-root" style={{ maxWidth: 640 }}>
      <Typography variant="h5" gutterBottom>
        Profile
      </Typography>

      <Paper elevation={0} className="card">
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Personal information
        </Typography>
        <Stack spacing={2}>
          <TextField label="First name" size="small" defaultValue="Cemre" />
          <TextField label="Last name" size="small" defaultValue="Yılmaz" />
          <TextField
            label="Email"
            size="small"
            defaultValue="cemre@example.com"
          />
          <TextField
            label="Phone"
            size="small"
            defaultValue="+90 5xx xxx xx xx"
          />
          <Button variant="contained">Update</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
