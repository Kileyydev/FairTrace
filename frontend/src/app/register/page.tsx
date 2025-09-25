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
  fullName: string;
  email: string;
  phone: string;
  farmAddress: string;
  gpsLat: string;
  gpsLong: string;
  farmSize?: string;
  mainCrops?: string;
  saccoMembership?: string;
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
  farmer: { email: string }; // Only email comes from product payload
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

      const data: Product[] = await res.json();
      setProducts(data);

      // Pre-fetch farmer details for each product
      data.forEach((product) => fetchFarmerDetails(product.farmer.email));
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${email}/`, {
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
    <Box sx={{ background: "linear-gradient(145deg, #f1f7f3 0%, #c9e2d3 100%)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopNavBar />
      <Container maxWidth="xl" sx={{ py: 6, flexGrow: 1 }}>
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <Typography variant="h4" fontWeight="800" sx={{ color: "#1e3a2f", mb: 2 }}>
            Sacco Admin Dashboard
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {[
                    "Title",
                    "Variety",
                    "Farmer Name",
                    "Email",
                    "Phone",
                    "Farm Address",
                    "Latitude",
                    "Longitude",
                    "Quantity",
                    "Acres",
                    "Status",
                    "Actions",
                  ].map((header) => (
                    <TableCell key={header} sx={{ fontWeight: 700 }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => {
                  const farmer = farmerDetails[product.farmer.email];
                  return (
                    <TableRow key={product.uid} hover>
                      <TableCell>{product.title}</TableCell>
                      <TableCell>{product.variety}</TableCell>
                      <TableCell>{farmer?.fullName || "Loading..."}</TableCell>
                      <TableCell>{product.farmer.email}</TableCell>
                      <TableCell>{farmer?.phone || "Loading..."}</TableCell>
                      <TableCell>{farmer?.farmAddress || "Loading..."}</TableCell>
                      <TableCell>{farmer?.gpsLat || "Loading..."}</TableCell>
                      <TableCell>{farmer?.gpsLong || "Loading..."}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>{product.acres}</TableCell>
                      <TableCell>{product.status}</TableCell>
                      <TableCell>
                        {product.status === "Pending" && (
                          <Button variant="outlined" size="small" onClick={() => fetchProductStages(product)}>
                            Review
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>

        {/* Review Dialog */}
        <Dialog open={!!selectedProduct} onClose={() => setSelectedProduct(null)} fullWidth maxWidth="sm">
          <DialogTitle>Review Product: {selectedProduct?.title}</DialogTitle>
          <DialogContent>
            {loadingStages ? (
              <CircularProgress />
            ) : (
              <>
                {selectedProduct?.stages?.length ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Stage</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Scanned QR</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedProduct?.stages?.map((stage) => (
                        <TableRow key={stage.id}>
                          <TableCell>{stage.stage_name}</TableCell>
                          <TableCell>{stage.quantity}</TableCell>
                          <TableCell>{stage.location}</TableCell>
                          <TableCell>{stage.scanned_qr ? "Yes" : "No"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography>No stages recorded yet.</Typography>
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

                <Box sx={{ display: "flex", gap: 2, mt: 2, justifyContent: "flex-end" }}>
                  <Button variant="contained" color="success" onClick={() => handleAction(selectedProduct!, "approve")}>
                    Approve
                  </Button>
                  <Button variant="contained" color="error" onClick={() => handleAction(selectedProduct!, "reject")}>
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
