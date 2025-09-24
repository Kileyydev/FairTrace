"use client";
import { useEffect, useState } from "react";
import { Typography, Box, CircularProgress, Paper } from "@mui/material";

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

  if (loading) return <CircularProgress />;

  if (!product) return <Typography color="error">Product not found</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Consumer’s View
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography>
          <strong>Product:</strong> {product.title}
        </Typography>
        <Typography>
          <strong>Produced by:</strong> {product.farmer?.name}
        </Typography>
        <Typography>
          <strong>Location:</strong> {product.farmer?.location}
        </Typography>
        <Typography>
          <strong>Blockchain Tx:</strong> {product.tx_hash}
        </Typography>
        <Typography>
          <strong>Status:</strong> {product.status}
        </Typography>
      </Paper>
    </Box>
  );
}
