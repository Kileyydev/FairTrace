"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Container,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Divider,
  Paper,
  Tabs,
  Tab,
  TextField,
  Alert,
} from "@mui/material";
import { Download } from "@mui/icons-material";
import TopNavBar from "../../components/TopNavBar";
import Footer from "../../components/FooterSection";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Product {
  uid: string;
  title: string;
  status: string;
  pid: string;
  qr_code_data?: string;
  tx_hash?: string;
  proof?: string;
  public_signals?: any;
  farmer?: { id: string; name: string; email: string };
}

interface Consumer {
  name: string;
  phone: string;
  balance: number;
  token: string;
}

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
          padding: "8px 16px",
          minHeight: "40px",
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

const truncate = (str: string = "", start = 10, end = 6) =>
  str.length > start + end ? `${str.slice(0, start)}...${str.slice(-end)}` : str;

// Fixed: params is now a Promise
type PageProps = {
  params: Promise<{ uid: string }>;
};

export default function TracePage({ params }: PageProps) {
  const [uid, setUid] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);

  const [consumer, setConsumer] = useState<Consumer | null>(null);
  const [selectedPhone, setSelectedPhone] = useState("");
  const [pin, setPin] = useState("");
  const [tipAmount, setTipAmount] = useState("");
  const [tipSuccess, setTipSuccess] = useState<string | null>(null);
  const [tipError, setTipError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tipLoading, setTipLoading] = useState(false);

  const router = useRouter();
  const certificateRef = useRef<HTMLDivElement>(null);

  const isValidStatus = (status: string) => {
    const invalid = ["pending", "rejected"];
    return status && !invalid.includes(status.toLowerCase());
  };

  // Await params
  useEffect(() => {
    (async () => {
      try {
        const resolved = await params;
        setUid(resolved.uid);
      } catch (err) {
        setError("Invalid product link");
        setLoading(false);
      }
    })();
  }, [params]);

  // Load product and consumer session
  useEffect(() => {
    if (!uid) return;

    async function fetchProduct() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error("API URL not configured");

        const res = await fetch(`${apiUrl}/trace/${uid}/`);
        if (!res.ok) throw new Error("Failed to load product");

        setProduct(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();

    const saved = localStorage.getItem(`consumer_session`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setConsumer(parsed);
      setIsAuthenticated(true);
    }
  }, [uid]);

  const handleLogin = async () => {
    setTipError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("API URL missing");

      const res = await fetch(`${apiUrl}/consumer/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: selectedPhone.trim(),
          pin: pin.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTipError(data.detail || "Invalid phone or PIN");
        return;
      }

      setConsumer(data);
      setIsAuthenticated(true);
      localStorage.setItem(`consumer_session`, JSON.stringify(data));
    } catch {
      setTipError("Login failed. Check connection.");
    }
  };

  const handleTip = async () => {
    setTipError(null);
    setTipSuccess(null);
    setTipLoading(true);

    if (!consumer) {
      setTipError("Please login first");
      setTipLoading(false);
      return;
    }

    const amount = parseFloat(tipAmount);
    if (isNaN(amount) || amount <= 0) {
      setTipError("Enter a valid amount");
      setTipLoading(false);
      return;
    }

    if (amount > consumer.balance) {
      setTipError("Insufficient balance");
      setTipLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("API URL missing");

      const res = await fetch(`${apiUrl}/consumer/tip/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: consumer.phone,
          amount,
          product_uid: uid,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTipError(data.detail || "Transaction failed");
        setTipLoading(false);
        return;
      }

      const updatedConsumer = { ...consumer, balance: parseFloat(data.new_balance) };
      setConsumer(updatedConsumer);
      localStorage.setItem("consumer_session", JSON.stringify(updatedConsumer));

      setTipSuccess(
        `Tip sent! Tx: ${truncate(data.tx)} | New balance: ${data.new_balance} KSH`
      );
      setTipAmount("");
    } catch (err) {
      setTipError("Network error. Try again.");
    } finally {
      setTipLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("consumer_session");
    setConsumer(null);
    setIsAuthenticated(false);
    setSelectedPhone("");
    setPin("");
    setTipAmount("");
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current || !product) return;
    const canvas = await html2canvas(certificateRef.current, { scale: 2, backgroundColor: "#fff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`FairTrace_Certificate_${product.pid}.pdf`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#f8faf9" }}>
        <CircularProgress sx={{ color: "#1a3c34" }} size={48} />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: "100vh", bgcolor: "#f8faf9", display: "flex", flexDirection: "column" }}>
          <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1300, bgcolor: "#fff", borderBottom: "1px solid #1a3c34" }}>
            <TopNavBar />
          </Box>
          <Box sx={{ flex: 1, pt: "70px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Typography color="error" variant="h6" fontWeight={700}>{error || "Product not found"}</Typography>
          </Box>
          <Box sx={{ borderTop: "1px solid #1a3c34", bgcolor: "#fff" }}><Footer /></Box>
        </Box>
      </ThemeProvider>
    );
  }

  const valid = isValidStatus(product.status);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#f8faf9" }}>
        <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1300, bgcolor: "#fff", borderBottom: "1px solid #1a3c34" }}>
          <TopNavBar />
        </Box>

        <Box sx={{ flex: 1, pt: "70px", pb: 4 }}>
          <Container maxWidth="md" sx={{ py: 2 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 1 }}>
              <Tab label="Certificate" />
              {valid && product.farmer && <Tab label="Support Farmer" />}
            </Tabs>

            {/* CERTIFICATE TAB */}
            {tab === 0 && (
              <Paper ref={certificateRef} elevation={0} sx={{ p: 3, maxWidth: 640, mx: "auto", fontSize: "0.95rem" }}>
                {valid ? (
                  <>
                    <Typography variant="h3" sx={{ fontSize: "1.6rem", fontWeight: 700, color: "#1a3c34", textAlign: "center", mb: 1 }}>
                      FAIRTRACE CERTIFICATE OF COMPLIANCE
                    </Typography>
                    <Box
                      sx={{
                        position: "absolute",
                        top: 40,
                        right: 20,
                        width: 80,
                        height: 80,
                        border: "6px double #1a3c34",
                        borderRadius: "50%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#fff",
                        fontSize: "0.55rem",
                        fontWeight: 700,
                        color: "#1a3c34",
                      }}
                    >
                      SEAL<br />VERIFIED
                    </Box>

                    <Divider sx={{ my: 1, borderColor: "#1a3c34" }} />

                    <Box sx={{ lineHeight: 1.6, fontFamily: '"Courier New", monospace' }}>
                      <Typography><strong>Product ID:</strong> {product.pid}</Typography>
                      <Typography>
                        <strong>Status:</strong>
                        <Box component="span" sx={{ color: "#2f855a", fontWeight: 700 }}>
                          FairTrade Verified
                        </Box>
                      </Typography>
                      {product.tx_hash && <Typography><strong>Tx:</strong> {truncate(product.tx_hash)}</Typography>}
                      {product.proof && <Typography><strong>Proof:</strong> {truncate(product.proof, 10, 4)}</Typography>}
                      <Typography><strong>Issued:</strong> 2025-11-12</Typography>
                      <Typography><strong>Verified:</strong> Consumer Side (ZKP)</Typography>
                    </Box>

                    <Divider sx={{ my: 1.5, borderColor: "#1a3c34" }} />

                    <Typography
                      sx={{ fontStyle: "italic", color: "#333", textAlign: "center", fontSize: "0.95rem", mt: 1 }}
                    >
                      Meets FairTrade rules. Farmer data protected.
                    </Typography>

                    <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                      <Box>
                        <Divider sx={{ width: 100, borderColor: "#1a3c34" }} />
                        <Typography variant="caption">FairTrace Authority</Typography>
                      </Box>
                      <Box>
                        <Divider sx={{ width: 100, borderColor: "#1a3c34" }} />
                        <Typography variant="caption">2025-11-12</Typography>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <Typography variant="h5" sx={{ color: "#c62828", fontWeight: 700, mb: 1 }}>
                      Certificate Invalid
                    </Typography>
                    <Typography sx={{ fontSize: "0.95rem" }}>
                      Status: <strong>{product.status}</strong>
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}

            {/* SUPPORT FARMER TAB */}
            {tab === 1 && valid && product.farmer && (
              <Paper elevation={0} sx={{ p: 3, maxWidth: 400, mx: "auto", mt: 1 }}>
                <Typography variant="h6" sx={{ textAlign: "center", mb: 2, fontWeight: 600 }}>
                  Support {product.farmer.name}
                </Typography>

                {!isAuthenticated ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <TextField
                      label="Phone Number"
                      value={selectedPhone}
                      onChange={(e) => setSelectedPhone(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="PIN"
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      fullWidth
                    />
                    <Button onClick={handleLogin} sx={{ bgcolor: "#2f855a", color: "#fff" }}>
                      Login to Tip
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Typography sx={{ textAlign: "center", fontWeight: 600 }}>
                      Logged in: {consumer?.name} ({consumer?.phone})
                    </Typography>
                    <Typography sx={{ textAlign: "center", fontWeight: 600 }}>
                      Balance: {consumer?.balance} KSH
                    </Typography>
                    <TextField
                      label="Tip Amount (KSH)"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      type="number"
                      fullWidth
                    />
                    <Button
                      disabled={tipLoading}
                      onClick={handleTip}
                      sx={{ bgcolor: "#2f855a", color: "#fff" }}
                    >
                      {tipLoading ? "Processing..." : "Send Tip"}
                    </Button>
                    <Button onClick={handleLogout} sx={{ color: "#c62828", border: "1px solid #c62828" }}>
                      Logout
                    </Button>
                    <Button
                      onClick={() => router.push(`/farmer/products/${product.farmer?.id}`)}
                      sx={{ color: "#1a3c34", border: "1px solid #1a3c34" }}
                    >
                      Buy More Products
                    </Button>
                  </Box>
                )}

                {tipSuccess && <Alert severity="success" sx={{ mt: 1.5 }}>{tipSuccess}</Alert>}
                {tipError && <Alert severity="error" sx={{ mt: 1.5 }}>{tipError}</Alert>}
              </Paper>
            )}

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Button
                startIcon={<Download />}
                onClick={handleDownloadPDF}
                sx={{ mr: 1, color: "#1a3c34", border: "1px solid #1a3c34" }}
              >
                Download PDF
              </Button>
            </Box>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 0,
                  border: "1px solid #1a3c34",
                  width: "fit-content",
                  mx: "auto",
                }}
              >
                <Button fullWidth disabled sx={{ color: "#1a3c34", bgcolor: "#f0f0f0" }}>
                  Consumer
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>

        <Box sx={{ borderTop: "1px solid #1a3c34", bgcolor: "#fff" }}>
          <Footer />
        </Box>
      </Box>
    </ThemeProvider>
  );
}