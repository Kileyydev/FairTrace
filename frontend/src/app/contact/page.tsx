// app/contact/page.tsx
"use client";

import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Divider,
  TextField,
  Button,
  Alert,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "@/app/components/FooterSection";

// === MINIMAL, ELEGANT THEME (same as About & Features) ===
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
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            bgcolor: "#fff",
            "& fieldset": { borderColor: "#1a3c34" },
            "&:hover fieldset": { borderColor: "#2f855a" },
          },
        },
      },
    },
  },
});

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      setStatus("error");
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    // Simulate send
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 800);
  };

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
                CONTACT US
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#555", fontStyle: "italic", fontSize: "1.1rem" }}
              >
                We’re here to help — farmers, partners, and consumers
              </Typography>
            </Box>

            <Divider sx={{ mb: 5 }} />

            {/* Contact Form */}
            <Box sx={{ maxWidth: 720, mx: "auto" }}>
              <Typography variant="body1" sx={{ mb: 4, color: "#333" }}>
                Whether you’re a farmer onboarding your harvest, a retailer verifying compliance, or a consumer with feedback — we’d to hear from you.
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ mb: 5 }}>
                <TextField
                  label="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ mb: 3 }}
                />
                <TextField
                  label="Your Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ mb: 3 }}
                />
                <TextField
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 3 }}
                />
                <TextField
                  label="Your Message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  multiline
                  rows={5}
                  fullWidth
                  required
                  sx={{ mb: 3 }}
                />

                {status === "success" && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Thank you! Your message has been sent. We’ll reply within 24 hours.
                  </Alert>
                )}
                {status === "error" && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errorMsg}
                  </Alert>
                )}

                <Box sx={{ textAlign: "center" }}>
                  <Button
                    type="submit"
                    sx={{
                      bgcolor: "#2f855a",
                      color: "#fff",
                      px: 5,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: 0,
                      "&:hover": { bgcolor: "#276a4a" },
                    }}
                  >
                    Send Message
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ my: 5 }} />

              {/* Contact Info */}
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#1a3c34", mb: 3 }}
                >
                  Other Ways to Reach Us
                </Typography>

                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Email:</strong>{" "}
                  <Typography
                    component="a"
                    href="mailto:support@fairtrace.com"
                    sx={{
                      color: "#2f855a",
                      textDecoration: "none",
                      fontWeight: 600,
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    support@fairtrace.com
                  </Typography>
                </Typography>

                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Phone:</strong> +254 700 123 456 (Mon–Fri, 9 AM–5 PM EAT)
                </Typography>

                <Typography variant="body1" sx={{ mb: 3 }}>
                  <strong>Address:</strong> FairTrace HQ, Westlands, Nairobi, Kenya
                </Typography>

                <Typography variant="body2" sx={{ color: "#555", fontStyle: "italic" }}>
                  For urgent farmer support, call our 24/7 hotline: <strong>+254 711 999 888</strong>
                </Typography>
              </Box>

              {/* Bottom Links */}
              <Box sx={{ mt: 6, textAlign: "center" }}>
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
                <Typography sx={{ mx: 1, display: "inline", color: "#ccc" }}>
                  •
                </Typography>
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
                  Terms
                </Typography>
                <Typography sx={{ mx: 1, display: "inline", color: "#ccc" }}>
                  •
                </Typography>
                <Typography
                  component="a"
                  href="/privacy"
                  sx={{
                    color: "#2f855a",
                    fontWeight: 600,
                    textDecoration: "none",
                    mx: 1,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Privacy
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