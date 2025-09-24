"use client";

import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { Package, Lock, Layout } from "lucide-react";
import { motion } from "framer-motion";

export default function InterfaceSection() {
  // Animation variants for text and features
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <Box
      sx={{
        py: { xs: 6, md: 8 },
        background: "linear-gradient(145deg, #ffffff 0%, #c9e2d3 100%)",
        color: "#1e3a2f",
        position: "relative",
        overflow: "hidden",
        minHeight: "auto",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Subtle Background Pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232f855a' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 0h60v60H0z'/%3E%3Cpath d='M30 30l15 15-15 15-15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.1fr 1fr" },
            gap: { xs: 3, md: 4 },
            alignItems: "center",
          }}
        >
          {/* Left: Text and Features */}
          <Box
            sx={{
              pr: { md: 4 },
              background: "rgba(255, 255, 255, 0.9)",
              p: { xs: 2, md: 4 },
              boxShadow: "0 6px 24px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(8px)",
            }}
          >
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
              <Typography
                variant="h2"
                fontWeight="800"
                sx={{
                  color: "#1e3a2f",
                  mb: 2,
                  fontSize: { xs: "2rem", md: "3rem" },
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  background: "linear-gradient(90deg, #1e3a2f 0%, #2f855a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                FairTrace Platform
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "#4a6b5e",
                  mb: 3,
                  lineHeight: 1.6,
                  fontSize: { xs: "0.95rem", md: "1.1rem" },
                  maxWidth: "550px",
                }}
              >
                Track products, verify transactions, and ensure transparency with our intuitive blockchain-powered interface.
              </Typography>
            </motion.div>

            {/* Feature Highlights */}
            {[
              {
                icon: <Package size={28} color="#2f855a" />,
                title: "Real-Time Tracking",
                description: "Monitor your product’s journey with instant blockchain updates.",
              },
              {
                icon: <Lock size={28} color="#2f855a" />,
                title: "Secure Verification",
                description: "Verify authenticity with tamper-proof blockchain records.",
              },
              {
                icon: <Layout size={28} color="#2f855a" />,
                title: "Intuitive Dashboard",
                description: "Manage your supply chain with a sleek, user-friendly interface.",
              },
            ].map(({ icon, title, description }, index) => (
              <motion.div
                key={index}
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: index * 0.15 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    mb: 2,
                    p: 1.5,
                    background: "rgba(255, 255, 255, 0.7)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  {icon}
                  <Box sx={{ ml: 1.5 }}>
                    <Typography
                      variant="h6"
                      fontWeight="700"
                      sx={{ color: "#1e3a2f", fontSize: "1.1rem" }}
                    >
                      {title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#4a6b5e", lineHeight: 1.5, fontSize: "0.9rem" }}
                    >
                      {description}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.45 }}
            >
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: { xs: "center", md: "flex-start" } }}>
                <Button
                  variant="contained"
                  size="medium"
                  sx={{
                    px: 3,
                    py: 1,
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    background: "linear-gradient(45deg, #2f855a 0%, #4caf50 100%)",
                    color: "#ffffff",
                    textTransform: "none",
                    "&:hover": {
                      background: "linear-gradient(45deg, #276749 0%, #388e3c 100%)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    },
                  }}
                >
                  Try the Demo
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  sx={{
                    px: 3,
                    py: 1,
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    borderColor: "#2f855a",
                    color: "#2f855a",
                    textTransform: "none",
                    background: "rgba(255, 255, 255, 0.5)",
                    "&:hover": {
                      background: "#2f855a",
                      color: "#ffffff",
                      borderColor: "#2f855a",
                    },
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </motion.div>
          </Box>

          {/* Right: Fixed Image */}
          <Box
            sx={{
              maxWidth: { xs: "100%", md: "90%" },
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            }}
          >
            <img
              src="/images/FairTrade.jpg"
              alt="FairTrace Web Interface"
              style={{
                width: "100%",
                height: "auto",
                objectFit: "cover",
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}