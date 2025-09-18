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
} from "@mui/material";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "@/app/components/FooterSection";

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const getValidAccessToken = async (): Promise<string | null> => {
    let token = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");
    if (!token && refresh) {
      const refreshRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        }
      );
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sacco_admin/products/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.detail || "Failed to fetch products.");
        return;
      }
      const data = await res.json();
      setProducts(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load products. Please try again.");
    }
  };

  const fetchProductStages = async (product: Product) => {
    setLoadingStages(true);
    const token = await getValidAccessToken();
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sacco_admin/products/${product.uid}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, review }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      setError(err.detail || "Failed to process action.");
      return;
    }

    const data = await res.json();

    // Update table with new product data
    setProducts((prev) => prev.map((p) => (p.uid === data.uid ? data : p)));

    // Close dialog
    setSelectedProduct(null);
    setReview("");
  } catch (err) {
    console.error(err);
    setError("Something went wrong. Try again.");
  }
};


  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Sacco Admin Dashboard
      </Typography>
      {error && <Typography color="error">{error}</Typography>}

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Variety</TableCell>
              <TableCell>Farmer</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Acres</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.uid}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => window.location.href = `/dashboard/sacco_admin/${product.uid}`}
  >
                <TableCell>{product.title}</TableCell>
                <TableCell>{product.variety}</TableCell>
                <TableCell>{product.farmer.first_name}</TableCell>
                <TableCell>{product.farmer.email}</TableCell>
                <TableCell>{product.farmer.phone_number}</TableCell>
                <TableCell>{product.farmer.location}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{product.acres}</TableCell>
                <TableCell>{product.status}</TableCell>
                <TableCell>
                  {product.status === "Pending" && (
                    <Button onClick={() => fetchProductStages(product)}>Review</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Review Product</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {loadingStages ? (
            <CircularProgress />
          ) : (
            <>
              <Typography variant="h6">{selectedProduct?.title}</Typography>
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
                    {selectedProduct.stages.map((stage) => (
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
                rows={4}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                sx={{ mt: 2 }}
              />
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
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
      <Footer />
    </Box>
  );
}