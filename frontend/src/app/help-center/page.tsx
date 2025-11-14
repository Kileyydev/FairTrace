// app/help-center/page.tsx
"use client";

import React, { useState } from "react";
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Box,
  Divider,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Alert,
  Stack,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "@/app/components/FooterSection";

// === MATCHING THEME FROM CERTIFICATE PAGE ===
const theme = createTheme({
  palette: {
    primary: { main: "#1a3c34" },
    secondary: { main: "#2f855a" },
    background: { default: "#f8faf9" },
    error: { main: "#c62828" },
  },
  typography: {
    fontFamily: '"Georgia", "Times New Roman", serif',
    h3: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    body1: { fontSize: "1rem", lineHeight: 1.7 },
    subtitle1: { fontSize: "1.1rem", fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "2px solid #1a3c34",
          background: "#fff",
          boxShadow: "none",
          borderRadius: 0,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 0,
          padding: "10px 20px",
          minHeight: "44px",
          "&:hover": { backgroundColor: "inherit" },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          border: "1px solid #1a3c34",
          borderRadius: 0,
          "&:before": { display: "none" },
          marginBottom: "16px !important",
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: "#f8faf9",
          borderBottom: "1px solid #1a3c34",
          minHeight: 56,
          "&.Mui-expanded": { minHeight: 56 },
        },
        content: { margin: "12px 0" },
      },
    },
  },
});

// === FAQ DATA ===
const faqs = [
  {
    question: "What is FairTrace?",
    answer:
      "FairTrace is a blockchain-powered platform ensuring transparency and fairness in agricultural supply chains. We verify product origins, ethical practices, and compliance using zero-knowledge proofs.",
  },
  {
    question: "How do I verify a product certificate?",
    answer:
      "Enter the Product ID or scan the QR code on the Trace page. Our system validates authenticity via Ethereum blockchain and ZKP verification.",
  },
  {
    question: "What blockchain do you use?",
    answer:
      "We use Ethereum with zero-knowledge proofs (ZK-SNARKs) for privacy-preserving verification. All certificates are immutable and publicly verifiable.",
  },
  {
    question: "Can I tip the farmer directly?",
    answer:
      "Yes! On valid certificates, log in with a pre-funded consumer account and send tips directly to the farmer’s wallet.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. Farmer identities are protected via ZKPs. Personal data is encrypted, and we comply with GDPR and Kenyan Data Protection Act.",
  },
  {
    question: "Who can I contact for support?",
    answer:
      "Use the form below or email support@fairtrace.com. Our team responds within 24 hours.",
  },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setStatus("error");
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    // Simulate send
    setTimeout(() => {
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
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
          <Container maxWidth="md" sx={{ py: 3 }}>
            {/* Header */}
            <Paper sx={{ p: 4, textAlign: "center", mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "#1a3c34",
                  mb: 1,
                }}
              >
                FAIRTRACE HELP CENTER
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#333", maxWidth: 600, mx: "auto" }}
              >
                Find answers to common questions or reach out to our support team.
              </Typography>
            </Paper>

            {/* Search Bar */}
            <Paper sx={{ p: 2, mb: 4 }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: "#1a3c34", mr: 1 }} />,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#f8faf9",
                      "& fieldset": { borderColor: "#1a3c34" },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#2f855a",
                    color: "#fff",
                    px: 3,
                    "&:hover": { bgcolor: "#276a4a" },
                  }}
                >
                  Search
                </Button>
              </Box>
            </Paper>

            {/* FAQs */}
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "#1a3c34", mb: 2 }}
            >
              Frequently Asked Questions
            </Typography>

            <Box sx={{ mb: 5 }}>
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => (
                  <Accordion key={idx}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontWeight: 600, color: "#1a3c34" }}>
                        {faq.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography sx={{ color: "#333", lineHeight: 1.7 }}>
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Paper sx={{ p: 3, textAlign: "center", color: "#c62828" }}>
                  <Typography>No results found for "{searchQuery}"</Typography>
                </Paper>
              )}
            </Box>

            <Divider sx={{ my: 5, borderColor: "#1a3c34" }} />

            {/* Contact Form */}
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "#1a3c34", mb: 2 }}
            >
              Still Need Help?
            </Typography>

            <Paper sx={{ p: 4 }}>
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    label="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Your Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    required
                  />
                  <FormControl fullWidth>
                    <InputLabel>Subject</InputLabel>
                    <Select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    >
                      <MenuItem value="general">General Inquiry</MenuItem>
                      <MenuItem value="verification">Certificate Verification</MenuItem>
                      <MenuItem value="tipping">Tipping Issues</MenuItem>
                      <MenuItem value="account">Account Help</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Message"
                    multiline
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    fullWidth
                    required
                  />

                  {status === "success" && (
                    <Alert severity="success">
                      Thank you! Your message has been sent. We'll reply within 24 hours.
                    </Alert>
                  )}
                  {status === "error" && (
                    <Alert severity="error">{errorMsg}</Alert>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: "#2f855a",
                      color: "#fff",
                      fontWeight: 600,
                      "&:hover": { bgcolor: "#276a4a" },
                    }}
                  >
                    Send Message
                  </Button>
                </Stack>
              </Box>
            </Paper>

            {/* Bottom Links */}
            <Box sx={{ mt: 5, textAlign: "center" }}>
              {[
                { text: "Terms of Service", href: "/terms" },
                { text: "Privacy Policy", href: "/privacy" },
                { text: "About FairTrace", href: "/about" },
              ].map(({ text, href }) => (
                <Button
                  key={text}
                  href={href}
                  component="a"
                  sx={{
                    mx: 1,
                    color: "#1a3c34",
                    textDecoration: "none",
                    fontWeight: 600,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {text}
                </Button>
              ))}
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