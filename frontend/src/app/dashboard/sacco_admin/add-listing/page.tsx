"use client";

import React, { useState, useEffect } from "react";
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  Alert, 
  CircularProgress 
} from "@mui/material";

import { initContracts, getBlockchainUtils } from "@/utils/blockchain";

export default function AddSaccoListing() {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    initContracts();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { saccoPurchases } = getBlockchainUtils();

      if (!saccoPurchases) {
        throw new Error("Blockchain contracts not initialized");
      }

      // --- Convert price to Wei ---
      const priceInWei = BigInt(
        Number(unitPrice) * 10 ** 18
      ).toString();

      // --- Blockchain transaction ---
      const tx = await saccoPurchases.createListing(
        productName,
        description,
        priceInWei,
        Number(quantity)
      );

      await tx.wait();

      setSuccessMsg("Listing added successfully and stored on Blockchain!");
      setProductName("");
      setDescription("");
      setUnitPrice("");
      setQuantity("");

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create listing");
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        margin: "40px auto",
        padding: 2,
      }}
    >
      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Add New SACCO Purchase Listing
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={2}>
            Fill in the details below to create a new product listing that farmers will see publicly.
          </Typography>

          {successMsg && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMsg}
            </Alert>
          )}

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Unit Price (ETH)"
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Quantity Needed"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              margin="normal"
              required
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3, py: 1.4 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create Listing"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
