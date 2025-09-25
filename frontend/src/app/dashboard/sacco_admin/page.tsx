"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  CircularProgress,
  Container,
} from "@mui/material";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "@/app/components/FooterSection";
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
  farmer: Farmer;
  qr_code_data: string | null;
  description: string;
  stages?: ProductStage[];
}

export default function SaccoAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [review, setReview] = useState("");
  const [loadingStages, setLoadingStages] = useState(false);
  const [farmerDetails, setFarmerDetails] = useState<Record<string, Farmer>>({});
  const [loadingFarmers, setLoadingFarmers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const getValidAccessToken = async (): Promise<string | null> => {
    let token = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");
    if (!token && refresh) {
      const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!refreshRes.ok) return null;
      const refreshData = await refreshRes.json();
      token = refreshData.access;
      localStorage.setItem("access", token ?? "");
    }
    return token;
  };

  const fetchProducts = async () => {
    setError(null);
    const token = await getValidAccessToken();
    if (!token) {
      setError("Session expired. Please log in again.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sacco_admin/products/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.detail || "Failed to fetch products.");
        return;
      }
      const data = await res.json();
      setProducts(data || []);

      // Pre-fetch farmer details for all products
      data.forEach((product: Product) => {
        fetchFarmerDetails(product.farmer.email);
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load products. Please try again.");
    }
  };

  const fetchFarmerDetails = async (email: string) => {
    if (farmerDetails[email] || loadingFarmers[email]) return;
    setLoadingFarmers((prev) => ({ ...prev, [email]: true }));
    const token = await getValidAccessToken();
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/farmers/${email}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch farmer details");
      const data: Farmer = await res.json();
      setFarmerDetails((prev) => ({ ...prev, [email]: data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFarmers((prev) => ({ ...prev, [email]: false }));
    }
  };

  const fetchProductStages = async (product: Product) => {
    setLoadingStages(true);
    const token = await getValidAccessToken();
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sacco_admin/products/${product.uid}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const stages = await res.json();
      setSelectedProduct({ ...product, stages });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStages(false);
    }
  };

  const handleAction = async (product: Product, action: "approve" | "reject") => {
    const token = await getValidAccessToken();
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sacco_admin/products/${product.uid}/decision/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action, review }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Failed to process action.");
        return;
      }

      const data = await res.json();
      setProducts((prev) => prev.map((p) => (p.uid === data.uid ? data : p)));
      setSelectedProduct(null);
      setReview("");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    }
  };

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
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 }, flexGrow: 1 }}>
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
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
            Sacco Admin Dashboard
          </Typography>
          {error && (
            <Typography color="error" sx={{ mb: 1.5, fontSize: "0.85rem", fontWeight: "500" }}>
              {error}
            </Typography>
          )}

          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15)",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ background: "linear-gradient(90deg, #e0f2e9 0%, #ffffff 100%)" }}>
                  {[
                    "Title",
                    "Variety",
                    "Farmer",
                    "Email",
                    "Phone",
                    "Location",
                    "Quantity",
                    "Acres",
                    "Status",
                    "Actions",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{ fontWeight: "700", color: "#1e3a2f", fontSize: "0.85rem", py: 1.2 }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {products.map((product) => {
                  const farmer = farmerDetails[product.farmer.email] || product.farmer;
                  return (
                    <TableRow
                      key={product.uid}
                      hover
                      sx={{
                        cursor: "pointer",
                        "&:hover": { background: "rgba(47, 133, 90, 0.05)" },
                      }}
                      onClick={() =>
                        (window.location.href = `/dashboard/sacco_admin/${product.uid}`)
                      }
                    >
                      <TableCell sx={{ color: "#1e3a2f", fontSize: "0.8rem" }}>{product.title}</TableCell>
                      <TableCell sx={{ color: "#1e3a2f", fontSize: "0.8rem" }}>{product.variety}</TableCell>
                      <TableCell sx={{ color: "#1e3a2f", fontSize: "0.8rem" }}>{farmer.first_name}</TableCell>
                      <TableCell sx={{ color: "#1e3a2f", fontSize: "0.8rem" }}>{farmer.email}</TableCell>
                      <TableCell sx={{ color: "#1e3a2f", fontSize: "0.8rem" }}>
                        {loadingFarmers[product.farmer.email] ? (
                          <CircularProgress size={14} />
                        ) : (
                          farmer.phone_number
                        )}
                      </TableCell>
                      <TableCell sx={{ color: "#1e3a2f", fontSize: "0.8rem" }}>
                        {loadingFarmers[product.farmer.email] ? (
                          <CircularProgress size={14} />
                        ) : (
                          farmer.location
                        )}
                      </TableCell>
                      <TableCell sx={{ color: "#1e3a2f", fontSize: "0.8rem" }}>{product.quantity}</TableCell>
                      <TableCell sx={{ color: "#1e3a2f", fontSize: "0.8rem" }}>{product.acres}</TableCell>
                      <TableCell sx={{ color: "#1e3a2f", fontSize: "0.8rem" }}>{product.status}</TableCell>
                      <TableCell>
                        {product.status === "Pending" && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchProductStages(product);
                              }}
                              sx={{
                                textTransform: "none",
                                color: "#2f855a",
                                borderColor: "#2f855a",
                                fontWeight: "600",
                                borderRadius: 2,
                                px: 2,
                                "&:hover": {
                                  background: "#2f855a",
                                  color: "#ffffff",
                                  borderColor: "#2f855a",
                                },
                              }}
                            >
                              Review
                            </Button>
                          </motion.div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>

        {/* Review Dialog (no change from your code) */}
        <Dialog
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(90deg, #e0f2e9 0%, #ffffff 100%)",
              color: "#1e3a2f",
              fontWeight: "700",
              fontSize: "1.1rem",
              py: 1.5,
            }}
          >
            Review Product: {selectedProduct?.title}
          </DialogTitle>
          <DialogContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {loadingStages ? (
              <CircularProgress sx={{ color: "#2f855a", alignSelf: "center" }} />
            ) : (
              <>
                {selectedProduct?.stages?.length ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: "rgba(47, 133, 90, 0.05)" }}>
                        <TableCell sx={{ fontWeight: "600", color: "#1e3a2f", fontSize: "0.8rem" }}>Stage</TableCell>
                        <TableCell sx={{ fontWeight: "600", color: "#1e3a2f", fontSize: "0.8rem" }}>Quantity</TableCell>
                        <TableCell sx={{ fontWeight: "600", color: "#1e3a2f", fontSize: "0.8rem" }}>Location</TableCell>
                        <TableCell sx={{ fontWeight: "600", color: "#1e3a2f", fontSize: "0.8rem" }}>Scanned QR</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedProduct?.stages?.map((stage) => (
                        <TableRow key={stage.id}>
                          <TableCell sx={{ color: "#4a6b5e", fontSize: "0.75rem" }}>{stage.stage_name}</TableCell>
                          <TableCell sx={{ color: "#4a6b5e", fontSize: "0.75rem" }}>{stage.quantity}</TableCell>
                          <TableCell sx={{ color: "#4a6b5e", fontSize: "0.75rem" }}>{stage.location}</TableCell>
                          <TableCell sx={{ color: "#4a6b5e", fontSize: "0.75rem" }}>{stage.scanned_qr ? "Yes" : "No"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography sx={{ color: "#4a6b5e", fontSize: "0.85rem" }}>No stages recorded yet.</Typography>
                )}

                <TextField
                  label="Admin Review"
                  multiline
                  rows={3}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  fullWidth
                  sx={{
                    mt: 1.5,
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

                <Box sx={{ display: "flex", gap: 1.5, mt: 1.5, justifyContent: "flex-end" }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAction(selectedProduct!, "approve")}
                      sx={{
                        background: "linear-gradient(45deg, #2f855a 0%, #4caf50 100%)",
                        color: "#ffffff",
                        textTransform: "none",
                        fontWeight: "600",
                        borderRadius: 2,
                        px: 2.5,
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
                      onClick={() => handleAction(selectedProduct!, "reject")}
                      sx={{
                        background: "linear-gradient(45deg, #d32f2f 0%, #b71c1c 100%)",
                        color: "#ffffff",
                        textTransform: "none",
                        fontWeight: "600",
                        borderRadius: 2,
                        px: 2.5,
                        "&:hover": {
                          background: "linear-gradient(45deg, #b71c1c 0%, #9a0007 100%)",
                        },
                      }}
                    >
                      Reject
                    </Button>
                  </motion.div>
                </Box>
              </>
            )}
          </DialogContent>
        </Dialog>
      </Container>
      <Footer />
    </Box>
  );
}
