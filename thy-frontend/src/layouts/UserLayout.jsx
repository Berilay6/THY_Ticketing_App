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
import { useState, useEffect } from "react";

import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AirplaneTicketOutlinedIcon from "@mui/icons-material/AirplaneTicketOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ShoppingBasketOutlinedIcon from "@mui/icons-material/ShoppingBasketOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import "../styles/layout.css";

const menuItems = [
  { label: "Home", path: "/", icon: <HomeOutlinedIcon /> },
  { label: "Profile", path: "/profile", icon: <PersonOutlineOutlinedIcon /> },
  {
    label: "My Flights",
    path: "/my-flights",
    icon: <AirplaneTicketOutlinedIcon />,
  },
  {
    label: "Payment History",
    path: "/payments-history",
    icon: <CreditCardOutlinedIcon />,
  },
  { label: "Book Flight", path: "/book-flight", icon: <SearchOutlinedIcon /> },
  { label: "Basket", path: "/basket", icon: <ShoppingBasketOutlinedIcon /> },
  {
    label: "Check-in",
    path: "/check-in",
    icon: <AssignmentTurnedInOutlinedIcon />,
  },
];

export default function UserLayout() {
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const updateUserName = () => {
      const token = localStorage.getItem("authToken");
      const name = localStorage.getItem("userName");

      if (token && name) {
        setUserName(name);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    // Initial load
    updateUserName();

    // Listen for user updates
    window.addEventListener("userUpdate", updateUserName);

    return () => {
      window.removeEventListener("userUpdate", updateUserName);
    };
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    handleMenuClose();
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
          {menuItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
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
              <Typography variant="h6">THY Ticketing</Typography>
            </Box>

            {isLoggedIn ? (
              <>
                <Button
                  startIcon={<AccountCircleIcon />}
                  onClick={handleMenuOpen}
                  sx={{ color: "inherit" }}
                >
                  {userName}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      navigate("/profile");
                    }}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{ color: "inherit", borderColor: "inherit" }}
              >
                Login
              </Button>
            )}
          </Toolbar>
        </AppBar>

        <Box component="main" className="app-content">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
