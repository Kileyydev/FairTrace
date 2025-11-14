// app/terms/page.tsx
"use client";

import React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "@/app/components/FooterSection";

// === EXACT SAME THEME AS CERTIFICATE & HELP CENTER ===
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
    body1: { fontSize: "1rem", lineHeight: 1.8 },
    body2: { fontSize: "0.95rem", lineHeight: 1.7 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "2px solid #1a3c34",
          background: "#fff",
          boxShadow: "none",
          borderRadius: 0,
          padding: 4,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h6: { fontWeight: 600, color: "#1a3c34" },
      },
    },
  },
});

export default function TermsOfServicePage() {
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
          <Container maxWidth="md" sx={{ py: 3 }}>
            {/* Header Paper */}
            <Paper sx={{ p: 5, textAlign: "center", mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: "1.9rem",
                  fontWeight: 700,
                  color: "#1a3c34",
                  mb: 1,
                  letterSpacing: "0.05em",
                }}
              >
                TERMS OF SERVICE
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#555", fontStyle: "italic" }}
              >
                Last Updated: November 14, 2025
              </Typography>
            </Paper>

            {/* Main Content Paper */}
            <Paper sx={{ p: { xs: 3, md: 5 } }}>
              <Typography variant="body1" paragraph>
                Welcome to <strong>FairTrace</strong> ("we," "us," "our"). By accessing or using our platform, including our website, mobile applications, and blockchain verification services (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms").
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                1. Acceptance of Terms
              </Typography>
              <Typography variant="body2" paragraph>
                Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service. If you do not agree, you may not use the Service.
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                2. Description of Service
              </Typography>
              <Typography variant="body2" paragraph>
                FairTrace provides a blockchain-based platform for supply chain transparency, product traceability, and farmer support. We use Ethereum and zero-knowledge proofs (ZK-SNARKs) to verify product authenticity without exposing sensitive farmer data.
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                3. User Accounts
              </Typography>
              <Typography variant="body2" paragraph>
                Certain features require account creation. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You agree to notify us immediately of any unauthorized use.
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                4. Tipping & Transactions
              </Typography>
              <Typography variant="body2" paragraph>
                Consumers may send voluntary tips to farmers via pre-funded accounts. All transactions are final and non-refundable. FairTrace acts only as a technical facilitator and is not a party to any transaction.
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                5. Intellectual Property
              </Typography>
              <Typography variant="body2" paragraph>
                The Service and its original content, features, and functionality are and will remain the exclusive property of FairTrace and its licensors. The Service is protected by copyright, trademark, and other laws.
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                6. Prohibited Uses
              </Typography>
              <Typography variant="body2" paragraph>
                You may not use the Service to:
                <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                  <li>Violate any laws or regulations</li>
                  <li>Impersonate any person or entity</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Attempt to gain unauthorized access to any part of the Service</li>
                </ul>
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                7. Blockchain & Verification
              </Typography>
              <Typography variant="body2" paragraph>
                Certificate verification relies on blockchain data. While we strive for accuracy, we do not guarantee the correctness of third-party blockchain records. Use verification results at your own discretion.
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                8. Limitation of Liability
              </Typography>
              <Typography variant="body2" paragraph>
                To the fullest extent permitted by law, FairTrace shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                9. Governing Law
              </Typography>
              <Typography variant="body2" paragraph>
                These Terms shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                10. Changes to Terms
              </Typography>
              <Typography variant="body2" paragraph>
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Service constitutes acceptance of the updated Terms.
              </Typography>

              <Divider sx={{ my: 4, borderColor: "#1a3c34" }} />

              <Typography variant="body2" sx={{ textAlign: "center", fontStyle: "italic", color: "#555" }}>
                © {new Date().getFullYear()} FairTrace. All rights reserved.
              </Typography>

              <Box sx={{ mt: 4, textAlign: "center" }}>
                <Typography
                  component="a"
                  href="/privacy"
                  sx={{
                    color: "#2f855a",
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Privacy Policy
                </Typography>
                <Typography sx={{ mx: 2, display: "inline", color: "#ccc" }}>
                  •
                </Typography>
                <Typography
                  component="a"
                  href="/help-center"
                  sx={{
                    color: "#2f855a",
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Help Center
                </Typography>
              </Box>
            </Paper>
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