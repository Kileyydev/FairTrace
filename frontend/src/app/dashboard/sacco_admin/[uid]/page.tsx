// app/dashboard/sacco_admin/[uid]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
} from "@mui/material";
import { Stamp, LogOut, CheckCircle, XCircle } from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import LocalShipping from "@mui/icons-material/LocalShipping";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "@/app/components/FooterSection";
import { useParams, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

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

interface Transporter {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  license_plate: string;
}

interface Product {
  uid: string;
  title: string;
  variety: string;
  quantity: number;
  acres: number;
  status: string; // "pending" | "approved" | "in_transit" | "rejected"
  description: string;
  qr_code_data: string | null;
  images?: string[];
  farmer: Farmer;
  stages?: ProductStage[];
  transporter?: Transporter | null;
  transporter_note?: string;
  pid?: string;
}

interface AdminUser {
  id: number;
  name: string;
}

export default function ProductDetails() {
  const { uid } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [selectedTransporter, setSelectedTransporter] = useState<number | "">("");
  const [transporterNote, setTransporterNote] = useState("");
  const [allocating, setAllocating] = useState(false);
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const getValidAccessToken = async (): Promise<string | null> => {
    let token = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");
    if (!token && refresh) {
      const res = await fetch(`${API_BASE}/token/refresh/`, {
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
      const res = await fetch(`${API_BASE}/sacco_admin/products/${uid}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  const fetchTransporters = async () => {
    const token = await getValidAccessToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/transporters/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTransporters(data);
      }
    } catch (err) {
      console.error("Failed to load transporters", err);
    }
  };

  const handleAction = async (action: "approve" | "reject") => {
    setError(null);
    const token = await getValidAccessToken();
    if (!token || !product) return;

    try {
      const res = await fetch(
        `${API_BASE}/sacco_admin/products/${product.uid}/decision/`,
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
      setProduct((prev) => ({ ...(prev as Product), ...data }));

      if (data.status === "approved") {
        alert("Product approved. PID: " + data.pid);
        fetchTransporters();
      } else {
        alert("Product rejected.");
      }
    } catch (err) {
      console.error(err);
      setError("Action failed");
    }
  };

  const handleAllocate = async () => {
    if (!selectedTransporter || !product) return;

    setAllocating(true);
    const token = await getValidAccessToken();
    if (!token) {
      setError("Authentication failed");
      setAllocating(false);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/products/${product.uid}/allocate/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            transporter_id: selectedTransporter,
            note: transporterNote,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Allocation failed");
        return;
      }

      const data = await res.json();

      // Update product with new status & transporter
      setProduct((prev) => ({ ...(prev as Product), ...data }));
      setShowAllocationDialog(false);
      alert(`Product allocated! Status: IN TRANSIT`);
    } catch (err) {
      setError("Network error");
    } finally {
      setAllocating(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.is_sacco_admin) {
        window.location.href = "/dashboard";
        return;
      }
      setAdmin({ id: decoded.user_id, name: decoded.name || "Admin" });
    } catch (err) {
      localStorage.clear();
      window.location.href = "/login";
    }
    fetchProduct();
  }, [uid]);

  useEffect(() => {
    if (product?.status === "approved" && !product.transporter) {
      fetchTransporters();
    }
  }, [product?.status]);

  // Status config
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "PENDING", color: "#ef6c00", bg: "#fff3e0" };
      case "approved":
        return { label: "APPROVED", color: "#2e7d32", bg: "#e8f5e9" };
      case "in_transit":
        return { label: "IN TRANSIT", color: "#1565c0", bg: "#e3f2fd" };
      case "rejected":
        return { label: "REJECTED", color: "#c62828", bg: "#ffebee" };
      default:
        return { label: status.toUpperCase(), color: "#666", bg: "#f5f5f5" };
    }
  };

  const statusConfig = product ? getStatusConfig(product.status) : null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#1a3c34",
        borderTop: "4px double #1a3c34",
        borderBottom: "4px double #1a3c34",
        position: "relative",
      }}
    >
      <TopNavBar />

      {/* Profile Top Right */}
      {admin && (
        <Box
          sx={{
            position: "absolute",
            top: 100,
            right: { xs: 16, md: 32 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            zIndex: 10,
          }}
        >
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: "#1a3c34",
              fontSize: "2rem",
              fontWeight: 800,
              border: "4px double #2f855a",
              boxShadow: "0 6px 20px rgba(26,60,52,0.2)",
            }}
          >
            {admin.name.charAt(0)}
          </Avatar>
          <Typography
            sx={{
              fontFamily: '"Georgia", serif',
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "#1a3c34",
            }}
          >
            {admin.name}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#2f855a",
              textTransform: "uppercase",
              letterSpacing: "1.2px",
            }}
          >
            SACCO ADMIN
          </Typography>
        </Box>
      )}

      {/* Logout Bottom Right */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          startIcon={<LogOut size={18} />}
          onClick={handleLogout}
          sx={{
            background: "#c62828",
            color: "#fff",
            fontWeight: 700,
            py: 1.5,
            px: 3,
            borderRadius: 0,
            boxShadow: "0 8px 24px rgba(198,40,40,0.35)",
            "&:hover": { background: "#b71c1c" },
          }}
        >
          Logout
        </Button>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 10, md: 12 }, pb: 16 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            sx={{
              fontFamily: '"Georgia", serif',
              fontSize: { xs: "2.3rem", md: "3.2rem" },
              fontWeight: 800,
              letterSpacing: "-0.05em",
              color: "#1a3c34",
              mb: 1,
            }}
          >
            PRODUCT CERTIFICATE
          </Typography>
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#2f855a",
              letterSpacing: "2.2px",
              textTransform: "uppercase",
            }}
          >
            FairTrace Authority • Official Record
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <CircularProgress size={56} sx={{ color: "#2f855a" }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3, fontWeight: 600 }}>
            {error}
          </Alert>
        ) : product ? (
          <Box
            sx={{
              background: "#ffffff",
              border: "4px double #1a3c34",
              boxShadow: "0 16px 50px rgba(26, 60, 52, 0.16)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Official Seal */}
            <Box
              sx={{
                position: "absolute",
                top: -18,
                right: 18,
                width: 72,
                height: 72,
                border: "5px double #1a3c34",
                borderRadius: "50%",
                bgcolor: "#ffffff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.52rem",
                fontWeight: 800,
                color: "#1a3c34",
                boxShadow: "0 8px 24px rgba(26, 60, 52, 0.22)",
                zIndex: 10,
              }}
            >
              <Stamp style={{ fontSize: 24 }} />
              CERTIFIED<br />PRODUCT
            </Box>

            <Box sx={{ p: { xs: 4, md: 6 } }}>
              {/* Title */}
              <Typography
                sx={{
                  fontFamily: '"Georgia", serif',
                  fontSize: { xs: "1.8rem", md: "2.4rem" },
                  fontWeight: 800,
                  color: "#1a3c34",
                  mb: 2,
                  textAlign: "center",
                }}
              >
                {product.title} ({product.variety})
              </Typography>

              {/* Status & PID */}
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
                {statusConfig && (
                  <Box
                    sx={{
                      bgcolor: statusConfig.bg,
                      color: statusConfig.color,
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      px: 2,
                      py: 0.8,
                      borderRadius: 1,
                      minWidth: 120,
                      textAlign: "center",
                    }}
                  >
                    STATUS: {statusConfig.label}
                  </Box>
                )}
                {product.pid && (
                  <Box
                    sx={{
                      bgcolor: "#e3f2fd",
                      color: "#1565c0",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      px: 2,
                      py: 0.8,
                      borderRadius: 1,
                    }}
                  >
                    PID: {product.pid}
                  </Box>
                )}
              </Box>

              {/* TRANSPORTER CARD - SHOWS BELOW STATUS */}
              {product.transporter && (
                <Box
                  sx={{
                    border: "3px double #1565c0",
                    background: "#e3f2fd",
                    p: 3,
                    mb: 4,
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontWeight: 800,
                      color: "#0d47a1",
                      fontSize: "1.1rem",
                      mb: 2,
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <LocalShipping sx={{ fontSize: 22 }} /> ASSIGNED TRANSPORTER
                  </Typography>
                  <Box sx={{ textAlign: "center", mb: 1 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.3rem", color: "#0d47a1" }}>
                      {product.transporter.name}
                    </Typography>
                  </Box>
                  <Box sx={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                    <Typography><strong>Vehicle:</strong> {product.transporter.vehicle} ({product.transporter.license_plate})</Typography>
                    <Typography><strong>Phone:</strong> {product.transporter.phone}</Typography>
                    <Typography><strong>Email:</strong> {product.transporter.email}</Typography>
                  </Box>
                  {product.transporter_note && (
                    <Box sx={{ mt: 2, p: 2, background: "#fff", borderLeft: "4px solid #1565c0", fontSize: "0.9rem" }}>
                      <Typography sx={{ fontStyle: "italic", color: "#0d47a1" }}>
                        "{product.transporter_note}"
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Description */}
              <Typography
                sx={{
                  color: "#1a3c34",
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  mb: 4,
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                {product.description}
              </Typography>

              {/* Farmer Card */}
              <Box
                sx={{
                  border: "3px double #1a3c34",
                  background: "#f8faf9",
                  p: 3,
                  mb: 4,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Courier New", monospace',
                    fontWeight: 800,
                    color: "#2f855a",
                    fontSize: "1rem",
                    mb: 2,
                    textAlign: "center",
                    letterSpacing: "1px",
                  }}
                >
                  FARMER INFORMATION
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography sx={{ fontWeight: 600, color: "#1a3c34" }}>
                    Name: <strong>{product.farmer.first_name}</strong>
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: "#1a3c34" }}>
                    Email: {product.farmer.email}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: "#1a3c34" }}>
                    Phone: {product.farmer.phone_number}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: "#1a3c34" }}>
                    Location: {product.farmer.location}
                  </Typography>
                </Box>
              </Box>

              {/* Product Info */}
              <Box sx={{ display: "flex", justifyContent: "center", gap: 4, mb: 4 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontWeight: 700, color: "#1a3c34", fontSize: "1.1rem" }}>
                    {product.quantity}
                  </Typography>
                  <Typography sx={{ color: "#666", fontSize: "0.85rem" }}>QUANTITY</Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontWeight: 700, color: "#1a3c34", fontSize: "1.1rem" }}>
                    {product.acres}
                  </Typography>
                  <Typography sx={{ color: "#666", fontSize: "0.85rem" }}>ACRES</Typography>
                </Box>
              </Box>

              {/* QR Code */}
              {product.qr_code_data && (
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontWeight: 800,
                      color: "#2f855a",
                      fontSize: "1rem",
                      mb: 2,
                      letterSpacing: "1px",
                    }}
                  >
                    OFFICIAL QR CODE
                  </Typography>
                  <Box
                    sx={{
                      display: "inline-block",
                      p: 2,
                      border: "3px double #1a3c34",
                      background: "#fff",
                      borderRadius: 2,
                    }}
                  >
                    <img
                      src={product.qr_code_data}
                      alt="QR Code"
                      style={{ width: "160px", height: "160px" }}
                    />
                  </Box>
                </Box>
              )}

              {/* Images */}
              {product.images?.length ? (
                <Box sx={{ mb: 4 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontWeight: 800,
                      color: "#2f855a",
                      fontSize: "1rem",
                      mb: 2,
                      textAlign: "center",
                      letterSpacing: "1px",
                    }}
                  >
                    PRODUCT IMAGES
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
                    {product.images.map((img, i) => (
                      <Box
                        key={i}
                        sx={{
                          border: "2px solid #1a3c34",
                          borderRadius: 1,
                          overflow: "hidden",
                          boxShadow: "0 4px 12px rgba(26,60,52,0.15)",
                        }}
                      >
                        <img
                          src={img}
                          alt={`Product ${i + 1}`}
                          style={{ width: "120px", height: "120px", objectFit: "cover" }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : null}

              {/* Stages Table */}
              {product.stages?.length ? (
                <Box sx={{ mb: 4 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontWeight: 800,
                      color: "#2f855a",
                      fontSize: "1rem",
                      mb: 2,
                      textAlign: "center",
                      letterSpacing: "1px",
                    }}
                  >
                    SUPPLY CHAIN STAGES
                  </Typography>
                  <TableContainer sx={{ border: "2px solid #1a3c34" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ background: "#f8faf9" }}>
                          <TableCell sx={{ fontWeight: 700, color: "#1a3c34" }}>Stage</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: "#1a3c34" }}>Qty</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: "#1a3c34" }}>Location</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: "#1a3c34" }}>QR</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {product.stages.map((stage) => (
                          <TableRow key={stage.id}>
                            <TableCell sx={{ color: "#1a3c34" }}>{stage.stage_name}</TableCell>
                            <TableCell sx={{ color: "#1a3c34" }}>{stage.quantity}</TableCell>
                            <TableCell sx={{ color: "#1a3c34" }}>{stage.location}</TableCell>
                            <TableCell sx={{ color: stage.scanned_qr ? "#2f855a" : "#c62828", fontWeight: 700 }}>
                              {stage.scanned_qr ? "YES" : "NO"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : null}

              {/* ADMIN REVIEW - Only for pending */}
              {product.status === "pending" && (
                <Box sx={{ mb: 4 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontWeight: 800,
                      color: "#2f855a",
                      fontSize: "1rem",
                      mb: 2,
                      textAlign: "center",
                      letterSpacing: "1px",
                    }}
                  >
                    ADMIN REVIEW
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Enter review comments..."
                    sx={{
                      mb: 3,
                      "& .MuiInputBase-root": { background: "#f8faf9" },
                      "& .MuiInputLabel-root": { color: "#1a3c34", fontWeight: 600 },
                    }}
                  />
                  <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
                    <Button
                      variant="contained"
                      startIcon={<CheckCircle size={18} />}
                      onClick={() => handleAction("approve")}
                      sx={{
                        background: "#2f855a",
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: 0,
                        boxShadow: "0 8px 24px rgba(47,133,90,0.35)",
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<XCircle size={18} />}
                      onClick={() => handleAction("reject")}
                      sx={{
                        background: "#c62828",
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: 0,
                        boxShadow: "0 8px 24px rgba(198,40,40,0.35)",
                      }}
                    >
                      Reject
                    </Button>
                  </Box>
                </Box>
              )}

              {/* ASSIGN BUTTON - ONLY if approved AND no transporter */}
              {product.status === "approved" && !product.transporter && (
                <Box sx={{ textAlign: "center", mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<LocalShipping fontSize="small" />}
                    onClick={() => setShowAllocationDialog(true)}
                    sx={{
                      background: "#2f855a",
                      fontWeight: 700,
                      py: 1.8,
                      px: 4,
                      borderRadius: 0,
                      boxShadow: "0 8px 24px rgba(47,133,90,0.35)",
                    }}
                  >
                    Assign Transporter
                  </Button>
                </Box>
              )}

              {/* IN TRANSIT MESSAGE */}
              {product.status === "in_transit" && (
                <Box sx={{ textAlign: "center", mt: 3 }}>
                  <Alert severity="info" sx={{ fontWeight: 600 }}>
                    This product is <strong>IN TRANSIT</strong>. Only the assigned transporter can update it.
                  </Alert>
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <Typography sx={{ textAlign: "center", py: 10, fontSize: "1.2rem", color: "#666" }}>
            No product found.
          </Typography>
        )}
      </Container>

      {/* Allocation Dialog */}
      <Dialog open={showAllocationDialog} onClose={() => setShowAllocationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            background: "#1a3c34",
            color: "#fff",
            fontWeight: 800,
            fontFamily: '"Georgia", serif',
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          ASSIGN TRANSPORTER
          <IconButton onClick={() => setShowAllocationDialog(false)} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, background: "#f8faf9" }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            This will change status to <strong>IN TRANSIT</strong> and <strong>lock allocation</strong>.
          </Alert>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel sx={{ color: "#1a3c34", fontWeight: 600 }}>Select Transporter</InputLabel>
            <Select
              value={selectedTransporter}
              onChange={(e) => setSelectedTransporter(e.target.value as number)}
              label="Select Transporter"
              sx={{ background: "#fff" }}
            >
              {transporters.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name} — {t.vehicle} ({t.license_plate})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Note to Transporter"
            value={transporterNote}
            onChange={(e) => setTransporterNote(e.target.value)}
            placeholder="e.g., Deliver to Nairobi by Friday. Contact farmer at 8 AM."
            sx={{
              "& .MuiInputBase-root": { background: "#fff" },
              "& .MuiInputLabel-root": { color: "#1a3c34", fontWeight: 600 },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, background: "#f8faf9", justifyContent: "center" }}>
          <Button
            onClick={() => setShowAllocationDialog(false)}
            disabled={allocating}
            sx={{ color: "#1a3c34", fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAllocate}
            disabled={!selectedTransporter || allocating}
            sx={{
              background: "#1565c0",
              color: "#fff",
              fontWeight: 700,
              px: 4,
              borderRadius: 0,
            }}
          >
            {allocating ? <CircularProgress size={20} color="inherit" /> : "Assign & Start Transit"}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
}