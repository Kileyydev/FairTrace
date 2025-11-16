"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Avatar,
  Stack,
  CircularProgress,
  Alert,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Divider,
} from "@mui/material";
import {
  Truck,
  Package,
  CheckCircle,
  LogOut,
  User,
  Stamp,
  ArrowRight,
} from "lucide-react";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "@/app/components/FooterSection";
import { jwtDecode } from "jwt-decode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// -------------------------------
// THEME - SAME AS CERTIFICATE
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
  },
});

interface UserInfo {
  name: string;
  role: "transporter" | "sacco_admin" | "farmer" | "consumer" | "unknown";
  id?: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const role = decoded.is_transporter
        ? "transporter"
        : decoded.is_sacco_admin
        ? "sacco_admin"
        : decoded.is_farmer
        ? "farmer"
        : decoded.is_consumer
        ? "consumer"
        : "unknown";

      const name = decoded.name || decoded.full_name || decoded.username || "User";

      setUser({ name, role, id: decoded.user_id });

      // Auto-redirect based on role
      if (role === "transporter") {
        setTimeout(() => {
          window.location.href = "/dashboard/transporter";
        }, 1500);
      } else if (role === "sacco_admin") {
        setTimeout(() => {
          window.location.href = "/dashboard/sacco_admin";
        }, 1500);
      } else if (role === "farmer") {
        setTimeout(() => {
          window.location.href = "/dashboard/farmer";
        }, 1500);
      } else if (role === "consumer") {
        setTimeout(() => {
          window.location.href = "/consumer";
        }, 1500);
      }
    } catch (err) {
      localStorage.clear();
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }, []);

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
    pdf.save(`FairTrace_Dashboard_${user?.id || "User"}.pdf`);
  };

  const getRoleConfig = (role: string) => {
    switch (role) {
      case "transporter":
        return { label: "TRANSPORTER", icon: Truck, color: "#2f855a", bg: "#e8f5e9" };
      case "sacco_admin":
        return { label: "SACCO ADMIN", icon: Package, color: "#1565c0", bg: "#e3f2fd" };
      case "farmer":
        return { label: "FARMER", icon: User, color: "#ef6c00", bg: "#fff3e0" };
      case "consumer":
        return { label: "CONSUMER", icon: CheckCircle, color: "#2e7d32", bg: "#e8f5e9" };
      default:
        return { label: "USER", icon: User, color: "#666", bg: "#f5f5f5" };
    }
  };

  const roleConfig = user ? getRoleConfig(user.role) : null;

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
          <Container maxWidth="sm" sx={{ py: 4 }}>
            <Paper ref={certificateRef} elevation={0} sx={{ p: 4, position: "relative", textAlign: "center" }}>
              {/* Official Seal */}
              <Box
                sx={{
                  position: "absolute",
                  top: -14,
                  right: -14,
                  width: 78,
                  height: 78,
                  border: "6px double #1a3c34",
                  borderRadius: "50%",
                  bgcolor: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.52rem",
                  fontWeight: 800,
                  color: "#1a3c34",
                  boxShadow: "0 8px 24px rgba(26,60,52,0.22)",
                  zIndex: 10,
                }}
              >
                <Stamp style={{ fontSize: 24 }} />
                FAIRTRACE<br />PORTAL
              </Box>

              {/* Title */}
              <Typography variant="h3" sx={{ fontSize: "2.4rem", fontWeight: 700, color: "#1a3c34", mb: 1, fontFamily: '"Georgia", serif' }}>
                FAIRTRACE DASHBOARD
              </Typography>
              <Typography sx={{ color: "#2f855a", fontSize: "0.95rem", fontWeight: 600, letterSpacing: "2px", mb: 3 }}>
                Supply Chain • Traceability • Trust
              </Typography>

              <Divider sx={{ my: 2, borderColor: "#1a3c34" }} />

              {/* User Card */}
              {user && (
                <Box sx={{ mt: 2 }}>
                  <Avatar
                    sx={{
                      width: 90,
                      height: 90,
                      bgcolor: "#1a3c34",
                      fontSize: "2.5rem",
                      fontWeight: 800,
                      border: "5px double #2f855a",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    {user.name.charAt(0)}
                  </Avatar>

                  <Typography sx={{ fontFamily: '"Georgia", serif', fontSize: "1.6rem", fontWeight: 800, color: "#1a3c34" }}>
                    {user.name}
                  </Typography>

                  {roleConfig && (
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        bgcolor: roleConfig.bg,
                        color: roleConfig.color,
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        px: 2.5,
                        py: 1,
                        borderRadius: 1,
                        mt: 1.5,
                        border: `2px solid ${roleConfig.color}`,
                      }}
                    >
                      <roleConfig.icon size={18} />
                      {roleConfig.label}
                    </Box>
                  )}

                  {user.id && (
                    <Typography sx={{ fontSize: "0.85rem", color: "#666", mt: 1 }}>
                      ID: #{user.id}
                    </Typography>
                  )}
                </Box>
              )}

              <Divider sx={{ my: 2.5, borderColor: "#1a3c34" }} />

              {/* Auto-Redirect Message */}
              {user && user.role !== "unknown" && (
                <Alert severity="info" sx={{ mt: 2, fontWeight: 600, textAlign: "left" }}>
                  <strong>Redirecting</strong> to your {user.role.replace("_", " ")} portal in 1.5s...
                  <Box sx={{ mt: 1, fontSize: "0.9rem" }}>
                    <ArrowRight size={16} style={{ verticalAlign: "middle" }} />{" "}
                    {user.role === "transporter" && "View delivery requests"}
                    {user.role === "sacco_admin" && "Manage product approvals"}
                    {user.role === "farmer" && "Upload new products"}
                    {user.role === "consumer" && "Trace & support farmers"}
                  </Box>
                </Alert>
              )}

              {/* Fallback Buttons */}
              <Stack spacing={1.5} sx={{ mt: 3 }}>
                {user?.role === "transporter" && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Truck size={18} />}
                    href="/dashboard/transporter"
                    sx={{ bgcolor: "#2f855a", color: "#fff", fontWeight: 700 }}
                  >
                    Go to Transporter Portal
                  </Button>
                )}
                {user?.role === "sacco_admin" && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Package size={18} />}
                    href="/dashboard/sacco_admin"
                    sx={{ bgcolor: "#1565c0", color: "#fff", fontWeight: 700 }}
                  >
                    Go to Admin Portal
                  </Button>
                )}
                {user?.role === "unknown" && (
                  <Alert severity="warning" sx={{ fontWeight: 600 }}>
                    Role not recognized. Contact support.
                  </Alert>
                )}
              </Stack>

              {/* Download PDF */}
              <Box sx={{ mt: 3 }}>
                <Button
                  startIcon={<Stamp size={18} />}
                  onClick={handleDownloadPDF}
                  sx={{ color: "#1a3c34", border: "1px solid #1a3c34", fontWeight: 600 }}
                >
                  Download Dashboard Summary (PDF)
                </Button>
              </Box>
            </Paper>
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{ borderTop: "1px solid #1a3c34", bgcolor: "#fff" }}>
          <Footer />
        </Box>

        {/* Logout Button */}
        <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
          <Button
            variant="contained"
            startIcon={<LogOut size={18} />}
            onClick={handleLogout}
            sx={{ bgcolor: "#c62828", color: "#fff", fontWeight: 700, py: 1.5, px: 3, borderRadius: 0 }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
}