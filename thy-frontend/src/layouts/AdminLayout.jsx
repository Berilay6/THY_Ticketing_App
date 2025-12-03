import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";

// İkonlar
import DashboardIcon from "@mui/icons-material/Dashboard";
import FlightIcon from "@mui/icons-material/Flight";
import PublicIcon from "@mui/icons-material/Public";
import ScheduleIcon from "@mui/icons-material/Schedule";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";

import "../styles/layout.css";

const adminMenuItems = [
  { label: "Dashboard", path: "/admin", icon: <DashboardIcon /> },
  { label: "Planes", path: "/admin/planes", icon: <FlightIcon /> },
  { label: "Airports", path: "/admin/airports", icon: <PublicIcon /> },
  { label: "Flights", path: "/admin/flights", icon: <ScheduleIcon /> },
  { label: "Storage", path: "/admin/storage", icon: <WarehouseIcon /> },
];

export default function AdminLayout() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const adminName = "Admin";

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <Box className="app-root">

      <Drawer
        variant="permanent"
        PaperProps={{ className: "app-sidebar-paper" }}
      >
        <Toolbar />
        <List className="sidebar-list">
          {adminMenuItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
              }
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box className="app-main">
        <AppBar position="fixed" elevation={0} className="app-appbar">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FlightTakeoffIcon sx={{ color: "var(--primary)" }} />
              <Typography variant="h6"></Typography>
            </Box>

            <Box>
              <Button
                startIcon={<AccountCircleIcon />}
                onClick={handleMenuOpen}
                sx={{ color: "inherit" }}
              >
                {adminName}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>

          </Toolbar>
        </AppBar>

        <Box component="main" className="app-content">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}