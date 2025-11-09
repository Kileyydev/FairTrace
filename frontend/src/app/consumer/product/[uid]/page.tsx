
"use client";

import { useEffect, useState } from "react";
import { Typography, Box, CircularProgress, Paper, Container, ThemeProvider, createTheme, CssBaseline } from "@mui/material";
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
    MuiPaper: {
      styleOverrides: {
        root: {
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          border: "1px solid #c4d8c9",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});

export default function ConsumerView({ params }: { params: { uid: string } }) {
  const { uid } = params;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/trace/${uid}/`
        );
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [uid]);

  if (loading) return <CircularProgress sx={{ color: "#2f855a", display: "block", margin: "auto", mt: 4 }} />;

  if (!product) return <Typography color="error" sx={{ textAlign: "center", mt: 4 }}>Product not found</Typography>;

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
            height: "200px",
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
          maxWidth="md"
          sx={{
            flex: 1,
            py: { xs: 2, md: 4 },
            px: { xs: 1, md: 2 },
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
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  background: "linear-gradient(90deg, #1e3a2f 0%, #2f855a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Consumer’s View
              </Typography>
              <Typography
                sx={{ color: "#4a6b5e", fontSize: "0.9rem", mt: 1, maxWidth: "500px", mx: "auto" }}
              >
                Trace the journey of your products with FairTrace.
              </Typography>
            </Box>
            <Box sx={{ mx: "auto", maxWidth: 400 }}>
              <Paper sx={{ p: 1.5, mb: 1 }}>
                <Typography sx={{ mb: 0.5, fontWeight: 600, color: "#2f855a" }}>
                  <strong>Product:</strong> {product.title}
                </Typography>
                <Typography sx={{ mb: 0.5, color: "#4a6b5e" }}>
                  <strong>Produced by:</strong> {product.farmer?.name || "N/A"}
                </Typography>
                <Typography sx={{ mb: 0.5, color: "#4a6b5e" }}>
                  <strong>Location:</strong> {product.farmer?.location || "N/A"}
                </Typography>
                <Typography sx={{ mb: 0.5, color: "#4a6b5e" }}>
                  <strong>Blockchain Tx:</strong> {product.tx_hash || "N/A"}
                </Typography>
                <Typography sx={{ mb: 0.5, color: "#4a6b5e" }}>
                  <strong>Status:</strong> {product.status || "N/A"}
                </Typography>
              </Paper>
            </Box>
          </motion.div>
        </Container>
        <Footer sx={{ position: "relative", zIndex: 1300, mt: "auto" }} />
      </Box>
    </ThemeProvider>
  );
}
