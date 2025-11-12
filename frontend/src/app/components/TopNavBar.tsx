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
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Replace with real auth
  const router = useRouter();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navigateTo = (item: string) => {
    const path = item === "Home" ? "/" : `/${item.toLowerCase()}`;
    router.push(path);
    handleMenuClose();
  };

  const handleRegisterClick = () => {
    router.push("/register");
    handleMenuClose();
  };

  const handleLoginClick = () => {
    router.push("/login");
    handleMenuClose();
  };

  const handleLogoutClick = () => {
    setIsAuthenticated(false);
    handleMenuClose();
  };

  // Subtle fade-in
  const fadeIn = {
    hidden: { opacity: 0, y: -8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "rgba(20, 35, 28, 0.72)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          height: 56,
          justifyContent: "center",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            minHeight: "56px !important",
            height: 56,
            px: { xs: 2, md: 3 },
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Brand */}
          <Typography
            variant="h6"
            onClick={() => navigateTo("Home")}
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.15rem", md: "1.35rem" },
              letterSpacing: "-0.5px",
              cursor: "pointer",
              background: "linear-gradient(90deg, #c8e6d3 0%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              userSelect: "none",
            }}
          >
            FairTrace
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, alignItems: "center" }}>
            {["Home", "About", "Contact"].map((item) => (
              <Button
                key={item}
                onClick={() => navigateTo(item)}
                sx={{
                  color: "#e0f2e9",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  textTransform: "none",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 0,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.12)",
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
                  onClick={handleLoginClick}
                  sx={{
                    color: "#e0f2e9",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textTransform: "none",
                    px: 2,
                    py: 0.5,
                    border: "1px solid rgba(224, 242, 233, 0.4)",
                    borderRadius: 0,
                    background: "rgba(255, 255, 255, 0.06)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "rgba(47, 133, 90, 0.3)",
                      borderColor: "#2f855a",
                      color: "#ffffff",
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  onClick={handleRegisterClick}
                  sx={{
                    background: "linear-gradient(45deg, #2f855a 0%, #4caf50 100%)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textTransform: "none",
                    px: 2.5,
                    py: 0.5,
                    borderRadius: 0,
                    boxShadow: "0 2px 8px rgba(47, 133, 90, 0.3)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "linear-gradient(45deg, #276749 0%, #388e3c 100%)",
                      boxShadow: "0 4px 12px rgba(47, 133, 90, 0.4)",
                    },
                  }}
                >
                  Register
                </Button>
              </>
            ) : (
              <Button
                onClick={handleLogoutClick}
                sx={{
                  background: "linear-gradient(45deg, #d32f2f 0%, #c62828 100%)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  textTransform: "none",
                  px: 2.5,
                  py: 0.5,
                  borderRadius: 0,
                  boxShadow: "0 2px 8px rgba(211, 47, 47, 0.3)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    background: "linear-gradient(45deg, #b71c1c 0%, #9a0007 100%)",
                    boxShadow: "0 4px 12px rgba(183, 28, 28, 0.4)",
                  },
                }}
              >
                Logout
              </Button>
            )}
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton onClick={handleMenuOpen} size="small">
              <MenuIcon sx={{ color: "#e0f2e9", fontSize: "1.4rem" }} />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  mt: 1,
                  background: "rgba(20, 35, 28, 0.85)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: 0,
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.24)",
                  minWidth: 180,
                },
              }}
            >
              {["Home", "About", "Contact"].map((item) => (
                <MenuItem
                  key={item}
                  onClick={() => navigateTo(item)}
                  sx={{
                    color: "#e0f2e9",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    py: 1.25,
                    px: 2,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    "&:last-child": { borderBottom: "none" },
                    "&:hover": {
                      background: "rgba(47, 133, 90, 0.2)",
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
                      color: "#e0f2e9",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      py: 1.25,
                      px: 2,
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      "&:hover": { background: "rgba(47, 133, 90, 0.2)" },
                    }}
                  >
                    Login
                  </MenuItem>
                  <MenuItem
                    onClick={handleRegisterClick}
                    sx={{
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      py: 1.25,
                      px: 2,
                      background: "linear-gradient(45deg, #2f855a 0%, #4caf50 100%)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #276749 0%, #388e3c 100%)",
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
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    py: 1.25,
                    px: 2,
                    background: "linear-gradient(45deg, #d32f2f 0%, #c62828 100%)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #b71c1c 0%, #9a0007 100%)",
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