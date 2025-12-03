import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/apiClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setError("");
    setLoading(true);

    authApi
      .login({ email, password })
      .then((response) => {
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("userId", response.userId);
        localStorage.setItem("userEmail", response.email);
        localStorage.setItem(
          "userName",
          `${response.firstName} ${response.lastName}`
        );
        localStorage.setItem("userType", response.userType);

        // Kullanıcı tipine göre yönlendirme
        if (response.userType === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      })
      .catch((err) => {
        console.error("Login failed:", err);
        setError(err.payload?.message || "Invalid email or password");
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
      }}
    >
      <Box sx={{ maxWidth: 450, width: "100%", p: 3 }}>
        <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 3 }}>
          Login
        </Typography>

        <Paper elevation={3} sx={{ p: 4 }}>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
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
            error={password.length > 0 && password.length < 8}
            helperText={
              password.length > 0 && password.length < 8
                ? "Password must be exactly 8 characters"
                : "Enter 8 characters"
            }
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleLogin}
            disabled={!email || !password || password.length !== 8 || loading}
            sx={{ mb: 2, py: 1.5 }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <Typography variant="body2" textAlign="center">
            Don't have an account?{" "}
            <Link href="/signup" sx={{ cursor: "pointer" }}>
              Sign up
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
