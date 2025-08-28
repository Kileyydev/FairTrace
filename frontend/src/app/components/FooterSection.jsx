"use client";

import React from "react";
import { Box, Container, Typography, Link, IconButton, Divider, TextField, Button } from "@mui/material";
import { Facebook, Twitter, LinkedIn, Instagram } from "@mui/icons-material";

export default function Footer() {
  return (
    <Box sx={{ bgcolor: "#1a3c34", color: "#d4e4d9", py: 1.2 }}>
      <Container maxWidth="lg">
        {/* Branding/Logo Placeholder */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h30"
            fontWeight="600"
            sx={{ color: "#d4e4d9", letterSpacing: "0.02em" }}
          >
            FairTrace
          </Typography>
          <Typography variant="body2" sx={{ color: "#d4e4d9", opacity: 0.7 }}>
            Transparency in Every Harvest
          </Typography>
        </Box>

        {/* Links and Social Icons */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "3fr 1fr" },
            gap: 2,
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            {["Home", "About", "Features", "Contact", "FAQ", "Blog"].map((text) => (
              <Link
                key={text}
                href={`#${text.toLowerCase()}`}
                underline="none"
                sx={{
                  color: "#d4e4d9",
                  fontWeight: 500,
                  transition: "opacity 0.3s ease",
                  "&:hover": { opacity: 0.7 },
                }}
              >
                {text}
              </Link>
            ))}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", sm: "flex-end" },
              gap: 1,
            }}
          >
            {[
              { icon: <Facebook />, label: "Facebook" },
              { icon: <Twitter />, label: "Twitter" },
              { icon: <LinkedIn />, label: "LinkedIn" },
              { icon: <Instagram />, label: "Instagram" },
            ].map(({ icon, label }) => (
              <IconButton
                key={label}
                aria-label={label}
                sx={{
                  color: "#d4e4d9",
                  "&:hover": { color: "#2f855a", transform: "scale(1.1)" },
                  transition: "color 0.3s ease, transform 0.3s ease",
                }}
              >
                {icon}
              </IconButton>
            ))}
          </Box>
        </Box>

        {/* Divider */}
        <Divider sx={{ bgcolor: "#d4e4d9", opacity: 0.3, my: 2 }} />

        {/* Newsletter Signup */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            mb: 3,
          }}
        >
          <Typography variant="body1" fontWeight="600" sx={{ color: "#d4e4d9" }}>
            Subscribe to Our Newsletter
          </Typography>
          <TextField
            variant="outlined"
            placeholder="Enter your email"
            size="small"
            sx={{
              bgcolor: "#ffffff",
              borderRadius: "8px",
              width: { xs: "100%", sm: "200px" },
              input: { color: "#1a3c34" },
              fieldset: { borderColor: "#d4e4d9" },
              "&:hover fieldset": { borderColor: "#2f855a" },
            }}
          />
          <Button
            variant="contained"
            sx={{
              bgcolor: "#2f855a",
              color: "#ffffff",
              borderRadius: "8px",
              px: 3,
              py: 1,
              fontWeight: "600",
              "&:hover": {
                bgcolor: "#276749",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            Subscribe
          </Button>
        </Box>

        {/* Copyright */}
        <Typography variant="body2" align="center" sx={{ color: "#d4e4d9", opacity: 0.7 }}>
          © {new Date().getFullYear()} FairTrace. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}