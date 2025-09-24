"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Container,
} from "@mui/material";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "@/app/components/FooterSection";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Farmer {
  first_name: string;
  email: string;
  phone_number: string;
  location: string;
}

interface ProductStage {
  id: string;
  stage_name: string;
  quantity: number;
  location: string;
  scanned_qr: boolean;
}

interface Product {
  uid: string;
  title: string;
  variety: string;
  quantity: number;
  acres: number;
  status: string;
  description: string;
  qr_code_data: string | null;
  images?: string[];
  farmer: Farmer;
  stages?: ProductStage[];
}

export default function ProductDetails() {
  const { uid } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);

  const getValidAccessToken = async (): Promise<string | null> => {
    let token = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");
    if (!token && refresh) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      token = data.access;
      localStorage.setItem("access", token ?? "");
    }
    return token;
  };

  const fetchProduct = async () => {
    const token = await getValidAccessToken();
    if (!token) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sacco_admin/products/${uid}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        setError("Failed to fetch product details");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setProduct(data);
    } catch (err) {
      console.error(err);
      setError("Error loading product");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "approve" | "reject") => {
    setError(null);
    const token = await getValidAccessToken();
    if (!token || !product) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sacco_admin/products/${product.uid}/decision/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action, review }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.detail || err.error || "Failed to submit decision");
        return;
      }

      const data = await res.json();
      setProduct((prev) => ({ ...(prev as Product), ...data }));

      if (data.status === "approved") {
        alert("Product approved. PID: " + data.pid);
      } else {
        alert("Product rejected.");
      }
    } catch (err) {
      console.error(err);
      setError("Action failed");
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [uid]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(145deg, #f1f7f3 0%, #c9e2d3 100%)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
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
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 }, flexGrow: 1 }}>
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: "#2f855a" }} />
            </Box>
          ) : error ? (
            <Typography
              color="error"
              sx={{ fontSize: "0.9rem", fontWeight: "500", textAlign: "center" }}
            >
              {error}
            </Typography>
          ) : product ? (
            <Box
              sx={{
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: 3,
                boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15)",
                backdropFilter: "blur(10px)",
                p: { xs: 3, md: 4 },
              }}
            >
              <Typography
                variant="h4"
                fontWeight="800"
                sx={{
                  color: "#1e3a2f",
                  mb: 2,
                  fontSize: { xs: "1.8rem", md: "2.2rem" },
                  background: "linear-gradient(90deg, #1e3a2f 0%, #2f855a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {product.title} ({product.variety})
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#4a6b5e", mb: 3, fontSize: "0.95rem" }}
              >
                {product.description}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#1e3a2f", fontWeight: "700", fontSize: "1.1rem", mb: 1 }}
                >
                  Farmer Info
                </Typography>
                <Box sx={{ background: "rgba(47, 133, 90, 0.05)", borderRadius: 2, p: 2 }}>
                  <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem" }}>
                    Name: {product.farmer.first_name}
                  </Typography>
                  <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem" }}>
                    Email: {product.farmer.email}
                  </Typography>
                  <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem" }}>
                    Phone: {product.farmer.phone_number}
                  </Typography>
                  <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem" }}>
                    Location: {product.farmer.location}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#1e3a2f", fontWeight: "700", fontSize: "1.1rem", mb: 1 }}
                >
                  Product Info
                </Typography>
                <Box sx={{ background: "rgba(47, 133, 90, 0.05)", borderRadius: 2, p: 2 }}>
                  <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem" }}>
                    Quantity: {product.quantity}
                  </Typography>
                  <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem" }}>
                    Acreage: {product.acres}
                  </Typography>
                  <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem" }}>
                    Status: {product.status}
                  </Typography>
                </Box>
                {product.qr_code_data && (
                  <Box sx={{ mt: 2, textAlign: "center" }}>
                    <Typography sx={{ color: "#1e3a2f", fontWeight: "600", fontSize: "1rem", mb: 1 }}>
                      QR Code
                    </Typography>
                    <Box
                      sx={{
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        display: "inline-block",
                      }}
                    >
                      <img
                        src={product.qr_code_data}
                        alt="QR Code"
                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>

              {product.images?.length ? (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "#1e3a2f", fontWeight: "700", fontSize: "1.1rem", mb: 1 }}
                  >
                    Images
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    {product.images.map((img, i) => (
                      <Box
                        key={i}
                        sx={{
                          borderRadius: 2,
                          overflow: "hidden",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <img
                          src={img}
                          alt={`Product ${i}`}
                          style={{ width: "120px", height: "120px", objectFit: "cover" }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : null}

              {product.stages?.length ? (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "#1e3a2f", fontWeight: "700", fontSize: "1.1rem", mb: 1 }}
                  >
                    Stages
                  </Typography>
                  <TableContainer
                    component={Paper}
                    sx={{
                      borderRadius: 2,
                      background: "rgba(255, 255, 255, 0.7)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow
                          sx={{
                            background: "linear-gradient(90deg, #e0f2e9 0%, #ffffff 100%)",
                          }}
                        >
                          <TableCell sx={{ fontWeight: "600", color: "#1e3a2f", fontSize: "0.8rem" }}>
                            Stage
                          </TableCell>
                          <TableCell sx={{ fontWeight: "600", color: "#1e3a2f", fontSize: "0.8rem" }}>
                            Quantity
                          </TableCell>
                          <TableCell sx={{ fontWeight: "600", color: "#1e3a2f", fontSize: "0.8rem" }}>
                            Location
                          </TableCell>
                          <TableCell sx={{ fontWeight: "600", color: "#1e3a2f", fontSize: "0.8rem" }}>
                            QR Scanned
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {product.stages.map((stage) => (
                          <TableRow key={stage.id}>
                            <TableCell sx={{ color: "#4a6b5e", fontSize: "0.75rem" }}>
                              {stage.stage_name}
                            </TableCell>
                            <TableCell sx={{ color: "#4a6b5e", fontSize: "0.75rem" }}>
                              {stage.quantity}
                            </TableCell>
                            <TableCell sx={{ color: "#4a6b5e", fontSize: "0.75rem" }}>
                              {stage.location}
                            </TableCell>
                            <TableCell sx={{ color: "#4a6b5e", fontSize: "0.75rem" }}>
                              {stage.scanned_qr ? "Yes" : "No"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : null}

              <Box>
                <Typography
                  variant="h6"
                  sx={{ color: "#1e3a2f", fontWeight: "700", fontSize: "1.1rem", mb: 1 }}
                >
                  Admin Review
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: "rgba(255, 255, 255, 0.7)",
                      "& fieldset": { borderColor: "#c4d8c9" },
                      "&:hover fieldset": { borderColor: "#2f855a" },
                      "&.Mui-focused fieldset": { borderColor: "#276749" },
                    },
                    "& .MuiInputLabel-root": { color: "#4a6b5e" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#276749" },
                  }}
                />
                <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAction("approve")}
                      sx={{
                        background: "linear-gradient(45deg, #2f855a 0%, #4caf50 100%)",
                        color: "#ffffff",
                        textTransform: "none",
                        fontWeight: "600",
                        borderRadius: 2,
                        px: 3,
                        "&:hover": {
                          background: "linear-gradient(45deg, #276749 0%, #388e3c 100%)",
                        },
                      }}
                    >
                      Approve
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAction("reject")}
                      sx={{
                        background: "linear-gradient(45deg, #d32f2f 0%, #b71c1c 100%)",
                        color: "#ffffff",
                        textTransform: "none",
                        fontWeight: "600",
                        borderRadius: 2,
                        px: 3,
                        "&:hover": {
                          background: "linear-gradient(45deg, #b71c1c 0%, #9a0007 100%)",
                        },
                      }}
                    >
                      Reject
                    </Button>
                  </motion.div>
                </Box>
              </Box>
            </Box>
          ) : (
            <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem", textAlign: "center" }}>
              No product found
            </Typography>
          )}
        </motion.div>
      </Container>
      <Footer />
    </Box>
  );
}