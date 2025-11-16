"use client";
import React, { useState, useEffect, useRef } from "react";
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
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Paper,
  Divider,
} from "@mui/material";
import {
  Truck,
  MapPin,
  CheckCircle,
  XCircle,
  Package,
  LogOut,
  User,
  Navigation,
  Clock,
  Scale,
  Stamp,
} from "lucide-react";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "@/app/components/FooterSection";
import { jwtDecode } from "jwt-decode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// -------------------------------
// THEME - MATCH CERTIFICATE PAGE
// -------------------------------
const theme = createTheme({
  palette: {
    primary: { main: "#1a3c34" },
    secondary: { main: "#2f855a" },
    success: { main: "#2f855a" },
    error: { main: "#c62828" },
    background: { default: "#f8faf9" },
  },
  typography: {
    fontFamily: '"Georgia", "Times New Roman", serif',
    h3: { fontWeight: 700 },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { border: "2px solid #1a3c34", background: "#fff", boxShadow: "none" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { border: "3px double #1a3c34", background: "#fff", boxShadow: "none" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 0,
          padding: "10px 20px",
          minHeight: "44px",
          "&:hover": { backgroundColor: "inherit" },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { borderBottom: "2px solid #1a3c34" },
        indicator: { backgroundColor: "#1a3c34" },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.95rem",
          padding: "8px 16px",
          minHeight: "40px",
        },
      },
    },
  },
});

interface Farmer {
  first_name: string;
  location: string;
}

interface DeliveryRequest {
  uid: string;
  pid?: string;
  title: string;
  variety: string;
  quantity: number;
  farmer: Farmer;
  origin_address: string;
  dropoff: string;
  eta: string;
  weight: string;
  transporter_note?: string;
  status: "approved" | "in_transit" | "delivered";
}

interface Transporter {
  id: number;
  name: string;
}

interface JwtPayload {
  user_id: number;
  is_transporter?: boolean;
  exp: number;
}

