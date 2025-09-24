"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Typography, CircularProgress } from "@mui/material";

interface Product {
  uid: string;
  title: string;
  status: string;
  pid: string;
  qr_code_data?: string;
  tx_hash?: string;
  farmer?: { name: string; location: string };
}

export default function TracePage({ params }: { params: { uid: string } }) {
  const { uid } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/trace/${uid}/`
        );
        if (!res.ok) throw new Error("Failed to load product");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [uid]);

  if (loading) return <CircularProgress />;
  if (!product) return <Typography>Product not found</Typography>;

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h5">{product.title}</Typography>
      <Typography>Status: {product.status}</Typography>
      <Typography>PID: {product.pid}</Typography>
      <Typography>Farmer: {product.farmer?.name}</Typography>
      <Typography>Location: {product.farmer?.location}</Typography>
      {product.tx_hash && <Typography>Blockchain Tx: {product.tx_hash}</Typography>}

      {product.qr_code_data && (
        <img
          src={product.qr_code_data}
          alt="QR Code"
          style={{ width: "150px", margin: "1rem auto" }}
        />
      )}

      <Typography variant="h6" sx={{ mt: 3 }}>
        Who are you?
      </Typography>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() => router.push(`/farmer/product/${uid}`)}
        >
          👩🏽‍🌾 Farmer
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push(`/transporter/product/${uid}`)}
        >
          🚚 Transporter
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => router.push(`/consumer/product/${uid}`)}
        >
          🛒 Consumer
        </Button>
      </Box>
    </Box>
  );
}
