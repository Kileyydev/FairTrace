"use client";

import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { Package, Lock, Layout } from "lucide-react";

export default function InterfaceSection() {
  return (
    <Box
      sx={{
        py: 10,
        background: "#e6f0e9",
        color: "#1a3c34",
        position: "relative",
        overflow: "hidden",
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
          opacity: 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232f855a' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Cpath d='M20 20l10 10-10 10-10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      <Container maxWidth="lg">
        <Typography
          variant="h3"
          fontWeight="600"
          textAlign="center"
          gutterBottom
          sx={{ color: "#1a3c34", mb: 2 }}
        >
          Explore the FairTrace Platform
        </Typography>
        <Typography
          variant="h6"
          textAlign="center"
          sx={{ color: "#4a6b5e", mb: 6, lineHeight: 1.6, maxWidth: "600px", mx: "auto" }}
        >
          Our intuitive web interface makes it easy to track products, verify transactions, and ensure transparency across the supply chain.
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: 4,
          }}
        >
          {/* Image for Interface Mockup */}
          <Box
            sx={{
              flex: 1,
            
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            <img
              src="/images/OIP.webp"
              alt="FairTrace Web Interface"
              style={{ width: "100%", height: "auto" }}
            />
          </Box>

          {/* Feature Highlights */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Package size={32} color="#2f855a" />
              <Typography
                variant="h6"
                fontWeight="600"
                sx={{ color: "#1a3c34", ml: 2 }}
              >
                Real-Time Tracking
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "#4a6b5e", mb: 4, lineHeight: 1.6 }}
            >
              Monitor every step of your product’s journey with real-time updates powered by blockchain.
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Lock size={32} color="#2f855a" />
              <Typography
                variant="h6"
                fontWeight="600"
                sx={{ color: "#1a3c34", ml: 2 }}
              >
                Secure Verification
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "#4a6b5e", mb: 4, lineHeight: 1.6 }}
            >
              Access tamper-proof records to verify authenticity and ensure trust.
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Layout size={32} color="#2f855a" />
              <Typography
                variant="h6"
                fontWeight="600"
                sx={{ color: "#1a3c34", ml: 2 }}
              >
                User-Friendly Dashboard
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "#4a6b5e", mb: 4, lineHeight: 1.6 }}
            >
              Manage all your supply chain data with an intuitive, customizable dashboard.
            </Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.2,
                  fontSize: "1rem",
                  fontWeight: "600",
                  background: "#2f855a",
                  color: "#ffffff",
               
                  "&:hover": {
                    background: "#276749",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                Try the Demo
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 1.2,
                  fontSize: "1rem",
                  fontWeight: "600",
                  borderColor: "#2f855a",
                  color: "#2f855a",
               
                  "&:hover": {
                    background: "#2f855a",
                    color: "#ffffff",
                    borderColor: "#276749",
                  },
                }}
              >
                Learn More
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}