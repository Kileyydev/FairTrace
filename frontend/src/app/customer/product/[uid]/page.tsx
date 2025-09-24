"use client";
import { useEffect, useState } from "react";
import { Typography, Box, CircularProgress } from "@mui/material";

export default function ConsumerView({ params }: { params: { uid: string } }) {
  const { uid } = params;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trace/${uid}/`);
      const data = await res.json();
      setProduct(data);
      setLoading(false);
    }
    fetchProduct();
  }, [uid]);

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">Consumer’s View</Typography>
      <Typography>Product: {product.title}</Typography>
      <Typography>Produced by: {product.farmer?.name}</Typography>
      <Typography>Location: {product.farmer?.location}</Typography>
      <Typography>Blockchain Tx: {product.tx_hash}</Typography>
      <Typography>Status: {product.status}</Typography>
    </Box>
  );
}
