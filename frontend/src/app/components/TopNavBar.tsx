"use client";

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useRouter } from "next/navigation";

export default function TopNavBar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Replace with real auth later
  const router = useRouter();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Navigation functions
  const navigateTo = (path: string) => {
    router.push(path);
    handleMenuClose();
  };

  const handleRegisterClick = () => {
    router.push("/register"); // Navigate to registration page
  };

  const handleLoginClick = () => {
    router.push("/login"); // Navigate to login page (if you have it)
  };

  const handleLogoutClick = () => {
    // Placeholder for logout logic
    setIsAuthenticated(false);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(15px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        color: "#fff",
        borderBottom: "1px solid rgba(255, 255, 255, 0.18)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo / Brand Name */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            fontSize: "1.5rem",
            letterSpacing: "1px",
            cursor: "pointer",
          }}
          onClick={() => navigateTo("/")}
        >
          FairTrace
        </Typography>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          <Button color="inherit" onClick={() => navigateTo("/")}>Home</Button>
          <Button color="inherit" onClick={() => navigateTo("/about")}>About</Button>
          <Button color="inherit" onClick={() => navigateTo("/features")}>Features</Button>
          <Button color="inherit" onClick={() => navigateTo("/contact")}>Contact</Button>

          {!isAuthenticated ? (
            <>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleLoginClick}
              >
                Login
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#00c853",
                  "&:hover": { backgroundColor: "#00b342" },
                }}
                onClick={handleRegisterClick}
              >
                Register
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#d32f2f",
                "&:hover": { backgroundColor: "#b71c1c" },
              }}
              onClick={handleLogoutClick}
            >
              Logout
            </Button>
          )}
        </Box>

        {/* Mobile Menu */}
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            {["Home", "About", "Features", "Contact"].map((item) => (
              <MenuItem key={item} onClick={() => navigateTo(`/${item.toLowerCase()}`)}>
                {item}
              </MenuItem>
            ))}
            {!isAuthenticated ? (
              <>
                <MenuItem onClick={handleLoginClick}>Login</MenuItem>
                <MenuItem onClick={handleRegisterClick}>Register</MenuItem>
              </>
            ) : (
              <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