export default function TransporterDashboard() {
  const [transporter, setTransporter] = useState<Transporter | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  const certificateRef = useRef<HTMLDivElement>(null);

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
      fetchDeliveries(token);

      const interval = setInterval(() => fetchDeliveries(token), 45000);
      return () => clearInterval(interval);
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

  const fetchDeliveries = async (token: string) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/logistics/transporters/me/products/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((p: any) => ({
          uid: p.uid,
          pid: p.pid,
          title: p.title,
          variety: p.variety,
          quantity: p.quantity,
          farmer: {
            first_name: p.farmer?.first_name || "Unknown",
            location: p.farmer?.location || "Unknown",
          },
          origin_address: p.origin_address || "Not specified",
          dropoff: p.dropoff || "Not specified",
          eta: p.eta || "N/A",
          weight: p.weight || `${p.quantity} kg`,
          transporter_note: p.transporter_note,
          status: p.status,
        }));
        setDeliveries(mapped);
      } else {
        setError("Failed to load deliveries");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (uid: string) => {
    const token = localStorage.getItem("access");
    if (!token) return;
    setDeliveries(prev => prev.map(d => (d.uid === uid ? { ...d, status: "in_transit" } : d)));
    try {
      const res = await fetch(`${API_BASE}/logistics/delivery/${uid}/accept/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) { const err = await res.json(); alert(`Failed: ${err.detail}`); fetchDeliveries(token); }
    } catch { alert("Network error"); fetchDeliveries(token); }
  };

  const handleReject = async (uid: string) => {
    if (!confirm("Reject this delivery?")) return;
    const token = localStorage.getItem("access");
    if (!token) return;
    setDeliveries(prev => prev.filter(d => d.uid !== uid));
    try {
      const res = await fetch(`${API_BASE}/logistics/delivery/${uid}/reject/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) { const err = await res.json(); alert(`Reject failed: ${err.detail}`); fetchDeliveries(token); }
    } catch { alert("Network error"); }
  };

  const handleComplete = async (uid: string) => {
    const token = localStorage.getItem("access");
    if (!token) return;
    setDeliveries(prev => prev.map(d => (d.uid === uid ? { ...d, status: "delivered" } : d)));
    try {
      const res = await fetch(`${API_BASE}/logistics/delivery/${uid}/complete/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) { const err = await res.json(); alert(`Failed: ${err.detail}`); fetchDeliveries(token); }
    } catch { alert("Network error"); fetchDeliveries(token); }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    const canvas = await html2canvas(certificateRef.current, { scale: 2, backgroundColor: "#fff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`Transporter_Dispatch_${transporter?.id}.pdf`);
  };

  const pending = deliveries.filter(d => d.status === "approved");
  const inTransit = deliveries.filter(d => d.status === "in_transit");
  const delivered = deliveries.filter(d => d.status === "delivered");
  const currentList = activeTab === 0 ? pending : activeTab === 1 ? inTransit : delivered;

  const getRequestId = (req: DeliveryRequest) => req.pid || req.uid.slice(0, 8).toUpperCase();

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#f8faf9" }}>
          <CircularProgress sx={{ color: "#1a3c34" }} size={56} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#f8faf9" }}>
        {/* Fixed Top Nav */}
        <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1300, bgcolor: "#fff", borderBottom: "1px solid #1a3c34" }}>
          <TopNavBar />
        </Box>

        <Box sx={{ flex: 1, pt: "70px", pb: 4 }}>
          <Container maxWidth="md" sx={{ py: 2 }}>
            {/* Title */}
            <Typography variant="h3" sx={{ fontSize: "2.2rem", fontWeight: 700, color: "#1a3c34", textAlign: "center", mb: 1, fontFamily: '"Georgia", serif' }}>
              DISPATCH TERMINAL
            </Typography>
            <Typography sx={{ textAlign: "center", color: "#2f855a", fontSize: "0.9rem", fontWeight: 600, letterSpacing: "1.5px", mb: 3 }}>
              FairTrace Logistics • Official Assignments
            </Typography>

            {/* Tabs */}
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} centered sx={{ mb: 2 }}>
              <Tab label={`Pending (${pending.length})`} />
              <Tab label={`In Transit (${inTransit.length})`} />
              <Tab label={`Delivered (${delivered.length})`} />
            </Tabs>

            {error && <Alert severity="error" sx={{ mb: 2, fontWeight: 600 }}>{error}</Alert>}

            {/* Cards Container */}
            <Box ref={certificateRef}>
              <Stack spacing={3}>
                {currentList.map((req) => (
                  <Paper key={req.uid} elevation={0} sx={{ p: 3, position: "relative" }}>
                    {/* Official Seal */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: -12,
                        right: 12,
                        width: 68,
                        height: 68,
                        border: "5px double #1a3c34",
                        borderRadius: "50%",
                        bgcolor: "#fff",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.48rem",
                        fontWeight: 800,
                        color: "#1a3c34",
                        boxShadow: "0 6px 18px rgba(26,60,52,0.18)",
                        zIndex: 10,
                      }}
                    >
                      <Stamp style={{ fontSize: 20 }} />
                      ASSIGNED
                    </Box>

                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: "#1a3c34", fontSize: "0.95rem" }}>
                          REQUEST #{getRequestId(req)}
                        </Typography>
                        <Typography sx={{ fontSize: "0.82rem", color: "#2f855a", fontWeight: 600 }}>
                          {req.title} ({req.variety})
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ my: 1.5, borderColor: "#1a3c34" }} />

                    {/* Farmer */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, color: "#1a3c34" }}>
                      <User size={16} />
                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                        <strong>Farmer:</strong> {req.farmer.first_name}
                      </Typography>
                      <Chip label={req.farmer.location} size="small" sx={{ bgcolor: "#e8f5e9", color: "#2f855a", fontWeight: 600 }} />
                    </Box>

                    {/* Locations */}
                    <Stack spacing={1}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Navigation size={17} color="#2f855a" />
                        <Typography sx={{ fontWeight: 600, color: "#1a3c34", fontSize: "0.96rem" }}>
                          <strong>Pickup:</strong> {req.origin_address}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Typography sx={{ fontWeight: 600, color: "#1a3c34", fontSize: "0.96rem" }}>
                          <strong>Dropoff:</strong> {req.dropoff}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Details */}
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ mt: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Clock size={15} color="#666" />
                        <Typography sx={{ color: "#1a3c34", fontSize: "0.9rem" }}>ETA: {req.eta}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Scale size={15} color="#666" />
                        <Typography sx={{ fontWeight: 700, color: "#1a3c34", fontSize: "0.9rem" }}>
                          {req.quantity} units • {req.weight}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Note */}
                    {req.transporter_note && (
                      <Box sx={{ mt: 1.5, p: 1.5, background: "#f8faf9", borderLeft: "4px solid #2f855a", borderRadius: 1 }}>
                        <Typography sx={{ fontStyle: "italic", color: "#1a3c34", fontSize: "0.88rem" }}>
                          <strong>Note:</strong> "{req.transporter_note}"
                        </Typography>
                      </Box>
                    )}

                    {/* Actions */}
                    {activeTab === 0 && (
                      <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                        <Button fullWidth variant="contained" startIcon={<CheckCircle size={18} />} onClick={() => handleAccept(req.uid)}
                          sx={{ bgcolor: "#2f855a", color: "#fff", fontWeight: 700 }}>
                          Accept
                        </Button>
                        <Button fullWidth variant="outlined" startIcon={<XCircle size={18} />} onClick={() => handleReject(req.uid)}
                          sx={{ border: "2px solid #c62828", color: "#c62828", fontWeight: 700 }}>
                          Reject
                        </Button>
                      </Stack>
                    )}

                    {activeTab === 1 && (
                      <Box sx={{ mt: 2 }}>
                        <Button fullWidth variant="contained" startIcon={<Package size={20} />} onClick={() => handleComplete(req.uid)}
                          sx={{ bgcolor: "#2f855a", color: "#fff", fontWeight: 700, py: 1.8, fontSize: "1rem" }}>
                          Mark as Delivered
                        </Button>
                      </Box>
                    )}

                    {activeTab === 2 && (
                      <Box sx={{ mt: 2, textAlign: "center" }}>
                        <CheckCircle size={44} color="#2f855a" />
                        <Typography sx={{ color: "#2f855a", fontWeight: 700, fontSize: "1rem", mt: 1 }}>
                          Delivered Successfully
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Stack>

              {/* Empty State */}
              {currentList.length === 0 && (
                <Paper elevation={0} sx={{ p: 5, textAlign: "center" }}>
                  <Truck size={72} color="#ccc" />
                  <Typography sx={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a3c34", mt: 2 }}>
                    {activeTab === 0 && "No Pending Requests"}
                    {activeTab === 1 && "No Active Deliveries"}
                    {activeTab === 2 && "No Completed Deliveries Yet"}
                  </Typography>
                  <Typography sx={{ color: "#666", mt: 1, fontSize: "0.95rem" }}>
                    {activeTab === 0 && "New assignments will appear here when available."}
                    {activeTab === 1 && "Accepted jobs will show here."}
                    {activeTab === 2 && "Keep up the great work!"}
                  </Typography>
                </Paper>
              )}
            </Box>

            {/* Download PDF */}
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Button
                startIcon={<Stamp size={18} />}
                onClick={handleDownloadPDF}
                sx={{ color: "#1a3c34", border: "1px solid #1a3c34", fontWeight: 600 }}
              >
                Download Dispatch Report (PDF)
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{ borderTop: "1px solid #1a3c34", bgcolor: "#fff" }}>
          <Footer />
        </Box>

        {/* Logout Button */}
        <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
          <Button variant="contained" startIcon={<LogOut size={18} />} onClick={handleLogout}
            sx={{ bgcolor: "#c62828", color: "#fff", fontWeight: 700, py: 1.5, px: 3, borderRadius: 0 }}>
            Logout
          </Button>
        </Box>

        {/* Profile Top Right */}
        <Box sx={{ position: "fixed", top: 100, right: { xs: 16, md: 32 }, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, zIndex: 10 }}>
          <Avatar sx={{ width: 68, height: 68, bgcolor: "#1a3c34", fontSize: "1.9rem", fontWeight: 800, border: "4px double #2f855a" }}>
            {transporter?.name.charAt(0)}
          </Avatar>
          <Typography sx={{ fontFamily: '"Georgia", serif', fontSize: "1.05rem", fontWeight: 800, color: "#1a3c34" }}>
            {transporter?.name}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#2f855a", textTransform: "uppercase", letterSpacing: "1.2px" }}>
            ID: #{transporter?.id}
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}