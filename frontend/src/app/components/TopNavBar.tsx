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
  Divider,
  Fade,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function TopNavBar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  const handleBlocksClick  = () => {
    router.push("/blocks");
    handleMenuClose();
  };


  const handleLogoutClick = () => {
    setIsAuthenticated(false);
    handleMenuClose();
  };

  // Elegant fade-up
  const fadeIn = {
    hidden: { opacity: 0, y: -12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "rgba(248, 250, 249, 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "2px solid #1a3c34",
          height: 68,
          justifyContent: "center",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: "0 4px 12px rgba(26, 60, 52, 0.08)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: "68px !important",
            height: 68,
            px: { xs: 2.5, md: 4 },
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Official Brand */}
          <Box
            onClick={() => navigateTo("Home")}
            sx={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                border: "3px double #1a3c34",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.65rem",
                fontWeight: 800,
                color: "#1a3c34",
                letterSpacing: "0.5px",
              }}
            >
              FT
            </Box>
            <Typography
              sx={{
                fontFamily: '"Georgia", "Times New Roman", serif',
                fontWeight: 800,
                fontSize: { xs: "1.35rem", md: "1.55rem" },
                letterSpacing: "-0.8px",
                color: "#1a3c34",
                userSelect: "none",
                background: "linear-gradient(90deg, #1a3c34 0%, #2f855a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              FairTrace
            </Typography>
            <Box
              sx={{
                fontSize: "0.55rem",
                fontWeight: 700,
                color: "#2f855a",
                letterSpacing: "1px",
                border: "1px solid #2f855a",
                px: 0.8,
                py: 0.2,
                borderRadius: "2px",
                ml: 0.5,
              }}
            >
              AUTHORITY
            </Box>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3, alignItems: "center" }}>
            {["Home", "About", "Contact", "Blocks"].map((item) => (
              <Button
                key={item}
                onClick={() => navigateTo(item)}
                sx={{
                  color: "#1a3c34",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  fontFamily: '"Georgia", serif',
                  textTransform: "none",
                  px: 2,
                  py: 1,
                  borderRadius: 0,
                  position: "relative",
                  "&:after": {
                    content: '""',
                    position: "absolute",
                    bottom: 4,
                    left: "50%",
                    width: 0,
                    height: "2px",
                    background: "#2f855a",
                    transition: "all 0.3s ease",
                    transform: "translateX(-50%)",
                  },
                  "&:hover:after": {
                    width: "70%",
                  },
                  "&:hover": {
                    background: "transparent",
                    color: "#2f855a",
                  },
                }}
              >
                {item}
              </Button>
            ))}

            <Divider orientation="vertical" flexItem sx={{ borderColor: "#1a3c34", opacity: 0.3 }} />

            {!isAuthenticated ? (
              <>
                <Button
                  onClick={handleLoginClick}
                  sx={{
                    color: "#1a3c34",
                    fontWeight: 600,
                    fontFamily: '"Georgia", serif',
                    fontSize: "0.9rem",
                    textTransform: "none",
                    px: 2.5,
                    py: 0.8,
                    border: "2px solid #1a3c34",
                    borderRadius: 0,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "#1a3c34",
                      color: "#f8faf9",
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  onClick={handleRegisterClick}
                  sx={{
                    background: "linear-gradient(45deg, #1a3c34 0%, #2f855a 100%)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontFamily: '"Georgia", serif',
                    fontSize: "0.9rem",
                    textTransform: "none",
                    px: 3,
                    py: 0.8,
                    borderRadius: 0,
                    boxShadow: "0 4px 12px rgba(26, 60, 52, 0.25)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "linear-gradient(45deg, #0d241d 0%, #276749 100%)",
                      boxShadow: "0 6px 16px rgba(26, 60, 52, 0.35)",
                      transform: "translateY(-1px)",
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
                  background: "#c62828",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontFamily: '"Georgia", serif',
                  fontSize: "0.9rem",
                  textTransform: "none",
                  px: 3,
                  py: 0.8,
                  borderRadius: 0,
                  boxShadow: "0 4px 12px rgba(198, 40, 40, 0.25)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "#9a0007",
                    boxShadow: "0 6px 16px rgba(198, 40, 40, 0.35)",
                  },
                }}
              >
                Logout
              </Button>
            )}
          </Box>

          {/* Mobile Menu - Now Feels Like Official Document */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton onClick={handleMenuOpen} size="medium">
              <MenuIcon sx={{ color: "#1a3c34", fontSize: "1.6rem" }} />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              TransitionComponent={Fade}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  background: "#ffffff",
                  border: "2px solid #1a3c34",
                  borderRadius: 0,
                  boxShadow: "0 12px 40px rgba(26, 60, 52, 0.18)",
                  minWidth: 220,
                  overflow: "visible",
                  "&:before": {
                    content: '""',
                    position: "absolute",
                    top: -12,
                    right: 14,
                    width: 20,
                    height: 20,
                    background: "#ffffff",
                    borderTop: "2px solid #1a3c34",
                    borderLeft: "2px solid #1a3c34",
                    transform: "rotate(45deg)",
                    zIndex: -1,
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1, borderBottom: "1px dashed #1a3c34" }}>
                <Typography
                  sx={{
                    fontFamily: '"Georgia", serif',
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "#1a3c34",
                    textAlign: "center",
                  }}
                >
                  FAIRTRACE MENU
                </Typography>
              </Box>

              {["Home", "About", "Contact", "Blocks"].map((item) => (
                <MenuItem
                  key={item}
                  onClick={() => navigateTo(item)}
                  sx={{
                    color: "#1a3c34",
                    fontWeight: 600,
                    fontFamily: '"Georgia", serif',
                    fontSize: "0.95rem",
                    py: 1.5,
                    px: 3,
                    borderBottom: "1px solid rgba(26, 60, 52, 0.1)",
                    "&:hover": {
                      background: "rgba(47, 133, 90, 0.08)",
                      color: "#2f855a",
                    },
                  }}
                >
                  {item}
                </MenuItem>
              ))}

              <Divider sx={{ my: 1, borderColor: "#1a3c34" }} />

              {!isAuthenticated ? (
                <>
                  <MenuItem
                    onClick={handleLoginClick}
                    sx={{
                      color: "#1a3c34",
                      fontWeight: 600,
                      fontFamily: '"Georgia", serif',
                      py: 1.5,
                      px: 3,
                      border: "2px solid #1a3c34",
                      my: 1,
                      mx: 2,
                      borderRadius: 0,
                      "&:hover": {
                        background: "#1a3c34",
                        color: "#f8faf9",
                      },
                    }}
                  >
                    Login
                  </MenuItem>
                  <MenuItem
                    onClick={handleRegisterClick}
                    sx={{
                      background: "linear-gradient(45deg, #1a3c34 0%, #2f855a 100%)",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontFamily: '"Georgia", serif',
                      py: 1.5,
                      px: 3,
                      mx: 2,
                      borderRadius: 0,
                      boxShadow: "0 4px 12px rgba(26, 60, 52, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #0d241d 0%, #276749 100%)",
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
                    background: "#c62828",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontFamily: '"Georgia", serif',
                    py: 1.5,
                    px: 3,
                    mx: 2,
                    borderRadius: 0,
                    "&:hover": {
                      background: "#9a0007",
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