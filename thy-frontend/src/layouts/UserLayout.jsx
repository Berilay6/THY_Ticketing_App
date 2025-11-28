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
} from "@mui/material";
import { NavLink, Outlet } from "react-router-dom";

import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AirplaneTicketOutlinedIcon from "@mui/icons-material/AirplaneTicketOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ShoppingBasketOutlinedIcon from "@mui/icons-material/ShoppingBasketOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";

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
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Hello, Cemre
            </Typography>
          </Toolbar>
        </AppBar>

        <Box component="main" className="app-content">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
