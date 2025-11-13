"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress, TextField, Container, ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { motion } from "framer-motion";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "@/app/components/FooterSection";

const theme = createTheme({
  palette: {
    primary: { main: "#2f855a", contrastText: "#ffffff" },
    secondary: { main: "#1a3a2f" },
    background: { default: "#f1f7f3" },
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
    h3: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    body1: { fontWeight: 400 },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.7)",
            "& fieldset": { borderColor: "#c4d8c9" },
            "&:hover fieldset": { borderColor: "#2f855a" },
            "&.Mui-focused fieldset": {
              borderColor: "linear-gradient(45deg, #2f855a 0%, #4caf50 100%)",
            },
          },
          "& .MuiInputLabel-root": { color: "#4a6b5e" },
          "& .MuiInputBase-input": { fontSize: "0.95rem" },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          background: "linear-gradient(45deg, #2f855a 0%, #4caf50 100%)",
          color: "#ffffff",
          "&:hover": {
            background: "linear-gradient(45deg, #276749 0%, #388e3c 100%)",
            transform: "scale(1.05)",
          },
          transition: "all 0.3s ease",
        },
      },
    },
  },
});

export default function TransporterView({ params }: { params: { uid: string } }) {
  const { uid } = params;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"; // Fallback URL

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`${apiUrl}/trace/${uid}/`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setProduct({ title: "N/A" }); // Fallback data
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [uid, apiUrl]);

  const updateLocation = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      alert("Please log in as transporter");
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/products/${uid}/location/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lat: 0.0, lng: 0.0, location }),
      });
      if (!res.ok) throw new Error("Failed to update location");
      alert("Location updated");
    } catch (err) {
      console.error("Error updating location:", err);
      alert("Failed to update location");
    }
  };

  if (loading) return <CircularProgress sx={{ color: "#2f855a", display: "block", margin: "auto", mt: 4 }} />;

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
        <Box sx={{ zIndex: 1300, position: "fixed", top: 0, width: "100%" }}>
          <TopNavBar />
        </Box>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "300px",
            background: "linear-gradient(180deg, rgba(30, 58, 47, 0.8) 0%, rgba(47, 133, 90, 0.6) 100%)",
            opacity: 0.2,
            transform: "translateY(-15%)",
            transition: "transform 0.5s ease",
          }}
          component={motion.div}
          animate={{ y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%232f855a' fill-opacity='0.5' d='M0,160L48,144C96,128,192,96,288,80C384,64,480,64,576,96C672,128,768,192,864,208C960,224,1056,192,1152,160C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </Box>
        <Container
          maxWidth="lg"
          sx={{
            flex: 1,
            py: { xs: 4, md: 6 },
            px: { xs: 2, md: 4 },
            mt: { xs: "56px", md: "64px" },
            minHeight: "calc(100vh - 56px - 80px)",
            position: "relative",
            zIndex: 1200,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "2.5rem", md: "3rem" },
                  background: "linear-gradient(90deg, #1e3a2f 0%, #2f855a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Transporter’s View
              </Typography>
              <Typography
                sx={{ color: "#4a6b5e", fontSize: "1rem", mt: 1, maxWidth: "600px", mx: "auto" }}
              >
                Track and update the location of your products.
              </Typography>
            </Box>
            <Box
              sx={{
                maxWidth: 500,
                mx: "auto",
                p: 4,
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid #c4d8c9",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography variant="h5" sx={{ mb: 2, color: "#2f855a" }}>
                Transporter’s View
              </Typography>
              <Typography sx={{ mb: 2, color: "#4a6b5e" }}>
                Product: {product?.title || "N/A"}
              </Typography>
              <TextField
                label="Update Location"
                fullWidth
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                sx={{ my: 2 }}
              />
              <Button variant="contained" onClick={updateLocation} sx={{ mt: 2, px: 4 }}>
                Submit
              </Button>
            </Box>
          </motion.div>
        </Container>
        <Box sx={{ position: "relative", zIndex: 1300, mt: "auto" }}>
          <Footer />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
