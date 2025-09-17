"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
} from "@mui/material";

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sacco_admin/stages/?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sacco_admin/stages/${product.uid}/`, {
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
        `${process.env.NEXT_PUBLIC_API_URL}/sacco_admin/stages/${product.uid}/approve/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action, review }),
        }
      );
      const data = await res.json();
      setProducts((prev) => prev.map((p) => (p.uid === data.uid ? data : p)));
      setSelectedProduct(null);
      setReview("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Sacco Admin Dashboard
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {products.map((product) => (
          <Card key={product.uid} sx={{ width: 300 }}>
            {product.qr_code_data && (
              <CardMedia component="img" height="140" image={product.qr_code_data} alt="QR Code" />
            )}
            <CardContent>
              <Typography variant="h6">
                {product.title} ({product.variety})
              </Typography>
              <Typography>
                Farmer: {product.farmer.first_name} - {product.farmer.email}
              </Typography>
              <Typography>Phone: {product.farmer.phone_number}</Typography>
              <Typography>Location: {product.farmer.location}</Typography>
              <Typography>
                Quantity: {product.quantity}, Acres: {product.acres}
              </Typography>
              <Typography>Status: {product.status}</Typography>
              {product.status === "Pending" && (
                <Button onClick={() => fetchProductStages(product)}>Review</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={!!selectedProduct} onClose={() => setSelectedProduct(null)} fullWidth maxWidth="sm">
        <DialogTitle>Review Product</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {loadingStages ? (
            <Typography>Loading stages...</Typography>
          ) : (
            <>
              <Typography>Product: {selectedProduct?.title}</Typography>
              {selectedProduct?.stages?.map((stage) => (
                <Typography key={stage.id}>
                  Stage: {stage.stage_name}, Qty: {stage.quantity}, Location: {stage.location}
                </Typography>
              ))}
              <TextField
                label="Admin Review"
                multiline
                rows={4}
                value={review}
                onChange={(e) => setReview(e.target.value)}
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
    </Box>
  );
}
