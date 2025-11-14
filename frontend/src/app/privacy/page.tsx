// app/privacy/page.tsx
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

// === EXACT SAME THEME AS ALL OTHER LEGAL PAGES ===
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

export default function PrivacyPolicyPage() {
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
                PRIVACY POLICY
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
                At <strong>FairTrace</strong> ("we," "us," "our"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, including our website, mobile applications, and blockchain services (collectively, the "Service").
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                1. Information We Collect
              </Typography>
              <Typography variant="body2" paragraph>
                We collect the following types of information:
                <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                  <li>
                    <strong>Personal Data:</strong> Name, email, phone number, and farmer identifiers (when you create an account or submit a tip).
                  </li>
                  <li>
                    <strong>Blockchain Data:</strong> Public wallet addresses, transaction hashes, and zero-knowledge proof signals (used for verification).
                  </li>
                  <li>
                    <strong>Usage Data:</strong> IP address, browser type, pages visited, and time spent on the Service.
                  </li>
                  <li>
                    <strong>Cookies:</strong> Small data files to improve user experience.
                  </li>
                </ul>
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                2. How We Use Your Information
              </Typography>
              <Typography variant="body2" paragraph>
                We use your information to:
                <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                  <li>Provide and maintain the Service</li>
                  <li>Verify product authenticity using blockchain</li>
                  <li>Facilitate farmer tips and payments</li>
                  <li>Improve user experience and platform security</li>
                  <li>Send important updates and respond to support requests</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                3. Zero-Knowledge Proofs (ZKPs)
              </Typography>
              <Typography variant="body2" paragraph>
                FairTrace uses <strong>ZK-SNARKs</strong> to verify compliance without revealing sensitive farmer data. Your personal information is never exposed on the blockchain. Only cryptographic proofs are stored publicly.
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                4. Data Sharing & Disclosure
              </Typography>
              <Typography variant="body2" paragraph>
                We do <strong>not</strong> sell your personal data. We may share information with:
                <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                  <li>Service providers (e.g., cloud hosting, analytics)</li>
                  <li>Law enforcement (if required by law)</li>
                  <li>Farmers (only tip amounts and anonymized sender info)</li>
                </ul>
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                5. Data Security
              </Typography>
              <Typography variant="body2" paragraph>
                We implement industry-standard encryption, secure APIs, and regular security audits. However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                6. Your Data Rights
              </Typography>
              <Typography variant="body2" paragraph>
                Under GDPR and the Kenyan Data Protection Act, you have the right to:
                <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion ("right to be forgotten")</li>
                  <li>Object to processing</li>
                  <li>Withdraw consent</li>
                </ul>
                Contact us at <strong>privacy@fairtrace.com</strong> to exercise these rights.
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                7. Children's Privacy
              </Typography>
              <Typography variant="body2" paragraph>
                Our Service is not intended for individuals under 18. We do not knowingly collect data from children.
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                8. Third-Party Links
              </Typography>
              <Typography variant="body2" paragraph>
                The Service may contain links to third-party websites. We are not responsible for their privacy practices. Review their policies before sharing information.
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                9. Changes to This Policy
              </Typography>
              <Typography variant="body2" paragraph>
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Your continued use of the Service constitutes acceptance.
              </Typography>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                10. Contact Us
              </Typography>
              <Typography variant="body2" paragraph>
                For privacy concerns, contact:
                <br />
                <strong>Email:</strong> privacy@fairtrace.com
                <br />
                <strong>Address:</strong> FairTrace HQ, Nairobi, Kenya
              </Typography>

              <Divider sx={{ my: 4, borderColor: "#1a3c34" }} />

              <Typography variant="body2" sx={{ textAlign: "center", fontStyle: "italic", color: "#555" }}>
                © {new Date().getFullYear()} FairTrace. Protecting your trust, one proof at a time.
              </Typography>

              <Box sx={{ mt: 4, textAlign: "center" }}>
                <Typography
                  component="a"
                  href="/terms"
                  sx={{
                    color: "#2f855a",
                    fontWeight: 600,
                    textDecoration: "none",
                    mx: 1,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Terms of Service
                </Typography>
                <Typography sx={{ mx: 1, display: "inline", color: "#ccc" }}>
                  •
                </Typography>
                <Typography
                  component="a"
                  href="/help-center"
                  sx={{
                    color: "#2f855a",
                    fontWeight: 600,
                    textDecoration: "none",
                    mx: 1,
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