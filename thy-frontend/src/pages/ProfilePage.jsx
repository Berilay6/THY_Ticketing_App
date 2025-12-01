import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { userApi } from "../api/apiClient";

export default function ProfilePage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

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

  const handleChangePassword = () => {
    if (!userId || !oldPassword || !newPassword) return;

    setPasswordLoading(true);
    userApi
      .changePassword(userId, { oldPassword, newPassword })
      .then(() => {
        alert("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
      })
      .catch((err) => {
        console.error("Failed to change password:", err);
        alert(
          err.payload?.message ||
            "Failed to change password. Please check your old password."
        );
      })
      .finally(() => setPasswordLoading(false));
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

      <Paper elevation={0} className="card" sx={{ mt: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Change Password
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Old Password"
            type={showOldPassword ? "text" : "password"}
            size="small"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            inputProps={{ maxLength: 8 }}
            error={oldPassword.length > 0 && oldPassword.length < 8}
            helperText={
              oldPassword.length > 0 && oldPassword.length < 8
                ? "Password must be exactly 8 characters"
                : ""
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    edge="end"
                  >
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            size="small"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            inputProps={{ maxLength: 8 }}
            error={newPassword.length > 0 && newPassword.length < 8}
            helperText={
              newPassword.length > 0 && newPassword.length < 8
                ? "Password must be exactly 8 characters"
                : "Enter exactly 8 characters"
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={
              !oldPassword ||
              !newPassword ||
              oldPassword.length !== 8 ||
              newPassword.length !== 8 ||
              passwordLoading
            }
          >
            {passwordLoading ? "Changing..." : "Change Password"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
