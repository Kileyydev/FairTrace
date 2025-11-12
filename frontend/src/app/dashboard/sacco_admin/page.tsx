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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "@/app/components/FooterSection";
import { motion } from "framer-motion";

interface Farmer {
  full_name: string;
  email: string;
  phone: string;
  farm_address: string;
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
  description: string;
  stages?: ProductStage[];
}

export default function SaccoAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [review, setReview] = useState("");
  const [loadingStages, setLoadingStages] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

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
        const err = await res.json();
        setError(err.detail || "Failed to fetch products.");
        return;
      }
      const data = await res.json();

      const mappedProducts: Product[] = data.map((p: any) => ({
        ...p,
        farmer: {
          full_name: `${p.farmer.first_name} ${p.farmer.last_name}`,
          email: p.farmer.email,
          phone: p.farmer.phone,
          farm_address: p.farm_address || "-",
        },
      }));

      setProducts(mappedProducts);
    } catch (err) {
      setError("Network error. Please try again.");
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
      const detail = await res.json();
      setSelectedProduct({ ...product, stages: detail.stages || [] });
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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action, review }),
        }
      );
      if (!res.ok) throw new Error("Action failed");
      const updated = await res.json();
      setProducts((prev) => prev.map((p) => (p.uid === updated.uid ? updated : p)));
      setSelectedProduct(null);
      setReview("");
    } catch (err) {
      setError("Failed to process action.");
    }
  };

  const handleStatusChange = async (uid: string, newStatus: string) => {
    setUpdatingStatus(uid);
    const token = await getValidAccessToken();
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sacco_admin/products/${uid}/update_status/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setProducts((prev) => prev.map((p) => (p.uid === updated.uid ? updated : p)));
    } catch (err) {
      setError("Failed to update status.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  // Define stages in order
  const stageOptions = [
    { value: "approved", label: "Approved" },
    { value: "harvested", label: "Harvested" },
    { value: "in_transit", label: "In Transit" },
    { value: "delivered", label: "Delivered" },
  ];

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
            <Typography color="error" sx={{ mb: 1.5, fontSize: "0.85rem", fontWeight: 500 }}>
              {error}
            </Typography>
          )}

          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
              background: "rgba(255,255,255,0.9)",
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
                    "Stage",
                  ].map((h) => (
                    <TableCell
                      key={h}
                      sx={{ fontWeight: 700, color: "#1e3a2f", fontSize: "0.85rem", py: 1.2 }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => {
                  const { farmer } = product;
                  const isApproved = ["approved", "harvested", "in_transit", "delivered"].includes(
                    product.status.toLowerCase()
                  );

                  return (
                    <TableRow
                      key={product.uid}
                      hover
                      sx={{
                        cursor: "pointer",
                        "&:hover": { background: "rgba(47, 133, 90, 0.05)" },
                      }}
                      onClick={() => (window.location.href = `/dashboard/sacco_admin/${product.uid}`)}
                    >
                      <TableCell sx={{ color: "#1e3a2f", fontSize: "0.8rem" }}>{product.title}</TableCell>
                      <TableCell sx={{ color: "#1e3a2f", fontSize: "0.8rem" }}>{product.variety}</TableCell>
                      <TableCell sx={{ color: "#1e3a2f", fontSize: "0.8rem" }}>{farmer.full_name}</TableCell>
                      <TableCell sx={{ color: "#1e3a2f", fontSize: "0.8rem" }}>{farmer.email}</TableCell>
                      <TableCell sx={{ color: "#1e3a2f", fontSize: "0.8rem" }}>{farmer.phone}</TableCell>
                      <TableCell sx={{ color: "#1e3a2f", fontSize: "0.8rem" }}>{farmer.farm_address}</TableCell>
                      <TableCell sx={{ color: "#1e3a2f", fontSize: "0.8rem" }}>{product.quantity}</TableCell>
                      <TableCell sx={{ color: "#1e3a2f", fontSize: "0.8rem" }}>{product.acres}</TableCell>
                      <TableCell sx={{ color: "#1e3a2f", fontSize: "0.8rem" }}>{product.status}</TableCell>

                      {/* STAGE UPDATE OR REVIEW - ALWAYS SHOW DROPDOWN IF APPROVED */}
                      <TableCell>
                        {isApproved ? (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                              <InputLabel>Stage</InputLabel>
                              <Select
                                value={product.status}
                                label="Stage"
                                onChange={(e: SelectChangeEvent) => {
                                  e.stopPropagation();
                                  const val = e.target.value;
                                  if (val !== product.status) {
                                    handleStatusChange(product.uid, val);
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                disabled={updatingStatus === product.uid}
                                MenuProps={{
                                  PaperProps: { sx: { maxHeight: 200 } },
                                }}
                              >
                                {stageOptions.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            {updatingStatus === product.uid && (
                              <CircularProgress size={16} thickness={4} />
                            )}
                          </Box>
                        ) : product.status.toLowerCase() === "pending" ? (
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
                              fontWeight: 600,
                              borderRadius: 2,
                              px: 2,
                              "&:hover": { background: "#2f855a", color: "#fff" },
                            }}
                          >
                            Review
                          </Button>
                        ) : (
                          <Typography sx={{ fontSize: "0.8rem", color: "#666" }}>
                            {product.status}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>

        {/* REVIEW DIALOG */}
        <Dialog open={!!selectedProduct} onClose={() => setSelectedProduct(null)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ background: "linear-gradient(90deg, #e0f2e9 0%, #ffffff 100%)", color: "#1e3a2f" }}>
            Review: {selectedProduct?.title}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {loadingStages ? (
              <CircularProgress sx={{ display: "block", mx: "auto", color: "#2f855a" }} />
            ) : (
              <>
                {selectedProduct?.stages?.length ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Stage</TableCell>
                        <TableCell>Qty</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>QR</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedProduct.stages.map((s: any) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.stage_name}</TableCell>
                          <TableCell>{s.quantity || "-"}</TableCell>
                          <TableCell>{s.location || "-"}</TableCell>
                          <TableCell>{s.scanned_qr ? "Yes" : "No"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography>No stages recorded.</Typography>
                )}

                <TextField
                  label="Admin Review"
                  multiline
                  rows={3}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  fullWidth
                  sx={{ mt: 2 }}
                />

                <Box sx={{ mt: 2, display: "flex", gap: 1, justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleAction(selectedProduct!, "approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleAction(selectedProduct!, "reject")}
                  >
                    Reject
                  </Button>
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