"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Container,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { motion } from "framer-motion";
import TopNavBar from "../../../components/TopNavBar";
import Footer from "../../../components/FooterSection";

interface Product {
  uid: string;
  title: string;
  status: string;
  pid: string;
  qr_code_data?: string;
  tx_hash?: string;
  farmer?: { name: string; location: string };
}

const theme = createTheme({
  palette: {
    primary: { main: "#2f855a", contrastText: "#ffffff" },
    secondary: { main: "#1a3c34" },
    background: { default: "#f1f7f3" },
  },
  typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
});

export default function FarmerView({ params }: { params: { uid: string } }) {
  const { uid } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error("Environment variable NEXT_PUBLIC_API_URL is not defined");
        }
        const url = apiUrl + "/trace/" + uid + "/";
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load product");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [uid]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress sx={{ color: "#2f855a" }} />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Typography sx={{ color: "#d32f2f", fontSize: "0.9rem", fontWeight: "500" }}>
          {error || "Product not found"}
        </Typography>
      </Box>
    );
  }

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
        <TopNavBar />
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
              <CardContent sx={{ textAlign: "center", p: 2 }}>
                <Typography
                  variant="h5"
                  fontWeight="800"
                  sx={{
                    color: "#1e3a2f",
                    mb: 1.5,
                    fontSize: { xs: "1.6rem", md: "2rem" },
                    background: "linear-gradient(90deg, #1e3a2f 0%, #2f855a 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Farmer’s View
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem" }}>
                    Title: {product.title || "N/A"}
                  </Typography>
                  <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem" }}>
                    PID: {product.pid || "N/A"}
                  </Typography>
                  <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem" }}>
                    Status: {product.status || "N/A"}
                  </Typography>
                  <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem" }}>
                    Blockchain Tx: {product.tx_hash || "N/A"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
        <Footer />
      </Box>
    </ThemeProvider>
  );
}
