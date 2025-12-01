import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Link,
  MenuItem,
  InputAdornment,
  IconButton,
  Grid,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/apiClient";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    email: "",
    password: "",
    phoneNum: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSignup = () => {
    setError("");
    setLoading(true);

    authApi
      .signup(formData)
      .then((response) => {
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("userId", response.userId);
        localStorage.setItem("userEmail", response.email);
        localStorage.setItem(
          "userName",
          `${response.firstName} ${response.lastName}`
        );
        navigate("/");
      })
      .catch((err) => {
        console.error("Signup failed:", err);
        setError(err.payload?.message || "Signup failed. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "var(--bg-main)",
        py: 4,
      }}
    >
      <Box sx={{ maxWidth: 700, width: "100%", p: 3 }}>
        <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 3 }}>
          Sign Up
        </Typography>

        <Paper elevation={3} sx={{ p: 4 }}>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={handleChange("firstName")}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange("lastName")}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Middle Name (Optional)"
                value={formData.middleName}
                onChange={handleChange("middleName")}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange("dateOfBirth")}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Gender"
                select
                value={formData.gender}
                onChange={handleChange("gender")}
                fullWidth
                required
              >
                <MenuItem value="F">Female</MenuItem>
                <MenuItem value="M">Male</MenuItem>
                <MenuItem value="O">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Nationality (Optional)"
                value={formData.nationality}
                onChange={handleChange("nationality")}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange("password")}
                fullWidth
                required
                slotProps={{
                  htmlInput: { maxLength: 8 },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                error={
                  formData.password.length > 0 && formData.password.length < 8
                }
                helperText={
                  formData.password.length > 0 && formData.password.length < 8
                    ? "Password must be exactly 8 characters"
                    : "Enter exactly 8 characters"
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Phone Number"
                value={formData.phoneNum}
                onChange={handleChange("phoneNum")}
                placeholder="+905551234567"
                fullWidth
                required
              />
            </Grid>
          </Grid>

          <Button
            variant="contained"
            fullWidth
            onClick={handleSignup}
            disabled={loading || formData.password.length !== 8}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>

          <Typography variant="body2" textAlign="center">
            Already have an account?{" "}
            <Link href="/login" sx={{ cursor: "pointer" }}>
              Login
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
