// app/features/page.tsx
"use client";

import React from "react";
import {
  Container,
  Typography,
  Box,
  Divider,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "@/app/components/TopNavBar";

// === MINIMAL, ELEGANT THEME ===
const theme = createTheme({
  palette: {
    primary: { main: "#1a3c34" },
    secondary: { main: "#2f855a" },
    background: { default: "#f8faf9" },
  },
  typography: {
    fontFamily: '"Georgia", "Times New Roman", serif',
    h3: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    body1: { fontSize: "1.1rem", lineHeight: 1.9 },
    body2: { fontSize: "1rem", lineHeight: 1.8 },
  },
  components: {
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#1a3c34",
          opacity: 0.3,
        },
      },
    },
  },
});

export default function FeaturesPage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: "#f8faf9",
        }}
      >
        {/* Fixed Top Navbar */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1300,
            bgcolor: "#fff",
            borderBottom: "1px solid #1a3c34",
          }}
        >
          <TopNavBar />
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, pt: "70px", pb: 6 }}>
          <Container maxWidth="md" sx={{ py: 5 }}>
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: "2.3rem",
                  fontWeight: 700,
                  color: "#1a3c34",
                  mb: 2,
                  letterSpacing: "0.08em",
                }}
              >
                FEATURES
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#555", fontStyle: "italic", fontSize: "1.1rem" }}
              >
                How FairTrace works — from farm to fork
              </Typography>
            </Box>

            <Divider sx={{ mb: 5 }} />

            {/* Features List */}
            <Box sx={{ maxWidth: 720, mx: "auto" }}>
              {/* 1 */}
              <Box sx={{ mb: 5 }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#1a3c34",
                    fontWeight: 700,
                    mb: 1,
                    position: "relative",
                    pl: 4,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 8,
                      height: 8,
                      bgcolor: "#2f855a",
                      borderRadius: "50%",
                    }}
                  />
                  Blockchain Verification
                </Typography>
                <Typography variant="body1" sx={{ pl: 4, color: "#333" }}>
                  Every product is recorded on Ethereum. Scan the QR code or enter the Product ID to verify authenticity instantly. The blockchain never lies.
                </Typography>
              </Box>

              {/* 2 */}
              <Box sx={{ mb: 5 }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#1a3c34",
                    fontWeight: 700,
                    mb: 1,
                    position: "relative",
                    pl: 4,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 8,
                      height: 8,
                      bgcolor: "#2f855a",
                      borderRadius: "50%",
                    }}
                  />
                  Zero-Knowledge Privacy
                </Typography>
                <Typography variant="body1" sx={{ pl: 4, color: "#333" }}>
                  We prove fair pay, ethical labor, and timely delivery — without revealing farmer names, locations, or yields. Only cryptographic proofs are public.
                </Typography>
              </Box>

              {/* 3 */}
              <Box sx={{ mb: 5 }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#1a3c34",
                    fontWeight: 700,
                    mb: 1,
                    position: "relative",
                    pl: 4,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 8,
                      height: 8,
                      bgcolor: "#2f855a",
                      borderRadius: "50%",
                    }}
                  />
                  Direct Farmer Tipping
                </Typography>
                <Typography variant="body1" sx={{ pl: 4, color: "#333" }}>
                  Consumers can send tips directly to farmers using pre-funded accounts. 100% of the tip goes to the farmer — no fees, no delays.
                </Typography>
              </Box>

              {/* 4 */}
              <Box sx={{ mb: 5 }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#1a3c34",
                    fontWeight: 700,
                    mb: 1,
                    position: "relative",
                    pl: 4,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 8,
                      height: 8,
                      bgcolor: "#2f855a",
                      borderRadius: "50%",
                    }}
                  />
                  End-to-End Traceability
                </Typography>
                <Typography variant="body1" sx={{ pl: 4, color: "#333" }}>
                  Track every step: farm → transporter → processor → retailer. All movements are timestamped, geolocated, and stored on-chain.
                </Typography>
              </Box>

              {/* 5 */}
              <Box sx={{ mb: 5 }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#1a3c34",
                    fontWeight: 700,
                    mb: 1,
                    position: "relative",
                    pl: 4,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 8,
                      height: 8,
                      bgcolor: "#2f855a",
                      borderRadius: "50%",
                    }}
                  />
                  Official Certificates
                </Typography>
                <Typography variant="body1" sx={{ pl: 4, color: "#333" }}>
                  Download or print cryptographically signed certificates. Includes transaction hash, proof, and verification status — perfect for audits.
                </Typography>
              </Box>

              {/* 6 */}
              <Box sx={{ mb: 6 }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#1a3c34",
                    fontWeight: 700,
                    mb: 1,
                    position: "relative",
                    pl: 4,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 8,
                      height: 8,
                      bgcolor: "#2f855a",
                      borderRadius: "50%",
                    }}
                  />
                  FairTrade Compliance
                </Typography>
                <Typography variant="body1" sx={{ pl: 4, color: "#333" }}>
                  Smart contracts enforce fair pricing, labor standards, and payment timelines. Non-compliant products are flagged immediately.
                </Typography>
              </Box>

              <Divider sx={{ my: 5 }} />
            </Box>
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{ borderTop: "1px solid #1a3c34", bgcolor: "#fff" }}>
          <Footer />
        </Box>
      </Box>
    </ThemeProvider>
  );
}