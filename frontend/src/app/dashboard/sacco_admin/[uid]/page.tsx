"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Button, TextField, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "@/app/components/FooterSection";
import { useParams, useRouter } from "next/navigation";

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


 // in ProductDetails component
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

    // update product in UI with returned data
    setProduct((prev) => ({ ...(prev as Product), ...data }));

    // If approved, show QR and PID on the page (they're now in product)
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

  return (
    <Box>
      <TopNavBar />
      <Box sx={{ p: 4 }}>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : product ? (
          <>
            <Typography variant="h4" gutterBottom>
              {product.title} ({product.variety})
            </Typography>

            <Typography variant="body1" gutterBottom>
              {product.description}
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Farmer Info</Typography>
              <Typography>Name: {product.farmer.first_name}</Typography>
              <Typography>Email: {product.farmer.email}</Typography>
              <Typography>Phone: {product.farmer.phone_number}</Typography>
              <Typography>Location: {product.farmer.location}</Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Product Info</Typography>
              <Typography>Quantity: {product.quantity}</Typography>
              <Typography>Acreage: {product.acres}</Typography>
              <Typography>Status: {product.status}</Typography>
              {product.qr_code_data && (
                <Box sx={{ mt: 2 }}>
                  <Typography>QR Code:</Typography>
                  <img src={product.qr_code_data} alt="QR Code" style={{ width: "200px" }} />
                </Box>
              )}
            </Box>

            {product.images?.length ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Images</Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {product.images.map((img, i) => (
                    <img key={i} src={img} alt={`Product ${i}`} style={{ width: "150px", borderRadius: "8px" }} />
                  ))}
                </Box>
              </Box>
            ) : null}

            {product.stages?.length ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6">Stages</Typography>
                <Paper>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Stage</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>QR Scanned</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {product.stages.map((stage) => (
                        <TableRow key={stage.id}>
                          <TableCell>{stage.stage_name}</TableCell>
                          <TableCell>{stage.quantity}</TableCell>
                          <TableCell>{stage.location}</TableCell>
                          <TableCell>{stage.scanned_qr ? "Yes" : "No"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            ) : null}

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">Admin Review</Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                sx={{ mt: 1 }}
              />
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button variant="contained" color="success" onClick={() => handleAction("approve")}>
                  Approve
                </Button>
                <Button variant="contained" color="error" onClick={() => handleAction("reject")}>
                  Reject
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          <Typography>No product found</Typography>
        )}
      </Box>
      <Footer />
    </Box>
  );
}
