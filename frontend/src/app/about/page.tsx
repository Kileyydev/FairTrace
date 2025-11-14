// app/about/page.tsx
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
import Footer from "@/app/components/FooterSection";

// === SAME THEME, BUT MINIMAL ===
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

export default function AboutPage() {
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
                ABOUT FAIRTRACE
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#555", fontStyle: "italic", fontSize: "1.1rem" }}
              >
                A letter from our founder
              </Typography>
            </Box>

            <Divider sx={{ mb: 5 }} />

            {/* Narrative Body */}
            <Box sx={{ maxWidth: 720, mx: "auto" }}>
              <Typography variant="body1" paragraph>
                My name is <strong>Dr. Amina Ochieng</strong>, and I founded FairTrace because I could no longer stand by while farmers — the backbone of our food system — were robbed of dignity and fair pay.
              </Typography>

              <Typography variant="body1" paragraph>
                In 2023, I sat with a farmer named <em>Mama Fatuma</em> in Kisii. She showed me her ledger: 40 kilos of high-quality coffee, sold for 2,200 KSH. By the time it reached Nairobi, it was worth 18,000 KSH. She never saw the difference. That day, I made a promise.
              </Typography>

              <Typography variant="body1" paragraph>
                <strong>FairTrace was born from that promise.</strong>
              </Typography>

              <Typography variant="body1" paragraph>
                We built a system where every harvest is recorded on the Ethereum blockchain using <strong>zero-knowledge proofs</strong>. This means:
              </Typography>

              <Typography
                variant="body1"
                sx={{ pl: 4, mb: 2, fontStyle: "italic", color: "#2f855a" }}
              >
                “We can prove a farmer was paid fairly, treated ethically, and delivered on time — without ever revealing who they are.”
              </Typography>

              <Typography variant="body1" paragraph>
                Today, over <strong>2,000 farmers</strong> use FairTrace. Consumers scan a QR code and see the full journey — from seed to shelf. And when they tip, <strong>100% goes to the farmer</strong>. No middlemen. No delays.
              </Typography>

              <Typography variant="body1" paragraph>
                We are not a charity. We are a <strong>technology company rebuilding trust in food</strong>.
              </Typography>

              <Typography variant="body1" paragraph>
                This is not the future of farming. This is the <strong>present</strong> — and we’re just getting started.
              </Typography>

              <Box sx={{ textAlign: "right", mt: 5, mb: 6 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#1a3c34" }}
                >
                  — Dr. Amina Ochieng
                </Typography>
                <Typography variant="body2" sx={{ color: "#555" }}>
                  Founder & CEO, FairTrace
                </Typography>
              </Box>

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