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
  Chip,
} from "@mui/material";
import {
  Download as DownloadIcon,
  LocalShipping as TruckIcon,
  CheckCircle,
  Error as AlertCircleIcon,
} from "@mui/icons-material";
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

interface TransportEvent {
  transportId: string;
  fromLocation: string;
  toLocation: string;
  transporter: string;
  temperatureOk: boolean;
  timestamp: string;
  txHash: string;
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

type PageProps = {
  params: Promise<{ uid: string }>;
};

export default function TracePage({ params }: PageProps) {
  const [uid, setUid] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [transports, setTransports] = useState<TransportEvent[]>([]);
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

  useEffect(() => {
    if (!uid) return;

    async function fetchData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error("API URL not configured");

        const [productRes, transportRes] = await Promise.all([
          fetch(`${apiUrl}/trace/${uid}/`),
          fetch(`${apiUrl}/trace/${uid}/transports/`).catch(() => null),
        ]);

        if (!productRes.ok) throw new Error("Failed to load product");
        const productData = await productRes.json();
        setProduct(productData);

        if (transportRes && transportRes.ok) {
          const transportData = await transportRes.json();
          setTransports(transportData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    const saved = localStorage.getItem("consumer_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConsumer(parsed);
        setIsAuthenticated(true);
      } catch {}
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
        body: JSON.stringify({ phone: selectedPhone.trim(), pin: pin.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");

      setConsumer(data);
      setIsAuthenticated(true);
      localStorage.setItem("consumer_session", JSON.stringify(data));
    } catch {
      setTipError("Invalid phone or PIN");
    }
  };

  const handleTip = async () => {
    setTipError(null);
    setTipSuccess(null);
    setTipLoading(true);

    if (!consumer || !uid) {
      setTipError("Login required");
      setTipLoading(false);
      return;
    }

    const amount = parseFloat(tipAmount);
    if (isNaN(amount) || amount <= 0 || amount > consumer.balance) {
      setTipError("Invalid amount");
      setTipLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/consumer/tip/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: consumer.phone, amount, product_uid: uid }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Tip failed");

      const updated = { ...consumer, balance: parseFloat(data.new_balance) };
      setConsumer(updated);
      localStorage.setItem("consumer_session", JSON.stringify(updated));

      setTipSuccess(`Tip sent! Tx: ${truncate(data.tx)}`);
      setTipAmount("");
    } catch {
      setTipError("Transaction failed");
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
    const canvas = await html2canvas(certificateRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
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
          <TopNavBar />
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Typography color="error" variant="h6" fontWeight={700}>
              {error || "Product not found"}
            </Typography>
          </Box>
          <Footer />
        </Box>
      </ThemeProvider>
    );
  }

  const valid = isValidStatus(product.status);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#f8faf9" }}>
        <TopNavBar />

        <Box sx={{ flex: 1, pt: "70px", pb: 4 }}>
          <Container maxWidth="md" sx={{ py: 2 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 1 }}>
              <Tab label="Certificate" />
              {valid && product.farmer && <Tab label="Support Farmer" />}
            </Tabs>

            {/* CERTIFICATE TAB */}
            {tab === 0 && (
              <Paper ref={certificateRef} elevation={0} sx={{ p: 4, maxWidth: 720, mx: "auto", position: "relative" }}>
                {valid ? (
                  <>
                    <Typography variant="h3" sx={{ fontSize: "1.8rem", fontWeight: 700, color: "#1a3c34", textAlign: "center", mb: 2 }}>
                      FAIRTRACE CERTIFICATE OF COMPLIANCE
                    </Typography>

                    <Box
                      sx={{
                        position: "absolute",
                        top: 40,
                        right: 20,
                        width: 90,
                        height: 90,
                        border: "6px double #1a3c34",
                        borderRadius: "50%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#fff",
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        color: "#1a3c34",
                        zIndex: 1,
                      }}
                    >
                      SEAL<br />VERIFIED
                    </Box>

                    <Divider sx={{ my: 2, borderColor: "#1a3c34" }} />

                    <Box sx={{ lineHeight: 1.8, fontFamily: '"Courier New", monospace' }}>
                      <Typography><strong>Product ID:</strong> {product.pid}</Typography>
                      <Typography><strong>Product:</strong> {product.title}</Typography>
                      <Typography>
                        <strong>Status:</strong>{" "}
                        <Box component="span" sx={{ color: "#2f855a", fontWeight: 700 }}>FairTrade Verified</Box>
                      </Typography>
                      {product.tx_hash && <Typography><strong>Farm Tx:</strong> {truncate(product.tx_hash)}</Typography>}
                      <Typography><strong>Issued:</strong> {new Date().toLocaleDateString("en-KE")}</Typography>
                    </Box>

                    {/* TRANSPORT JOURNEY */}
                    {transports.length > 0 && (
                      <>
                        <Divider sx={{ my: 3, borderColor: "#1a3c34", borderStyle: "dashed" }} />
                        <Typography variant="h6" sx={{ textAlign: "center", fontWeight: 700, color: "#1a3c34", mb: 2 }}>
                          <TruckIcon sx={{ verticalAlign: "middle", mr: 1 }} fontSize="small" />
                          TRANSPORT JOURNEY
                        </Typography>
                        <Box sx={{ bgcolor: "#f8fff8", p: 3, border: "2px dashed #1a3c34", borderRadius: 2 }}>
                          {transports.map((t, i) => (
                            <Box key={i} sx={{ mb: 2, fontSize: "0.95rem", fontFamily: '"Courier New", monospace' }}>
                              <Typography><strong>Leg {i + 1}:</strong> {t.fromLocation} → {t.toLocation}</Typography>
                              <Typography><strong>Transporter:</strong> {t.transporter}</Typography>
                              <Typography>
                                <strong>Conditions:</strong>{" "}
                                {t.temperatureOk ? (
                                  <Chip label="Temperature OK" size="small" color="success" icon={<CheckCircle fontSize="small" />} />
                                ) : (
                                  <Chip label="Warning" size="small" color="error" icon={<AlertCircleIcon fontSize="small" />} />
                                )}
                              </Typography>
                              <Typography><strong>Timestamp:</strong> {new Date(t.timestamp).toLocaleString()}</Typography>
                              <Typography><strong>Tx Hash:</strong> {truncate(t.txHash)}</Typography>
                              {i < transports.length - 1 && <Divider sx={{ my: 1.5 }} />}
                            </Box>
                          ))}
                        </Box>
                      </>
                    )}

                    <Divider sx={{ my: 3, borderColor: "#1a3c34" }} />

                    <Typography sx={{ fontStyle: "italic", textAlign: "center", color: "#333", mb: 3 }}>
                      This product was transported under monitored conditions using FairTrace Transport Smart Contract.
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <Box>
                        <Divider sx={{ width: 120, borderColor: "#1a3c34" }} />
                        <Typography variant="caption">FairTrace Authority</Typography>
                      </Box>
                      <Box>
                        <Divider sx={{ width: 120, borderColor: "#1a3c34" }} />
                        <Typography variant="caption">{new Date().toLocaleDateString("en-KE")}</Typography>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <Typography variant="h5" color="error" fontWeight={700}>
                      Certificate Invalid
                    </Typography>
                    <Typography mt={1}>Status: <strong>{product.status}</strong></Typography>
                  </Box>
                )}
              </Paper>
            )}

            {/* SUPPORT FARMER TAB */}
            {tab === 1 && valid && product.farmer && (
              <Paper elevation={0} sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 3 }}>
                <Typography variant="h6" textAlign="center" fontWeight={600} mb={3}>
                  Support {product.farmer.name}
                </Typography>

                {!isAuthenticated ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField label="Phone Number" value={selectedPhone} onChange={(e) => setSelectedPhone(e.target.value)} fullWidth />
                    <TextField label="PIN" type="password" value={pin} onChange={(e) => setPin(e.target.value)} fullWidth />
                    <Button onClick={handleLogin} sx={{ bgcolor: "#2f855a", color: "#fff", "&:hover": { bgcolor: "#2f855a" } }}>
                      Login to Tip
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Typography textAlign="center" fontWeight={600}>
                      {consumer?.name} ({consumer?.phone})
                    </Typography>
                    <Typography textAlign="center" fontWeight={600}>
                      Balance: {consumer?.balance} KSH
                    </Typography>
                    <TextField label="Tip Amount (KSH)" type="number" value={tipAmount} onChange={(e) => setTipAmount(e.target.value)} fullWidth />
                    <Button disabled={tipLoading} onClick={handleTip} sx={{ bgcolor: "#2f855a", color: "#fff" }}>
                      {tipLoading ? "Sending..." : "Send Tip"}
                    </Button>
                    <Button onClick={handleLogout} variant="outlined" color="error">
                      Logout
                    </Button>
                  </Box>
                )}

                {tipSuccess && <Alert severity="success" sx={{ mt: 2 }}>{tipSuccess}</Alert>}
                {tipError && <Alert severity="error" sx={{ mt: 2 }}>{tipError}</Alert>}
              </Paper>
            )}

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Button
                startIcon={<DownloadIcon />}
                onClick={handleDownloadPDF}
                sx={{ color: "#1a3c34", border: "2px solid #1a3c34", fontWeight: 600 }}
              >
                Download Certificate PDF
              </Button>
            </Box>
          </Container>
        </Box>

        <Footer />
      </Box>
    </ThemeProvider>
  );
}