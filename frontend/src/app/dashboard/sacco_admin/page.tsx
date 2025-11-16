"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Avatar,
} from "@mui/material";
import { Stamp, LogOut, CheckCircle, XCircle } from "lucide-react";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "@/app/components/FooterSection";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

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
  description: string;
  stages?: ProductStage[];
}

interface AdminUser {
  id: number;
  name: string;
}

export default function SaccoAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [review, setReview] = useState("");
  const [loadingStages, setLoadingStages] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  /* --------------------------------------------------------------- */
  /* 1. AUTH & INITIAL FETCH */
  /* --------------------------------------------------------------- */
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
      fetchProducts(token);
    } catch (err) {
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

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

  /* --------------------------------------------------------------- */
  /* 2. FETCH PRODUCTS — NOW MATCHES DETAIL PAGE RESPONSE */
  /* --------------------------------------------------------------- */
  const fetchProducts = async (token: string) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/sacco_admin/products/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Failed to fetch products.");
        return;
      }
      const data = await res.json();

      const mappedProducts: Product[] = data.map((p: any) => {
        const f = p.farmer || {};
        return {
          uid: p.uid,
          title: p.title,
          variety: p.variety,
          quantity: p.quantity,
          acres: p.acres,
          status: p.status,
          description: p.description,
          farmer: {
            first_name: f.first_name || "Unknown",
            email: f.email || "N/A",
            phone_number: f.phone_number || "N/A",
            location: f.location || "N/A",
          },
        };
      });

      setProducts(mappedProducts);
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  /* --------------------------------------------------------------- */
  /* 3. FETCH STAGES */
  /* --------------------------------------------------------------- */
  const fetchProductStages = async (product: Product) => {
    setLoadingStages(true);
    const token = await getValidAccessToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/sacco_admin/products/${product.uid}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const detail = await res.json();
      setSelectedProduct({ ...product, stages: detail.stages || [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStages(false);
    }
  };

  /* --------------------------------------------------------------- */
  /* 4. APPROVE / REJECT */
  /* --------------------------------------------------------------- */
  const handleAction = async (product: Product, action: "approve" | "reject") => {
    const token = await getValidAccessToken();
    if (!token) return;
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
      if (!res.ok) throw new Error("Action failed");
      const updated = await res.json();
      setProducts((prev) => prev.map((p) => (p.uid === updated.uid ? updated : p)));
      setSelectedProduct(null);
      setReview("");
    } catch (err) {
      setError("Failed to process action.");
    }
  };

  /* --------------------------------------------------------------- */
  /* 5. UPDATE STATUS */
  /* --------------------------------------------------------------- */
  const handleStatusChange = async (uid: string, newStatus: string) => {
    setUpdatingStatus(uid);
    const token = await getValidAccessToken();
    if (!token) return;
    try {
      const res = await fetch(
        `${API_BASE}/sacco_admin/products/${uid}/update_status/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setProducts((prev) => prev.map((p) => (p.uid === updated.uid ? updated : p)));
    } catch (err) {
      setError("Failed to update status.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  /* --------------------------------------------------------------- */
  /* 6. LOGOUT & NAV */
  /* --------------------------------------------------------------- */
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleRowClick = (uid: string) => {
    router.push(`/dashboard/sacco_admin/${uid}`);
  };

  const stageOptions = [
    { value: "approved", label: "Approved" },
    { value: "harvested", label: "Harvested" },
    { value: "in_transit", label: "In Transit" },
    { value: "delivered", label: "Delivered" },
  ];

  /* --------------------------------------------------------------- */
  /* 7. RENDER */
  /* --------------------------------------------------------------- */
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

      {/* Admin Profile */}
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

      {/* Logout Button */}
      <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
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

      <Container maxWidth="xl" sx={{ py: { xs: 10, md: 12 }, pb: 16 }}>
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
            SACCO ADMIN PANEL
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
            FairTrace Authority • Product Certification
          </Typography>
        </Box>

        {/* Table */}
        <Box
          sx={{
            background: "#ffffff",
            border: "4px double #1a3c34",
            boxShadow: "0 16px 50px rgba(26, 60, 52, 0.16)",
            position: "relative",
            overflow: "hidden",
          }}
        >
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
            OFFICIAL<br />RECORDS
          </Box>

          <TableContainer sx={{ maxHeight: "70vh" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow
                  sx={{
                    background: "#f8faf9",
                    borderBottom: "3px double #1a3c34",
                  }}
                >
                  {[
                    "Title",
                    "Variety",
                    "Farmer",
                    "Email",
                    "Phone",
                    "Location",
                    "Qty",
                    "Acres",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        fontFamily: '"Courier New", monospace',
                        fontWeight: 800,
                        color: "#1a3c34",
                        fontSize: "0.85rem",
                        py: 1.5,
                        letterSpacing: "1px",
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => {
                  const { farmer } = product;
                  const isApproved = [
                    "approved",
                    "harvested",
                    "in_transit",
                    "delivered",
                  ].includes(product.status.toLowerCase());

                  return (
                    <TableRow
                      key={product.uid}
                      onClick={() => handleRowClick(product.uid)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": { background: "#f0f7f3" },
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#1a3c34", fontSize: "0.88rem" }}>
                        {product.title}
                      </TableCell>
                      <TableCell sx={{ color: "#1a3c34", fontSize: "0.88rem" }}>{product.variety}</TableCell>
                      <TableCell sx={{ color: "#1a3c34", fontSize: "0.88rem" }}>
                        {farmer.first_name}
                      </TableCell>
                      <TableCell sx={{ color: "#1a3c34", fontSize: "0.88rem" }}>{farmer.email}</TableCell>
                      <TableCell sx={{ color: "#1a3c34", fontSize: "0.88rem" }}>
                        {farmer.phone_number}
                      </TableCell>
                      <TableCell sx={{ color: "#1a3c34", fontSize: "0.88rem" }}>{farmer.location}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#1a3c34", fontSize: "0.88rem" }}>
                        {product.quantity}
                      </TableCell>
                      <TableCell sx={{ color: "#1a3c34", fontSize: "0.88rem" }}>{product.acres}</TableCell>

                      <TableCell>
                        <Box
                          sx={{
                            bgcolor:
                              product.status === "pending"
                                ? "#fff3e0"
                                : product.status === "approved"
                                ? "#e8f5e9"
                                : product.status === "harvested"
                                ? "#e3f2fd"
                                : product.status === "in_transit"
                                ? "#fff8e1"
                                : "#ffebee",
                            color:
                              product.status === "pending"
                                ? "#ef6c00"
                                : product.status === "approved"
                                ? "#2e7d32"
                                : product.status === "harvested"
                                ? "#1565c0"
                                : product.status === "in_transit"
                                ? "#ff8f00"
                                : "#c62828",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            textAlign: "center",
                          }}
                        >
                          {product.status.toUpperCase()}
                        </Box>
                      </TableCell>

                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {isApproved ? (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <FormControl size="small" sx={{ minWidth: 110 }}>
                              <Select
                                value={product.status}
                                onChange={(e: SelectChangeEvent) => {
                                  e.stopPropagation();
                                  const val = e.target.value;
                                  if (val !== product.status) {
                                    handleStatusChange(product.uid, val);
                                  }
                                }}
                                disabled={updatingStatus === product.uid}
                                sx={{
                                  fontSize: "0.8rem",
                                  "& .MuiSelect-select": { py: 0.8 },
                                }}
                              >
                                {stageOptions.map((opt) => (
                                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.8rem" }}>
                                    {opt.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            {updatingStatus === product.uid && (
                              <CircularProgress size={14} thickness={5} />
                            )}
                          </Box>
                        ) : product.status.toLowerCase() === "pending" ? (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchProductStages(product);
                            }}
                            sx={{
                              fontFamily: '"Courier New", monospace',
                              fontWeight: 700,
                              color: "#2f855a",
                              border: "2px solid #2f855a",
                              fontSize: "0.78rem",
                              py: 0.8,
                              px: 2,
                              borderRadius: 0,
                              "&:hover": {
                                background: "#2f855a",
                                color: "#fff",
                              },
                            }}
                          >
                            REVIEW
                          </Button>
                        ) : (
                          <Typography sx={{ fontSize: "0.78rem", color: "#666", fontStyle: "italic" }}>
                            {product.status}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Empty State */}
        {products.length === 0 && !error && (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography sx={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a3c34", mt: 2 }}>
              No Products Found
            </Typography>
            <Typography sx={{ color: "#666", mt: 1, fontSize: "0.95rem" }}>
              New farmer registrations will appear here for review.
            </Typography>
          </Box>
        )}
      </Container>

      {/* REVIEW DIALOG */}
      <Dialog open={!!selectedProduct} onClose={() => setSelectedProduct(null)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            background: "#f8faf9",
            borderBottom: "3px double #1a3c34",
            fontFamily: '"Georgia", serif',
            fontWeight: 800,
            color: "#1a3c34",
            py: 2,
          }}
        >
          REVIEW: {selectedProduct?.title}
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {loadingStages ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress size={36} sx={{ color: "#2f855a" }} />
            </Box>
          ) : (
            <>
              {selectedProduct?.stages?.length ? (
                <Table size="small" sx={{ mb: 3 }}>
                  <TableHead>
                    <TableRow sx={{ background: "#f8faf9" }}>
                      <TableCell sx={{ fontWeight: 700, color: "#1a3c34" }}>Stage</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#1a3c34" }}>Qty</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#1a3c34" }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#1a3c34" }}>QR</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedProduct.stages.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell sx={{ color: "#1a3c34" }}>{s.stage_name}</TableCell>
                        <TableCell sx={{ color: "#1a3c34" }}>{s.quantity || "-"}</TableCell>
                        <TableCell sx={{ color: "#1a3c34" }}>{s.location || "-"}</TableCell>
                        <TableCell sx={{ color: s.scanned_qr ? "#2f855a" : "#c62828", fontWeight: 700 }}>
                          {s.scanned_qr ? "YES" : "NO"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography sx={{ color: "#666", mb: 2 }}>No stages recorded.</Typography>
              )}

              <TextField
                label="Admin Review"
                multiline
                rows={3}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                fullWidth
                sx={{
                  mb: 3,
                  "& .MuiInputBase-root": { background: "#f8faf9" },
                  "& .MuiInputLabel-root": { color: "#1a3c34", fontWeight: 600 },
                }}
              />

              <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  startIcon={<CheckCircle size={18} />}
                  onClick={() => handleAction(selectedProduct!, "approve")}
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
                  onClick={() => handleAction(selectedProduct!, "reject")}
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
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </Box>
  );
}