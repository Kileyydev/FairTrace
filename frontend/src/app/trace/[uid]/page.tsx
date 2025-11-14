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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import { Download, Print } from "@mui/icons-material";
import TopNavBar from "../../components/TopNavBar";
import Footer from "../../components/FooterSection";
import { useReactToPrint } from "react-to-print";
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
    MuiPaper: { styleOverrides: { root: { border: "2px solid #1a3c34", background: "#fff", boxShadow: "none" } } },
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

// 5 Pre-funded Consumer Accounts
const consumerAccounts = [
  { phone: "+254700000001", pin: "1234", balance: 5000, name: "Alice" },
  { phone: "+254700000002", pin: "5678", balance: 5000, name: "Bob" },
  { phone: "+254700000003", pin: "9012", balance: 5000, name: "Carol" },
  { phone: "+254700000004", pin: "3456", balance: 5000, name: "David" },
  { phone: "+254700000005", pin: "7890", balance: 5000, name: "Eve" },
];

export default function TracePage({ params }: { params: { uid: string } }) {
  const { uid } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [selectedPhone, setSelectedPhone] = useState("");
  const [pin, setPin] = useState("");
  const [balance, setBalance] = useState(0);
  const [tipAmount, setTipAmount] = useState("");
  const [tipSuccess, setTipSuccess] = useState<string | null>(null);
  const [tipError, setTipError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const certificateRef = useRef<HTMLDivElement>(null);

  const isValidStatus = (status: string) => {
    const invalid = ["pending", "rejected"];
    return status && !invalid.includes(status.toLowerCase());
  };

  useEffect(() => {
    async function fetchProduct() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error("API URL not configured");
        const url = `${apiUrl}/trace/${uid}/`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load product");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();

    // Load session
    const session = localStorage.getItem(`tip_session_${uid}`);
    if (session) {
      const { phone, balance } = JSON.parse(session);
      const account = consumerAccounts.find(a => a.phone === phone);
      if (account && balance <= account.balance) {
        setSelectedPhone(phone);
        setBalance(balance);
        setIsAuthenticated(true);
      }
    }
  }, [uid]);


  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    const canvas = await html2canvas(certificateRef.current, { scale: 2, backgroundColor: "#fff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`FairTrace_Certificate_${product?.pid}.pdf`);
  };

  const handleLogin = () => {
    setTipError(null);
    const account = consumerAccounts.find(a => a.phone === selectedPhone && a.pin === pin);
    if (!account) {
      setTipError("Invalid phone or PIN");
      return;
    }
    if (product?.farmer?.email && account.name.toLowerCase() === product.farmer.name.toLowerCase()) {
      setTipError("Farmer cannot tip themselves");
      return;
    }

    setBalance(account.balance);
    setIsAuthenticated(true);
    localStorage.setItem(`tip_session_${uid}`, JSON.stringify({ phone: selectedPhone, balance: account.balance }));
  };

  const handleTip = () => {
    setTipSuccess(null);
    setTipError(null);
    const amount = parseFloat(tipAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance) {
      setTipError("Invalid amount or insufficient balance");
      return;
    }

    const newBalance = balance - amount;
    setBalance(newBalance);
    localStorage.setItem(`tip_session_${uid}`, JSON.stringify({ phone: selectedPhone, balance: newBalance }));

    const fakeTx = `tx_${Math.random().toString(36).slice(2)}`;
    setTipSuccess(`Tip sent! Tx: ${truncate(fakeTx)} | New balance: ${newBalance} KSH`);
    setTipAmount("");
  };

  const handleLogout = () => {
    localStorage.removeItem(`tip_session_${uid}`);
    setIsAuthenticated(false);
    setBalance(0);
    setSelectedPhone("");
    setPin("");
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

            {tab === 0 && (
              <Paper ref={certificateRef} elevation={0} sx={{ p: 3, maxWidth: 640, mx: "auto", fontSize: "0.95rem" }}>
                {valid ? (
                  <>
                    <Typography variant="h3" sx={{ fontSize: "1.6rem", fontWeight: 700, color: "#1a3c34", textAlign: "center", mb: 1 }}>
                      FAIRTRACE CERTIFICATE OF COMPLIANCE
                    </Typography>
                    <Box sx={{ position: "absolute", top: 40, right: 20, width: 80, height: 80, border: "6px double #1a3c34", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "#fff", fontSize: "0.55rem", fontWeight: 700, color: "#1a3c34" }}>
                      SEAL<br />VERIFIED
                    </Box>
                    <Divider sx={{ my: 1, borderColor: "#1a3c34" }} />
                    <Box sx={{ lineHeight: 1.6, fontFamily: '"Courier New", monospace' }}>
                      <Typography><strong>Product ID:</strong> {product.pid}</Typography>
                      <Typography><strong>Status:</strong> <Box component="span" sx={{ color: "#2f855a", fontWeight: 700 }}>FairTrade Verified</Box></Typography>
                      {product.tx_hash && <Typography><strong>Tx:</strong> {truncate(product.tx_hash)}</Typography>}
                      {product.proof && <Typography><strong>Proof:</strong> {truncate(product.proof, 10, 4)}</Typography>}
                      <Typography><strong>Issued:</strong> 2025-11-12</Typography>
                      <Typography><strong>Verified:</strong> Consumer Side (ZKP)</Typography>
                    </Box>
                    <Divider sx={{ my: 1.5, borderColor: "#1a3c34" }} />
                    <Typography sx={{ fontStyle: "italic", color: "#333", textAlign: "center", fontSize: "0.95rem", mt: 1 }}>
                      Meets FairTrade rules. Farmer data protected.
                    </Typography>
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                      <Box><Divider sx={{ width: 100, borderColor: "#1a3c34" }} /><Typography variant="caption">FairTrace Authority</Typography></Box>
                      <Box><Divider sx={{ width: 100, borderColor: "#1a3c34" }} /><Typography variant="caption">2025-11-12</Typography></Box>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <Typography variant="h5" sx={{ color: "#c62828", fontWeight: 700, mb: 1 }}>Certificate Invalid</Typography>
                    <Typography sx={{ fontSize: "0.95rem" }}>Status: <strong>{product.status}</strong></Typography>
                  </Box>
                )}
              </Paper>
            )}

            {tab === 1 && valid && product.farmer && (
              <Paper elevation={0} sx={{ p: 3, maxWidth: 400, mx: "auto", mt: 1 }}>
                <Typography variant="h6" sx={{ textAlign: "center", mb: 2, fontWeight: 600 }}>
                  Support {product.farmer.name}
                </Typography>

                {!isAuthenticated ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <FormControl fullWidth>
                      <InputLabel>Phone Number</InputLabel>
                      <Select value={selectedPhone} onChange={(e) => setSelectedPhone(e.target.value)}>
                        {consumerAccounts.map((acc) => (
                          <MenuItem key={acc.phone} value={acc.phone}>
                            {acc.phone} ({acc.name})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography sx={{ textAlign: "center", fontWeight: 600 }}>
                      Logged in: {consumerAccounts.find(a => a.phone === selectedPhone)?.name} ({selectedPhone})
                    </Typography>
                    <Typography sx={{ textAlign: "center", fontWeight: 600 }}>
                      Balance: {balance} KSH
                    </Typography>
                    <TextField
                      label="Tip Amount (KSH)"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      type="number"
                      fullWidth
                    />
                    <Button onClick={handleTip} sx={{ bgcolor: "#2f855a", color: "#fff" }}>
                      Send Tip
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

                {tipSuccess && <Alert severity="success" sx={{ mt: 1 }}>{tipSuccess}</Alert>}
                {tipError && <Alert severity="error" sx={{ mt: 1 }}>{tipError}</Alert>}
              </Paper>
            )}

            <Box sx={{ mt: 2, textAlign: "center", className: "no-print" }}>
              <Button startIcon={<Download />} onClick={handleDownloadPDF} sx={{ mr: 1, color: "#1a3c34", border: "1px solid #1a3c34" }}>
                Download PDF
              </Button>
            </Box>

            <Box sx={{ mt: 2, textAlign: "center", className: "no-print" }}>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 0, border: "1px solid #1a3c34", width: "fit-content", mx: "auto" }}>
                <Button fullWidth onClick={() => router.push("/login")} sx={{ borderRight: "1px solid #1a3c34", color: "#2f855a", bgcolor: "#fff" }}>
                  Transporter
                </Button>
                <Button fullWidth disabled sx={{ color: "#1a3c34", bgcolor: "#f0f0f0" }}>
                  Consumer
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>

        <Box sx={{ borderTop: "1px solid #1a3c34", bgcolor: "#fff", className: "no-print" }}>
          <Footer />
        </Box>
      </Box>
    </ThemeProvider>
  );
}