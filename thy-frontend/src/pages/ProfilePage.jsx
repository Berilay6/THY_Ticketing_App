import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import { userApi } from "../api/apiClient";

export default function ProfilePage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      const emailOrPhone = localStorage.getItem("userEmail") || userId;
      loadProfile(emailOrPhone);
    }
  }, [userId]);

  const loadProfile = (emailOrPhone) => {
    userApi
      .getByEmailOrPhone(emailOrPhone)
      .then((user) => {
        if (user) {
          setFirstName(user.firstName || "");
          setLastName(user.lastName || "");
          setEmail(user.email || "");
          setPhone(user.phoneNum || "");
        }
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
      });
  };

  const handleUpdate = () => {
    if (!userId) return;

    setLoading(true);
    const updateData = {
      userId,
      firstName,
      lastName,
      email,
      phoneNum: phone,
    };
    userApi
      .update(userId, updateData)
      .then(() => {
        localStorage.setItem("userFirstName", firstName);
        localStorage.setItem("userEmail", email);
        alert("Profile updated successfully!");
      })
      .catch((err) => {
        console.error("Failed to update profile:", err);
      })
      .finally(() => setLoading(false));
  };
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
          <TextField
            label="First name"
            size="small"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Last name"
            size="small"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            label="Email"
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Phone"
            size="small"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button variant="contained" onClick={handleUpdate} disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
