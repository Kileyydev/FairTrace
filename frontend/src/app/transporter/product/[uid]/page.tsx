"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress, TextField } from "@mui/material";

export default function TransporterView({ params }: { params: { uid: string } }) {
  const { uid } = params;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trace/${uid}/`);
      const data = await res.json();
      setProduct(data);
      setLoading(false);
    }
    fetchProduct();
  }, [uid]);

  const updateLocation = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      alert("Please log in as transporter");
      return;
    }
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${uid}/location/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lat: 0.0, lng: 0.0, location }),
    });
    alert("Location updated");
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">Transporter’s View</Typography>
      <Typography>Product: {product.title}</Typography>
      <TextField
        label="Update Location"
        fullWidth
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        sx={{ my: 2 }}
      />
      <Button variant="contained" onClick={updateLocation}>
        Submit
      </Button>
    </Box>
  );
}
