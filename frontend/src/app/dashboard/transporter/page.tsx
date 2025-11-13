// app/dashboard/transporter/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Truck, MapPin, CheckCircle, XCircle, Stamp, LogOut } from "lucide-react";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "@/app/components/FooterSection";
import { jwtDecode } from "jwt-decode";

interface Transporter {
  id: number;
  name: string;
}

interface DeliveryRequest {
  id: number;
  pickup: string;
  dropoff: string;
  weight: string;
  eta: string;
}

interface JwtPayload {
  user_id: number;
  is_transporter?: boolean;
  exp: number;
}

export default function TransporterDashboard() {
  const [transporter, setTransporter] = useState<Transporter | null>(null);
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const decoded: JwtPayload = jwtDecode(token);
      if (!decoded.is_transporter) {
        window.location.href = "/dashboard";
        return;
      }

      fetchTransporter(token);
      fetchRequests(token);
    } catch (err) {
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  const fetchTransporter = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/logistics/transporters/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTransporter({ id: data.id, name: data.name });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/logistics/delivery-requests/pending/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (id: number) => {
    alert(`Accepted delivery #${id}. Update pickup location now.`);
  };

  const handleReject = (id: number) => {
    alert(`Rejected delivery #${id}`);
  };

  const handleUpdateLocation = (id: number) => {
    alert(`Update pickup location for delivery #${id}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Truck size={56} color="#2f855a" />
        <Typography sx={{ color: "#1a3c34", fontWeight: 700, fontSize: "1.2rem" }}>
          Loading Dispatch Terminal...
        </Typography>
      </Box>
    );
  }

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

      {/* Header + Profile Top Right */}
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
          {transporter?.name.charAt(0)}
        </Avatar>
        <Typography
          sx={{
            fontFamily: '"Georgia", serif',
            fontSize: "1.1rem",
            fontWeight: 800,
            color: "#1a3c34",
          }}
        >
          {transporter?.name}
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
          ID: #{transporter?.id}
        </Typography>
      </Box>

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
        {/* Title */}
        <Typography
          sx={{
            fontFamily: '"Georgia", serif',
            fontSize: { xs: "2.3rem", md: "3rem" },
            fontWeight: 800,
            letterSpacing: "-0.05em",
            color: "#1a3c34",
            textAlign: "center",
            mb: 5,
          }}
        >
          DELIVERY REQUESTS
        </Typography>

        {/* Requests List */}
        <Stack spacing={3.5}>
          {requests.map((req) => (
            <Card
              key={req.id}
              sx={{
                background: "#ffffff",
                border: "3px double #1a3c34",
                boxShadow: "0 12px 40px rgba(26, 60, 52, 0.14)",
              }}
            >
              <CardContent sx={{ pb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 700, color: "#1a3c34", fontSize: "0.95rem" }}>
                    REQUEST #{req.id}
                  </Typography>
                  <Tooltip title="Update Pickup Location">
                    <IconButton
                      onClick={() => handleUpdateLocation(req.id)}
                      sx={{
                        color: "#2f855a",
                        border: "2px solid #2f855a",
                        width: 40,
                        height: 40,
                      }}
                    >
                      <MapPin size={18} />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Stack spacing={1.5}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <MapPin size={18} color="#2f855a" />
                    <Typography sx={{ fontWeight: 600, color: "#1a3c34", fontSize: "0.98rem" }}>
                      <strong>Pickup:</strong> {req.pickup}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Typography sx={{ fontWeight: 600, color: "#1a3c34", fontSize: "0.98rem" }}>
                      <strong>Dropoff:</strong> {req.dropoff}
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                    <Typography sx={{ color: "#1a3c34", fontSize: "0.9rem" }}>
                      ETA: {req.eta}
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: "#1a3c34", fontSize: "0.9rem" }}>
                      Weight: {req.weight}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CheckCircle size={18} />}
                    onClick={() => handleAccept(req.id)}
                    sx={{
                      background: "#2f855a",
                      fontWeight: 700,
                      py: 1.8,
                      borderRadius: "0px",
                      boxShadow: "0 8px 24px rgba(47,133,90,0.35)",
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<XCircle size={18} />}
                    onClick={() => handleReject(req.id)}
                    sx={{
                      border: "2px solid #c62828",
                      color: "#c62828",
                      fontWeight: 700,
                      py: 1.8,
                      borderRadius: "0px",
                    }}
                  >
                    Reject
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Empty State */}
        {requests.length === 0 && (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Truck size={72} color="#ccc" />
            <Typography sx={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a3c34", mt: 2 }}>
              No Pending Requests
            </Typography>
            <Typography sx={{ color: "#666", mt: 1, fontSize: "0.95rem" }}>
              New delivery requests will appear here when assigned.
            </Typography>
            <Box
              sx={{
                mt: 3,
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
                background: "#ffffff",
                px: 4,
                py: 2,
                border: "3px double #1a3c34",
                boxShadow: "0 8px 24px rgba(26,60,52,0.12)",
              }}
            >
              <Stamp size={26} color="#2f855a" />
              <Typography sx={{ fontWeight: 700, color: "#1a3c34", fontSize: "0.95rem" }}>
                Status: Online • Awaiting Assignment
              </Typography>
            </Box>
          </Box>
        )}
      </Container>

      <Footer />
    </Box>
  );
}