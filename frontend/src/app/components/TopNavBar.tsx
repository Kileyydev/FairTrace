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
import { motion } from "framer-motion";

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

  const navigateTo = (path: string) => {
    router.push(path);
    handleMenuClose();
  };

  const handleRegisterClick = () => {
    router.push("/register");
  };

  const handleLoginClick = () => {
    router.push("/login");
  };

  const handleLogoutClick = () => {
    setIsAuthenticated(false);
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      <AppBar
        position="fixed"
        sx={{
          background: "linear-gradient(90deg, rgba(30, 58, 47, 0.95) 0%, rgba(47, 133, 90, 0.95) 100%)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          py: 0.5,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: { xs: 56, md: 64 },
          }}
        >
          {/* Logo / Brand Name */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: "800",
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              letterSpacing: "-0.02em",
              cursor: "pointer",
              background: "linear-gradient(90deg, #e0f2e9 0%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            onClick={() => navigateTo("/")}
          >
            FairTrace
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1.5, alignItems: "center" }}>
            {["Home", "About", "Features", "Contact"].map((item) => (
              <Button
                key={item}
                color="inherit"
                onClick={() => navigateTo(`/${item.toLowerCase()}`)}
                sx={{
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  textTransform: "none",
                  color: "#e0f2e9",
                  px: 2,
                  py: 0.5,

                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                  },
                }}
              >
                {item}
              </Button>
            ))}
            {!isAuthenticated ? (
              <>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleLoginClick}
                  sx={{
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    textTransform: "none",
                    borderColor: "#e0f2e9",
                    color: "#e0f2e9",
                    px: 2,
                    py: 0.5,

                    background: "rgba(255, 255, 255, 0.05)",
                    "&:hover": {
                      background: "#2f855a",
                      color: "#ffffff",
                      borderColor: "#2f855a",
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={handleRegisterClick}
                  sx={{
                    fontWeight: "700",
                    fontSize: "0.9rem",
                    textTransform: "none",
                    background: "linear-gradient(45deg, #2f855a 0%, #4caf50 100%)",
                    color: "#ffffff",
                    px: 2.5,
                    py: 0.5,
                    "&:hover": {
                      background: "linear-gradient(45deg, #276749 0%, #388e3c 100%)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    },
                  }}
                >
                  Register
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={handleLogoutClick}
                sx={{
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  textTransform: "none",
                  background: "linear-gradient(45deg, #d32f2f 0%, #b71c1c 100%)",
                  color: "#ffffff",
                  px: 2.5,
                  py: 0.5,
                  "&:hover": {
                    background: "linear-gradient(45deg, #b71c1c 0%, #9a0007 100%)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                Logout
              </Button>
            )}
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <MenuIcon sx={{ color: "#e0f2e9" }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  background: "linear-gradient(145deg, #1e3a2f 0%, #2f855a 100%)",
                  color: "#e0f2e9",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                  mt: 1,
                },
              }}
            >
              {["Home", "About", "Features", "Contact"].map((item) => (
                <MenuItem
                  key={item}
                  onClick={() => navigateTo(`/${item.toLowerCase()}`)}
                  sx={{
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    py: 1,
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  {item}
                </MenuItem>
              ))}
              {!isAuthenticated ? (
                <>
                  <MenuItem
                    onClick={handleLoginClick}
                    sx={{
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      py: 1,
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Login
                  </MenuItem>
                  <MenuItem
                    onClick={handleRegisterClick}
                    sx={{
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      py: 1,
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Register
                  </MenuItem>
                </>
              ) : (
                <MenuItem
                  onClick={handleLogoutClick}
                  sx={{
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    py: 1,
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  Logout
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </motion.div>
  );
}