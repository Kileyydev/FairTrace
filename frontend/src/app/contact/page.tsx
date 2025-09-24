"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  ThemeProvider,
  createTheme,
  CssBaseline,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import TopNavBar from "../components/TopNavBar";
import Footer from "../components/FooterSection";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const theme = createTheme({
  palette: {
    primary: { main: "#2f855a", contrastText: "#ffffff" },
    secondary: { main: "#1a3c34" },
    background: { default: "#f1f7f3" },
  },
  typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
});

export default function Contact() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setFormError(null);

    const { name, email, subject, message } = formData;
    if (!name || !email || !subject || !message) {
      setFormError("All fields are required.");
      setFormStatus("error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email address.");
      setFormStatus("error");
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("Environment variable NEXT_PUBLIC_API_URL is not defined");
      }
      const url = apiUrl + "/contact/";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to submit contact form");
      setFormStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setFormError(err instanceof Error ? err.message : "Failed to submit form. Please try again.");
      setFormStatus("error");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: "linear-gradient(145deg, #f1f7f3 0%, #c9e2d3 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <TopNavBar sx={{ zIndex: 1300, position: "fixed", top: 0, width: "100%" }} />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232f855a' fill-opacity='0.3' fill-rule='evenodd'%3E%3Cpath d='M0 0h60v60H0z'/%3E%3Cpath d='M30 30l15 15-15 15-15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />
        <Container
          maxWidth="sm"
          sx={{
            flex: 1,
            py: { xs: 3, md: 4 },
            px: { xs: 2, md: 3 },
            mt: { xs: "56px", md: "64px" },
            minHeight: "calc(100vh - 56px - 80px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Typography
              variant="h4"
              fontWeight="800"
              sx={{
                color: "#1e3a2f",
                mb: 2,
                fontSize: { xs: "1.6rem", md: "2rem" },
                background: "linear-gradient(90deg, #1e3a2f 0%, #2f855a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textAlign: "center",
              }}
            >
              Contact FairTrace
            </Typography>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(8px)",
                border: "1px solid #c4d8c9",
                mb: 2,
                p: 1.5,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  fontWeight="600"
                  sx={{
                    color: "#1e3a2f",
                    mb: 1,
                    fontSize: { xs: "1.2rem", md: "1.4rem" },
                  }}
                >
                  Get in Touch
                </Typography>
                <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem", mb: 1.5 }}>
                  Have questions or need support? Fill out the form below, and our team will respond promptly.
                </Typography>
                <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <TextField
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    disabled={formStatus === "submitting"}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.7)",
                        "& fieldset": { borderColor: "#c4d8c9" },
                        "&:hover fieldset": { borderColor: "#2f855a" },
                        "&.Mui-focused fieldset": { borderColor: "#276749" },
                      },
                      "& .MuiInputLabel-root": { color: "#4a6b5e", fontSize: "0.85rem" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#276749" },
                      "& .MuiInputBase-input": { fontSize: "0.85rem" },
                    }}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    disabled={formStatus === "submitting"}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.7)",
                        "& fieldset": { borderColor: "#c4d8c9" },
                        "&:hover fieldset": { borderColor: "#2f855a" },
                        "&.Mui-focused fieldset": { borderColor: "#276749" },
                      },
                      "& .MuiInputLabel-root": { color: "#4a6b5e", fontSize: "0.85rem" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#276749" },
                      "& .MuiInputBase-input": { fontSize: "0.85rem" },
                    }}
                  />
                  <TextField
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    disabled={formStatus === "submitting"}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.7)",
                        "& fieldset": { borderColor: "#c4d8c9" },
                        "&:hover fieldset": { borderColor: "#2f855a" },
                        "&.Mui-focused fieldset": { borderColor: "#276749" },
                      },
                      "& .MuiInputLabel-root": { color: "#4a6b5e", fontSize: "0.85rem" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#276749" },
                      "& .MuiInputBase-input": { fontSize: "0.85rem" },
                    }}
                  />
                  <TextField
                    label="Message"
                    name="message"
                    multiline
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    disabled={formStatus === "submitting"}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.7)",
                        "& fieldset": { borderColor: "#c4d8c9" },
                        "&:hover fieldset": { borderColor: "#2f855a" },
                        "&.Mui-focused fieldset": { borderColor: "#276749" },
                      },
                      "& .MuiInputLabel-root": { color: "#4a6b5e", fontSize: "0.85rem" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#276749" },
                      "& .MuiInputBase-input": { fontSize: "0.85rem" },
                    }}
                  />
                  {formError && (
                    <Typography sx={{ color: "#d32f2f", fontSize: "0.8rem", mt: 0.5 }}>
                      {formError}
                    </Typography>
                  )}
                  {formStatus === "success" && (
                    <Typography sx={{ color: "#2f855a", fontSize: "0.8rem", mt: 0.5 }}>
                      Thank you! Your message has been sent successfully.
                    </Typography>
                  )}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={formStatus === "submitting"}
                      sx={{
                        mt: 1,
                        background: "linear-gradient(45deg, #2f855a 0%, #4caf50 100%)",
                        color: "#ffffff",
                        borderRadius: 2,
                        fontWeight: "600",
                        textTransform: "none",
                        fontSize: "0.9rem",
                        "&:hover": {
                          background: "linear-gradient(45deg, #276749 0%, #388e3c 100%)",
                        },
                        "&:disabled": { background: "#b0bec5", color: "#ffffff" },
                      }}
                    >
                      {formStatus === "submitting" ? "Submitting..." : "Send Message"}
                    </Button>
                  </motion.div>
                </Box>
              </CardContent>
            </Card>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(8px)",
                border: "1px solid #c4d8c9",
                p: 1.5,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  fontWeight="600"
                  sx={{
                    color: "#1e3a2f",
                    mb: 1,
                    fontSize: { xs: "1.2rem", md: "1.4rem" },
                  }}
                >
                  Contact Information
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <EmailIcon sx={{ color: "#2f855a", fontSize: "1.2rem" }} />
                      <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem" }}>
                        Email: support@fairtrace.com
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <PhoneIcon sx={{ color: "#2f855a", fontSize: "1.2rem" }} />
                      <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem" }}>
                        Phone: +1 (555) 123-4567
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <LocationOnIcon sx={{ color: "#2f855a", fontSize: "1.2rem" }} />
                      <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem" }}>
                        Address: 123 Green Fields, AgriCity, AC 12345
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
        <Footer sx={{ position: "relative", zIndex: 1300, mt: "auto" }} />
      </Box>
    </ThemeProvider>
  );
}
